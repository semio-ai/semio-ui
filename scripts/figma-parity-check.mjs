// Layer-1 Figma↔code parity — Button, TextField, Checkbox, Switch, ToggleSquare.
//
// Each Figma component implements a DELIBERATE, DOCUMENTED SUBSET of its code
// component (see packages/ui/docs/figma-design-system-mapping.md), not a 1:1
// mirror. So this check has two jobs per component:
//   1. Subset conformance — the Figma snapshot matches the agreed subset exactly
//      (catches Figma-side drift: a dropped state, a renamed axis, a lost binding).
//   2. Code consistency — the subset is a valid subset of the live code contract
//      (every Figma visual/variant exists in code; scoped-out props are consciously
//      scoped, not accidentally missing). Catches the other drift direction.
//
// Structural, not visual — zero rendering noise (unlike a Figma-vs-browser pixel
// diff). The CODE side is read live from source; the FIGMA side is a captured
// snapshot (figma/<component>-contract.json), refreshed from the file via the
// Figma MCP before running in CI.
//
// Usage: node scripts/figma-parity-check.mjs
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

const types = readFileSync(join(root, "src/types.ts"), "utf8");
const codeVariants = enumValues(types, "Variant");
const codeSizes = enumValues(types, "Size");
const readFigma = (name) => JSON.parse(readFileSync(join(root, "figma", `${name}-contract.json`), "utf8"));

// ── Button check ──────────────────────────────────────────────────────────
function checkButton() {
  const fails = [], notes = [];
  const buttonSrc = readFileSync(join(root, "src/buttons/button.tsx"), "utf8");
  const visualsMatch = buttonSrc.match(/visuals\?:\s*([^;]+);/);
  const codeVisuals = visualsMatch ? [...visualsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
  const codeHasDeemphasize = /\bdeemphasize\?:/.test(buttonSrc);

  const SUBSET = {
    visuals: ["default", "inverted", "inverted-border"],
    variants: ["default", "primary", "secondary", "tertiary", "error"],
    states: ["default", "hover", "focus", "disabled"],
    properties: ["Label", "Show label", "Left icon", "Right icon", "Icon left", "Icon right"],
  };
  const figma = readFigma("button");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));

  if (!eqSet(fo.Visual || [], SUBSET.visuals)) fails.push(`Figma Visual axis [${fo.Visual}] != subset [${SUBSET.visuals}]`);
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);
  for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!subsetOf(SUBSET.visuals, codeVisuals)) fails.push(`subset visuals [${SUBSET.visuals}] not all present in code visuals [${codeVisuals}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all present in code Variant enum [${codeVariants}]`);
  if (/\bleftIcon\?:/.test(buttonSrc) && !hasProp("Icon left")) fails.push("code `leftIcon` has no Figma 'Icon left' instance-swap");
  if (/\brightIcon\?:/.test(buttonSrc) && !hasProp("Icon right")) fails.push("code `rightIcon` has no Figma 'Icon right' instance-swap");
  if (fo.Size) fails.push("Figma has a Size axis — the subset models size as EXAMPLES, not an axis");
  else notes.push(`size scoped to examples (code sizes: [${codeSizes}])`);
  if (fprops.some((p) => /deemphasi/i.test(p))) fails.push("Figma has a 'deemphasize' property — the subset intentionally drops it");
  else if (codeHasDeemphasize) notes.push("code has `deemphasize` — intentionally omitted from the Figma subset");
  if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.fillBoundVar !== "color/primary/bg") fails.push(`Primary fill not bound to color/primary/bg — figma=${figma.sampleVariant.fillBoundVar}`);
  if (!figma.sampleVariant.textFontFamilyBound) fails.push("text fontFamily not bound to a variable in Figma");

  return { name: "Button", figma, fails, notes,
    summary: `Visual×Variant×State = ${(fo.Visual||[]).length}×${(fo.Variant||[]).length}×${(fo.State||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── TextField check ───────────────────────────────────────────────────────
function checkTextField() {
  const fails = [], notes = [];
  const tfSrc = readFileSync(join(root, "src/inputs/text-field.tsx"), "utf8");
  // outline?: "hidden" | "interact" | "always"
  const outlineMatch = tfSrc.match(/outline\?:\s*([^;]+);/);
  const codeOutlines = outlineMatch ? [...outlineMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];

  const SUBSET = {
    outline: ["interact", "always", "hidden"],
    variants: ["default", "primary", "secondary", "tertiary", "error"],
    states: ["default", "hover", "focus", "disabled"],
    properties: ["Placeholder", "Show icon", "Icon left"],
  };
  const figma = readFigma("textfield");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));

  // 1. Subset conformance.
  if (!eqSet(fo.Outline || [], SUBSET.outline)) fails.push(`Figma Outline axis [${fo.Outline}] != subset [${SUBSET.outline}]`);
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);
  for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);

  // 2. Code consistency.
  if (!eqSet(SUBSET.outline, codeOutlines)) fails.push(`subset outline [${SUBSET.outline}] != code outline union [${codeOutlines}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all present in code Variant enum [${codeVariants}]`);
  if (/\bicon\?:/.test(tfSrc) && !hasProp("Icon left")) fails.push("code `icon` has no Figma 'Icon left' instance-swap");
  if (/\bicon\?:/.test(tfSrc) && !hasProp("Show icon")) fails.push("code `icon` has no Figma 'Show icon' toggle");

  // 3. Conscious scope decisions.
  if (fo.Size) fails.push("Figma has a Size axis — the subset models size as EXAMPLES, not an axis");
  else notes.push(`size scoped to examples (code sizes: [${codeSizes}])`);
  for (const dropped of ["bg", "subtle", "onClear"]) {
    if (fprops.some((p) => new RegExp(dropped, "i").test(p))) notes.push(`Figma exposes '${dropped}' (subset had scoped it out)`);
  }
  notes.push("`onClear` modeled as intrinsic to State=focus (clear-X appears on focus), not a separate boolean — matches code peer-focus behavior");

  // 4. Structural fidelity of the sample variant (interact/primary/focus).
  if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px (rounded-xs) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.ringStrokeVar !== "color/primary/bg-hover") fails.push(`interact ring not bound to color/primary/bg-hover — figma=${figma.sampleVariant.ringStrokeVar}`);
  if (figma.sampleVariant.placeholderFillVar !== "color/content/muted") fails.push(`placeholder not bound to color/content/muted — figma=${figma.sampleVariant.placeholderFillVar}`);
  if (!figma.sampleVariant.fontFamilyBound) fails.push("text fontFamily not bound to a variable in Figma (hardcoded font)");

  return { name: "TextField", figma, fails, notes,
    summary: `Outline×Variant×State = ${(fo.Outline||[]).length}×${(fo.Variant||[]).length}×${(fo.State||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── Checkbox check ────────────────────────────────────────────────────────
function checkCheckbox() {
  const fails = [], notes = [];
  const cbSrc = readFileSync(join(root, "src/inputs/checkbox.tsx"), "utf8");

  const SUBSET = {
    // Checkbox stories exercise the status variants too (success/warning/info),
    // so its documented subset spans all 8 Variant enum members, unlike the
    // action-only Button/TextField subsets.
    variants: ["default", "primary", "secondary", "tertiary", "error", "success", "warning", "info"],
    states: ["unchecked", "checked", "disabled"],
  };
  const figma = readFigma("checkbox");
  const fo = figma.variantOptions || {};

  // 1. Subset conformance.
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);

  // 2. Code consistency.
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all in code Variant enum [${codeVariants}]`);
  if (!/\bchecked:\s*boolean/.test(cbSrc)) fails.push("code Checkbox lost its `checked: boolean` prop (State axis models checked/unchecked)");
  if (!/\bdisabled\??:/.test(cbSrc)) fails.push("code Checkbox lost its `disabled` prop (State=disabled)");

  // 3. Conscious scope.
  if (fo.Size) fails.push("Figma has a Size axis — the subset models size as EXAMPLES, not an axis");
  else notes.push(`size scoped to examples (code sizes: [${codeSizes}])`);
  notes.push("hover/focus (appearing-outline ring) modeled via interactivity, not a State axis value");

  // 4. Structural fidelity of the sample (primary/checked).
  if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px (rounded-xs) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.boxFillVar !== "color/primary/bg") fails.push(`checked box not bound to color/primary/bg — figma=${figma.sampleVariant.boxFillVar}`);
  if (figma.sampleVariant.uncheckedFillVar !== "color/surface/inset") fails.push(`unchecked box not bound to color/surface/inset — figma=${figma.sampleVariant.uncheckedFillVar}`);

  return { name: "Checkbox", figma, fails, notes,
    summary: `Variant×State = ${(fo.Variant||[]).length}×${(fo.State||[]).length} · props=[${(figma.properties||[]).join(", ")||"(variant axes only)"}]` };
}

// ── Switch check ──────────────────────────────────────────────────────────
function checkSwitch() {
  const fails = [], notes = [];
  const swSrc = readFileSync(join(root, "src/inputs/switch.tsx"), "utf8");

  const SUBSET = {
    variants: ["default", "primary", "secondary", "tertiary", "error"],
    states: ["off", "on", "disabled"],
  };
  const figma = readFigma("switch");
  const fo = figma.variantOptions || {};

  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all in code Variant enum [${codeVariants}]`);
  if (!/\bchecked:\s*boolean/.test(swSrc)) fails.push("code Switch lost its `checked: boolean` prop (State off/on)");
  if (!/\bdisabled\??:/.test(swSrc)) fails.push("code Switch lost its `disabled` prop (State=disabled)");
  if (fo.Size) fails.push("Figma has a Size axis — the subset models size as EXAMPLES, not an axis");
  else notes.push(`size scoped to examples (code sizes: [${codeSizes}])`);
  notes.push("track uses variant-checkbox-bg (off→surface/inset, on→variant/bg); hover/focus ring via interactivity");
  if (figma.sampleVariant.cornerRadius !== 12) fails.push(`track radius differs — code=rounded-full figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.trackFillVar !== "color/primary/bg") fails.push(`on track not bound to color/primary/bg — figma=${figma.sampleVariant.trackFillVar}`);
  if (figma.sampleVariant.offTrackFillVar !== "color/surface/inset") fails.push(`off track not bound to color/surface/inset — figma=${figma.sampleVariant.offTrackFillVar}`);

  return { name: "Switch", figma, fails, notes,
    summary: `Variant×State = ${(fo.Variant||[]).length}×${(fo.State||[]).length} · props=[(variant axes only)]` };
}

// ── ToggleSquare check ────────────────────────────────────────────────────
function checkToggleSquare() {
  const fails = [], notes = [];
  const tsSrc = readFileSync(join(root, "src/inputs/toggle-square.tsx"), "utf8");

  const SUBSET = {
    variants: ["default", "primary", "secondary", "tertiary", "error"],
    states: ["off", "on", "partial", "disabled"],
    properties: ["Icon"],
  };
  const figma = readFigma("togglesquare");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));

  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);
  for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all in code Variant enum [${codeVariants}]`);
  // tri-state value: boolean | "partial"
  if (!/value:\s*boolean\s*\|\s*"partial"/.test(tsSrc)) fails.push("code ToggleSquare lost its tri-state `value: boolean | \"partial\"` (State off/on/partial)");
  if (/\bchildren\?:/.test(tsSrc) && !hasProp("Icon")) fails.push("code `children` (icon) has no Figma 'Icon' instance-swap");
  if (fo.Size) fails.push("Figma has a Size axis — the subset models size as EXAMPLES, not an axis");
  else notes.push(`size scoped to examples (code sizes: [${codeSizes}])`);
  notes.push("partial = indeterminate (inset colored border); hover/focus ring via interactivity");
  if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px (rounded-xs) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.bgFillVar !== "color/primary/bg") fails.push(`on bg not bound to color/primary/bg — figma=${figma.sampleVariant.bgFillVar}`);

  return { name: "ToggleSquare", figma, fails, notes,
    summary: `Variant×State = ${(fo.Variant||[]).length}×${(fo.State||[]).length} · props=[${fprops.join(", ")}]` };
}

const results = [checkButton(), checkTextField(), checkCheckbox(), checkSwitch(), checkToggleSquare()];
let anyFail = false;
console.log(`code: variants=[${codeVariants}] · sizes=[${codeSizes}]\n`);
for (const r of results) {
  console.log(`Figma↔code parity — ${r.name} subset (snapshot: ${r.figma.capturedAt})`);
  console.log(`  figma subset: ${r.summary}`);
  for (const n of r.notes) console.log(`  · ${n}`);
  if (r.fails.length === 0) {
    console.log(`  ✓ PASS — ${r.name} matches the agreed subset and the subset is consistent with code\n`);
  } else {
    anyFail = true;
    console.log(`  ✗ FAIL — ${r.fails.length} mismatch(es):`);
    for (const f of r.fails) console.log("    - " + f);
    console.log("");
  }
}
process.exit(anyFail ? 1 : 0);
