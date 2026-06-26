// Layer-1 Figma↔code parity — Button (SEM-167).
//
// The Figma Button implements a DELIBERATE, DOCUMENTED SUBSET of the code
// component (see packages/ui/docs/figma-design-system-mapping.md), not a 1:1
// mirror. So this check has two jobs:
//   1. Subset conformance — the Figma snapshot matches the agreed subset exactly
//      (catches Figma-side drift: a dropped state, a renamed axis, a lost binding).
//   2. Code consistency — the subset is a valid subset of the live code contract
//      (every Figma visual/variant exists in code; size & deemphasize are
//      consciously scoped out, not accidentally missing). This catches the other
//      drift direction: code grows a new variant/visual and the subset silently
//      falls behind.
//
// Structural, not visual — zero rendering noise (unlike a Figma-vs-browser pixel
// diff). The CODE side is read live from source; the FIGMA side is a captured
// snapshot (figma/button-contract.json), refreshed from the file via the Figma
// MCP before running in CI.
//
// Usage: node scripts/figma-parity-check.mjs [path-to-figma-contract.json]
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// enum VALUES (the css-class strings, e.g. Primary = "primary"), which is what
// the Figma axes use — not the member names.
const enumValues = (src, name) => {
  const m = src.match(new RegExp(`export enum ${name}\\s*{([\\s\\S]*?)}`));
  return m ? [...m[1].matchAll(/=\s*"([^"]+)"/g)].map((x) => x[1]) : [];
};
const eqSet = (a, b) => { const B = new Set(b); return a.length === b.length && a.every((x) => B.has(x)); };
const subsetOf = (sub, sup) => sub.every((x) => sup.includes(x));

// The agreed subset (kept in sync with figma-design-system-mapping.md). cta /
// list-item are documented as single EXAMPLES, not a Visual axis option; size is
// demonstrated as examples, not an axis; deemphasize is dropped.
const SUBSET = {
  visuals: ["default", "inverted", "inverted-border"],
  variants: ["default", "primary", "secondary", "tertiary", "error"],
  states: ["default", "hover", "focus", "disabled"],
  properties: ["Label", "Show label", "Icon left", "Icon right"],
};

const types = readFileSync(join(root, "src/types.ts"), "utf8");
const buttonSrc = readFileSync(join(root, "src/buttons/button.tsx"), "utf8");
const fixturePath = process.argv[2] || join(root, "figma", "button-contract.json");
const figma = JSON.parse(readFileSync(fixturePath, "utf8"));

const codeVariants = enumValues(types, "Variant");
const codeSizes = enumValues(types, "Size");
const visualsMatch = buttonSrc.match(/visuals\?:\s*([^;]+);/);
const codeVisuals = visualsMatch ? [...visualsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
const codeHasDeemphasize = /\bdeemphasize\?:/.test(buttonSrc);

const fo = figma.variantOptions || {};
const fprops = figma.properties || [];
const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));

const fails = [];
const notes = [];

// 1. Subset conformance — Figma axes/props match the agreed subset exactly.
if (!eqSet(fo.Visual || [], SUBSET.visuals)) fails.push(`Figma Visual axis [${fo.Visual}] != subset [${SUBSET.visuals}]`);
if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);
for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);

// 2. Code consistency — the subset must be valid against the live code contract.
if (!subsetOf(SUBSET.visuals, codeVisuals)) fails.push(`subset visuals [${SUBSET.visuals}] not all present in code visuals [${codeVisuals}]`);
if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all present in code Variant enum [${codeVariants}]`);
if (/\bleftIcon\?:/.test(buttonSrc) && !hasProp("Icon left")) fails.push("code `leftIcon` has no Figma 'Icon left' instance-swap");
if (/\brightIcon\?:/.test(buttonSrc) && !hasProp("Icon right")) fails.push("code `rightIcon` has no Figma 'Icon right' instance-swap");

// 3. Conscious scope decisions — assert they stay conscious (not silently broken).
if (fo.Size) fails.push("Figma has a Size axis — the subset models size as EXAMPLES, not an axis (drop it or update the subset)");
else notes.push(`size scoped to examples (code sizes: [${codeSizes}]; Figma demos Md/Sm/Xs/fit on the Examples page)`);
if (fprops.some((p) => /deemphasi/i.test(p))) fails.push("Figma has a 'deemphasize' property — the subset intentionally drops it");
else if (codeHasDeemphasize) notes.push("code has `deemphasize` — intentionally omitted from the Figma subset");
const extraVisuals = codeVisuals.filter((v) => !SUBSET.visuals.includes(v));
if (extraVisuals.length) notes.push(`code visuals not in the axis (documented as single examples): [${extraVisuals}]`);

// 4. Structural fidelity of a sample variant.
if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px (rounded-xs) figma=${figma.sampleVariant.cornerRadius}px`);
if (figma.sampleVariant.fillBoundVar !== "color/primary/bg") fails.push(`Primary fill not bound to color/primary/bg — figma=${figma.sampleVariant.fillBoundVar}`);
if (!figma.sampleVariant.textFontFamilyBound) fails.push("text fontFamily not bound to a variable in Figma (hardcoded font)");

console.log(`Figma↔code parity — Button subset (figma snapshot: ${figma.capturedAt})`);
console.log(`  code: variants=[${codeVariants}] · visuals=[${codeVisuals}] · sizes=[${codeSizes}] · deemphasize=${codeHasDeemphasize}`);
console.log(`  figma subset: Visual×Variant×State = ${(fo.Visual || []).length}×${(fo.Variant || []).length}×${(fo.State || []).length} · props=[${fprops.join(", ")}]`);
for (const n of notes) console.log(`  · ${n}`);
if (fails.length === 0) {
  console.log("  ✓ PASS — Figma matches the agreed subset and the subset is consistent with code");
  process.exit(0);
}
console.log(`  ✗ FAIL — ${fails.length} mismatch(es):`);
for (const f of fails) console.log("    - " + f);
process.exit(1);
