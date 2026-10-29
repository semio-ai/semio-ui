// Renders every icon in the **composed app registry** to a normalized SVG string,
// keyed by registry key. Output feeds the Figma icon-library build (SEM-167 /
// STUDIO-11) and is regenerable as the registries change. Uniform across sources
// (Tabler / Solar / semio-custom / role keys) because they all render <svg> via React.
//
// Composed set = defaultIconRegistry (@semio/ui) ∪ animationIconRegistry
// (@semio/timeline-editor) ∪ studioIconRegistry (apps/studio), resolved studio > animation
// > default to match the app's `<IconProvider>` composition. This is tooling, so it
// deliberately reaches across package boundaries to assemble the real app icon set.
//
// We bundle a small in-memory entry (esbuild) that imports the three registry modules
// rather than the built package barrels — esbuild handles the CJS-interop deps (lodash
// etc.) that don't load under plain Node ESM, and needs no prior `npm run build`.
//
// Usage:
//   node scripts/generate-icon-svgs.mjs            # composed app set (default)
//   node scripts/generate-icon-svgs.mjs --default  # default registry only
//   node scripts/generate-icon-svgs.mjs --out-dir <path>  # write outputs to <path> instead
//                                                          # (a staleness check's temp dir)
import { writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const DEFAULT_ONLY = process.argv.includes("--default");
const outDirIndex = process.argv.indexOf("--out-dir");
// All Figma bridge artifacts live under packages/ui/figma/ (committed manifest +
// gitignored generated SVGs). The scripts stay in scripts/; only outputs go here.
// `--out-dir` redirects every output under a caller-supplied root, so a staleness
// check can regenerate into a temp dir without touching the real one.
const FIGMA_DIR = outDirIndex >= 0 ? process.argv[outDirIndex + 1] : join(root, "figma");
const OUT = join(FIGMA_DIR, "icon-svgs.generated.json");
// Individual files for Figma import (multi-select drag → one component per file,
// named by key). Regenerable; gitignored.
const SVG_DIR = join(FIGMA_DIR, "icon-svgs");

// A composed entry: imports the three registry modules and exports the resolved
// registry + the default key set (so the Figma build knows which keys are new).
// Per-process temp names so concurrent/restarted runs can't clobber each other's
// entry/bundle (the `finally` below removes them). They must live in scripts/ — not
// /tmp — so the externalized react/react-dom resolve from node_modules.
const ENTRY = join(here, `.registry-entry.${process.pid}.ts`);
const entrySrc = DEFAULT_ONLY
  ? `import { defaultIconRegistry } from "../src/icons/registry/default-registry";
     export const registry = defaultIconRegistry;
     export const defaultKeys = Object.keys(defaultIconRegistry);
     export const animationKeys = [];
     export const studioKeys = [];`
  : `import { defaultIconRegistry } from "../src/icons/registry/default-registry";
     import { animationIconRegistry } from "../../timeline-editor/src/icons/registry";
     import { studioIconRegistry } from "../../../apps/studio/src/icons/registry";
     export const defaultKeys = Object.keys(defaultIconRegistry);
     export const animationKeys = Object.keys(animationIconRegistry);
     export const studioKeys = Object.keys(studioIconRegistry);
     export const registry = { ...defaultIconRegistry, ...animationIconRegistry, ...studioIconRegistry };`;
writeFileSync(ENTRY, entrySrc);

// Bundle to a temp **CJS** file: the composed registries pull in the @semio/ui barrel,
// which transitively uses CJS deps with dynamic `require()` (e.g. object-inspect →
// require("util")). An ESM bundle can't shim those ("Dynamic require not supported");
// a CJS bundle requires node builtins natively. `react`/`react-dom` stay external (the
// rendered elements must share react-dom/server's React instance; Node dedupes the CJS
// module between this file's `import` and the bundle's `require`).
const TMP = join(here, `.registry-bundle.${process.pid}.cjs`);
let registry, defaultKeys, animationKeys, studioKeys;
try {
  await esbuild.build({
    entryPoints: [ENTRY],
    bundle: true,
    format: "cjs",
    platform: "node",
    jsx: "automatic",
    external: ["react", "react-dom"],
    mainFields: ["module", "main"],
    // `source` first so `@semio/ui` resolves from `src/` rather than `dist/` — this
    // script then needs no prior `turbo run build`, matching every other vitest/tooling
    // entry point in the repo (all pinned to the `source` condition for the same reason).
    conditions: ["source", "import", "module", "default"],
    outfile: TMP,
    logLevel: "silent",
  });
  const mod = await import(pathToFileURL(TMP).href);
  registry = mod.registry ?? mod.default?.registry;
  defaultKeys = mod.defaultKeys ?? mod.default?.defaultKeys;
  animationKeys = mod.animationKeys ?? mod.default?.animationKeys ?? [];
  studioKeys = mod.studioKeys ?? mod.default?.studioKeys ?? [];
} finally {
  rmSync(TMP, { force: true });
  rmSync(ENTRY, { force: true });
}

// Figma's createNodeFromSvg wants concrete px width/height; normalize to 24 while
// preserving the viewBox so the artwork scales correctly.
function normalize(svg) {
  let s = svg;
  // Figma imports the SVG without the app stylesheet, so Solar's duotone
  // presentation needs concrete opacity attributes on the exported shapes.
  if (/\bclass="[^"]*\bicon-solar\b/.test(s)) {
    const inverted = /\bclass="[^"]*\bicon-duotone-inverted\b/.test(s);
    let depth = 0;
    s = s.replace(/<\/?[a-z][^>]*>/gi, (tag) => {
      if (tag.startsWith("</")) {
        depth -= 1;
        return tag;
      }
      let rendered = tag.replace(/\bopacity="0\.5"/g, `opacity="${inverted ? "1" : "0.6"}"`);
      if (
        inverted &&
        depth === 1 &&
        /^<(?:path|circle|rect|line|polyline|polygon|ellipse|g)\b/i.test(tag) &&
        !/\bopacity=/.test(tag)
      ) {
        rendered = rendered.replace(/>$/, ' opacity="0.6">');
      }
      if (!tag.endsWith("/>")) depth += 1;
      return rendered;
    });
  }
  s = /\bwidth="/.test(s) ? s.replace(/\bwidth="[^"]*"/, 'width="24"') : s.replace("<svg", '<svg width="24"');
  s = /\bheight="/.test(s) ? s.replace(/\bheight="[^"]*"/, 'height="24"') : s.replace("<svg", '<svg height="24"');
  return s;
}

const manifest = {};
const skipped = [];
for (const [key, Comp] of Object.entries(registry)) {
  try {
    const svg = renderToStaticMarkup(createElement(Comp));
    if (!svg || !svg.includes("<svg")) {
      skipped.push([key, "no <svg> rendered"]);
      continue;
    }
    manifest[key] = normalize(svg);
  } catch (e) {
    skipped.push([key, String(e)]);
  }
}

mkdirSync(FIGMA_DIR, { recursive: true });
writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)  }\n`);
// Rebuilt from scratch each run: a renamed or retired key must not leave its old export
// behind for a designer to import by mistake — `mkdir` alone only adds files, so a
// previous run's SVGs for keys the registry no longer has would otherwise persist
// indefinitely in a long-lived checkout.
rmSync(SVG_DIR, { recursive: true, force: true });
mkdirSync(SVG_DIR, { recursive: true });
for (const [key, svg] of Object.entries(manifest)) writeFileSync(join(SVG_DIR, `${key}.svg`), `${svg  }\n`);

const defaultSet = new Set(defaultKeys);
const newKeys = Object.keys(manifest).filter((k) => !defaultSet.has(k));
writeFileSync(join(FIGMA_DIR, "icon-svgs.new-keys.json"), `${JSON.stringify(newKeys, null, 2)  }\n`);

// Code-side Code-Connect mapping (COMMITTED, not gitignored): the durable
// Figma→code translation table the agent/dev follows on the Professional plan,
// standing in for Code Connect (Org/Enterprise-gated). Contract: registry key ==
// Figma component name (`Icon/<key>`) == code usage (`<Icon name="<key>" />`).
// Source = the registry that wins resolution (studio > animation > default).
const animSet = new Set(animationKeys);
const studioSet = new Set(studioKeys);
const sourceOf = (k) => (studioSet.has(k) ? "studio" : animSet.has(k) ? "animation" : "default");
const codeMap = Object.keys(registry)
  .sort()
  .map((k) => ({ key: k, source: sourceOf(k), figmaComponent: `Icon/${k}`, code: `<Icon name="${k}" />` }));
const mapManifest = {
  contract: "registry key == Figma component name (Icon/<key>) == code usage (<Icon name>)",
  generatedFrom: DEFAULT_ONLY ? "default" : "default + animation + studio (composed app set)",
  count: codeMap.length,
  icons: codeMap,
};
const MAP_OUT = join(FIGMA_DIR, "icon-manifest.json");
writeFileSync(MAP_OUT, `${JSON.stringify(mapManifest, null, 2)  }\n`);

console.log(`${DEFAULT_ONLY ? "default" : "composed"} set: rendered ${Object.keys(manifest).length} icons → ${OUT}`);
console.log(`  default keys: ${defaultKeys.length} · new (animation+studio): ${newKeys.length}`);
console.log(`Wrote ${Object.keys(manifest).length} SVG files → ${SVG_DIR}/ (Figma import)`);
console.log(`Wrote new-key list (${newKeys.length}) → figma/icon-svgs.new-keys.json`);
console.log(`Wrote code↔Figma manifest (${codeMap.length}) → figma/icon-manifest.json`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  for (const [k, why] of skipped) console.log(`  ${k}: ${why}`);
}
