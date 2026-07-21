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

// ── Chip check ────────────────────────────────────────────────────────────
function checkChip() {
  const fails = [], notes = [];
  const chipSrc = readFileSync(join(root, "src/chip.tsx"), "utf8");

  const SUBSET = {
    variants: ["default", "primary", "secondary", "tertiary", "error", "success", "warning", "info"],
    properties: ["Label", "Show icon", "Icon", "Show delete"],
  };
  const figma = readFigma("chip");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));

  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all in code Variant enum [${codeVariants}]`);
  if (/\bicon\?:/.test(chipSrc) && !hasProp("Icon")) fails.push("code `icon` has no Figma 'Icon' instance-swap");
  if (/\bonDelete\?:/.test(chipSrc) && !hasProp("Show delete")) fails.push("code `onDelete` has no Figma 'Show delete' toggle");
  if (fo.State) fails.push("Figma has a State axis — Chip is a static badge (no interactive-state axis)");
  else notes.push("no State axis — Chip is a static badge (hover bg-shift via interactivity if added later)");
  notes.push(`size scoped to examples (code sizes: [${codeSizes}])`);
  if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px (rounded-xs) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.pillFillVar !== "color/primary/bg") fails.push(`pill fill not bound to color/primary/bg — figma=${figma.sampleVariant.pillFillVar}`);
  // Geometry guard: the icon/delete chips are `sized-inner-group-item` (h-7 w-7 =
  // 28×28 square) — catches the HUG-collapse regression where they render as tall
  // rectangles (16×28) instead of squares.
  const box = figma.sampleVariant.iconBoxSize || [];
  if (box[0] !== 28 || box[1] !== 28) fails.push(`icon/delete box not 28×28 square (sized-inner-group-item md) — figma=${JSON.stringify(box)}`);

  return { name: "Chip", figma, fails, notes,
    summary: `Variant = ${(fo.Variant||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── Progress (bar) check ──────────────────────────────────────────────────
function checkProgress() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/feedback/progress.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error", "success", "warning", "info"] };
  const figma = readFigma("progress");
  const fo = figma.variantOptions || {};
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (!/\bprogress:\s*number/.test(src)) fails.push("code Progress lost its `progress: number` prop");
  notes.push("progress value is a runtime number — rendered as a fixed ~60% demo, not an axis; size scoped to examples");
  if (figma.sampleVariant.cornerRadius !== 4) fails.push(`corner radius differs — code=rounded-sm(4) figma=${figma.sampleVariant.cornerRadius}`);
  if (figma.sampleVariant.indicatorFillVar !== "color/primary/bg") fails.push(`indicator not bound to color/primary/bg — figma=${figma.sampleVariant.indicatorFillVar}`);
  return { name: "Progress", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[(variant axes only)]` };
}

// ── ProgressCircle check ──────────────────────────────────────────────────
function checkProgressCircle() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/feedback/progress.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error", "success", "warning", "info"], properties: ["Show icon", "Icon"] };
  const figma = readFigma("progresscircle");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants [${SUBSET.variants}] not all in code Variant enum [${codeVariants}]`);
  for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (/ProgressCircleProps[\s\S]*?\bicon\?:/.test(src) && !hasProp("Icon")) fails.push("code ProgressCircle `icon` has no Figma 'Icon' instance-swap");
  notes.push("ring uses arcData donut segments (track + ~60% demo arc); size scoped to examples");
  if (figma.sampleVariant.arcFillVar !== "color/primary/bg") fails.push(`arc not bound to color/primary/bg — figma=${figma.sampleVariant.arcFillVar}`);
  return { name: "ProgressCircle", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── Status check ──────────────────────────────────────────────────────────
function checkStatus() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/feedback/status.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error", "success", "warning", "info"] };
  const figma = readFigma("status");
  const fo = figma.variantOptions || {};
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (!/placement/.test(src)) notes.push("placement omitted from Figma (contextual positioning, not a variant)");
  notes.push("dot indicator modeled; text/count mode shown as an example; size scoped to examples");
  if (figma.sampleVariant.dotFillVar !== "color/primary/bg") fails.push(`dot fill not bound to color/primary/bg — figma=${figma.sampleVariant.dotFillVar}`);
  if (figma.sampleVariant.ringVar !== "color/surface/inset") fails.push(`ring not bound to color/surface/inset (= neutral-200/800) — figma=${figma.sampleVariant.ringVar}`);
  return { name: "Status", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[(variant axes only)]` };
}

// ── NestedItem check ──────────────────────────────────────────────────────
function checkNestedItem() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/nested-elements/item.tsx"), "utf8");
  const SUBSET = {
    // menus mostly use the default variant; error = destructive rows. The full
    // Variant enum is available in code — this is a deliberate common-pattern subset.
    variants: ["default", "primary", "error"],
    states: ["default", "highlighted", "disabled"],
    properties: ["Label", "Show icon", "Icon", "Show shortcut"],
  };
  const figma = readFigma("nesteditem");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!eqSet(fo.State || [], SUBSET.states)) fails.push(`Figma State axis [${fo.State}] != subset [${SUBSET.states}]`);
  for (const need of SUBSET.properties) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (/\bleft\b/.test(src) && !hasProp("Icon")) fails.push("code `left` icon slot has no Figma 'Icon' instance-swap");
  notes.push("highlighted = data-highlighted interaction (50% accent bg + fg text); `right` slot is arbitrary JSX, shown as an illustrative shortcut");
  if (figma.sampleVariant.cornerRadius !== 2) fails.push(`corner radius differs — code=2px (rounded-xs) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.accentVar !== "color/default/bg-hover") fails.push(`default accent not bound to color/default/bg-hover — figma=${figma.sampleVariant.accentVar}`);
  return { name: "NestedItem", figma, fails, notes, summary: `Variant×State = ${(fo.Variant||[]).length}×${(fo.State||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── Nested sub-types (Radio / Checkbox / Select) ──────────────────────────
// Thin variations on the NestedItem row — same chrome + a left selection
// indicator. Compact per-component checks: expected 2-state axis + Label prop +
// the accent binding (guards the indicator/accent from drifting).
function checkNestedSubtypes() {
  const specs = [
    { name: "NestedRadio", file: "nestedradio", states: ["unselected", "selected"] },
    { name: "NestedCheckbox", file: "nestedcheckbox", states: ["unchecked", "checked"] },
    { name: "NestedSelect", file: "nestedselect", states: ["unselected", "selected"] },
  ];
  return specs.map(({ name, file, states }) => {
    const fails = [], notes = ["NestedItem row chrome + a left selection indicator (shown when selected)"];
    const figma = readFigma(file);
    const fo = figma.variantOptions || {};
    const fprops = figma.properties || [];
    if (!eqSet(fo.State || [], states)) fails.push(`Figma State axis [${fo.State}] != [${states}]`);
    if (!fprops.some((p) => p === "Label" || p.startsWith("Label#"))) fails.push("missing Label property");
    if (figma.sampleVariant.accentVar !== "color/default/bg-hover") fails.push(`accent not bound to color/default/bg-hover — figma=${figma.sampleVariant.accentVar}`);
    return { name, figma, fails, notes, summary: `State = [${(fo.State||[]).join(", ")}] · indicator=${figma.sampleVariant.indicator} · props=[${fprops.join(", ")}]` };
  });
}

// ── Tabs check ────────────────────────────────────────────────────────────
function checkTabs() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/layouts/tabs.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error"] };
  const figma = readFigma("tabs");
  const fo = figma.variantOptions || {};
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (!/variant-static-bg-25/.test(src)) fails.push("code Tabs indicator lost `variant-static-bg-25`");
  notes.push("active-tab indicator = variant/bg @ 25% + variant border; visuals/size are examples; SidebarModal/TabbedModal compose from Modal + this row in Figma");
  if (figma.sampleVariant.containerFillVar !== "color/surface/deep-inset") fails.push(`container not bound to color/surface/deep-inset — figma=${figma.sampleVariant.containerFillVar}`);
  if (figma.sampleVariant.indicatorFillVar !== "color/default/bg") fails.push(`active indicator not bound to color/default/bg — figma=${figma.sampleVariant.indicatorFillVar}`);
  return { name: "Tabs", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[(variant axes only)]` };
}

// ── Tooltip check ─────────────────────────────────────────────────────────
function checkTooltip() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/floating/tooltip.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error"] };
  const figma = readFigma("tooltip");
  const fo = figma.variantOptions || {};
  const arrowSrc = readFileSync(join(root, "src/floating/arrow.tsx"), "utf8");
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (!/\bcard\b/.test(src)) fails.push("code Tooltip lost the `card` container class");
  if (!/colored-carrot-stroke/.test(arrowSrc)) fails.push("code Arrow lost `colored-carrot-stroke` (the caret's variant-accent outline)");
  if (!figma.sampleVariant.caretIntegrated) fails.push("Figma caret is NOT integrated into the card silhouette (outline must trace around the caret, not a separate bordered box)");
  notes.push("body + caret are one boolean-union silhouette; outline traces around the caret (mirrors Arrow's stroked-V-diagonals + inset fill masking the card border)");
  notes.push("variant-static-text label; 2px border = variant accent; shadow via shared elevation/card; side fixed (others are examples)");
  if (figma.sampleVariant.cardFillVar !== "color/surface/inset") fails.push(`card not bound to color/surface/inset — figma=${figma.sampleVariant.cardFillVar}`);
  if (figma.sampleVariant.shadowStyle !== "elevation/card") fails.push(`shadow not the shared 'elevation/card' style — figma=${figma.sampleVariant.shadowStyle}`);
  return { name: "Tooltip", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · caret integrated into silhouette` };
}

// ── SliderNumberField check ───────────────────────────────────────────────
function checkSliderNumberField() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/inputs/slider-number-field.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error"] };
  const figma = readFigma("slidernumberfield");
  const fo = figma.variantOptions || {};
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (!/variant-input-gradient-bg/.test(src)) fails.push("code SliderNumberField lost `variant-input-gradient-bg` (slider fill)");
  notes.push("slider fill = variant/bg to ~60% + faded; value/label are examples");
  if (figma.sampleVariant.fillVar !== "color/default/bg") fails.push(`fill not bound to color/default/bg — figma=${figma.sampleVariant.fillVar}`);
  return { name: "SliderNumberField", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[(variant axes only)]` };
}

// ── Label check ───────────────────────────────────────────────────────────
function checkLabel() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/inputs/label.tsx"), "utf8");
  const figma = readFigma("label");
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));
  for (const need of ["Label", "Show message", "Message"]) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!/\bmessage\b/.test(src)) fails.push("code Label lost its `message` prop");
  notes.push("no variant axis; label text + optional error message");
  return { name: "Label", figma, fails, notes, summary: `props=[${fprops.join(", ")}]` };
}

// ── NestedMenu check ──────────────────────────────────────────────────────
function checkNestedMenu() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/nested-elements/menu.tsx"), "utf8");
  const figma = readFigma("nestedmenu");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));
  if (!eqSet(fo.State || [], ["default", "highlighted"])) fails.push(`Figma State axis [${fo.State}] != [default, highlighted]`);
  for (const need of ["Label", "Show icon", "Icon"]) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!/\bleft\b/.test(src)) notes.push("code `left` icon slot");
  notes.push("submenu trigger row: NestedItem chrome + right chevron");
  if (figma.sampleVariant.accentVar !== "color/default/bg-hover") fails.push(`accent not bound to color/default/bg-hover — figma=${figma.sampleVariant.accentVar}`);
  return { name: "NestedMenu", figma, fails, notes, summary: `State = [${(fo.State||[]).join(", ")}] · props=[${fprops.join(", ")}]` };
}

// ── Modal check ───────────────────────────────────────────────────────────
function checkModal() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/floating/modal.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "error"] };
  const figma = readFigma("modal");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  for (const need of ["Title", "Show description", "Show footer", "Show cancel"]) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!/\bcard\b/.test(src)) fails.push("code Modal lost the `card` container class");
  if (!/title\??:/.test(src)) fails.push("code Modal lost its `title` prop");
  if (!/onSubmit\??:/.test(src) || !/onCancel\??:/.test(src)) fails.push("code Modal lost its onSubmit/onCancel footer handlers");
  if (!/leftIcon="close"/.test(src)) fails.push("code Modal close is no longer a Button with the `close` icon");
  notes.push("standardized `.card` chrome: header (title + description + icon-only close Button) / body slot / footer (Cancel + Submit); title tints via variant-static-text, Submit + close are variant Buttons");
  notes.push("Variant subset is representative (default/primary/error); code also has secondary/tertiary/info/success/warning");
  if (figma.sampleVariant.cardFillVar !== "color/surface/inset") fails.push(`.card not bound to color/surface/inset (= layout-*-inset) — figma=${figma.sampleVariant.cardFillVar}`);
  if (figma.sampleVariant.borderVar !== "color/surface/separator") fails.push(`.card 2px border not bound to color/surface/separator — figma=${figma.sampleVariant.borderVar}`);
  if (figma.sampleVariant.cornerRadius !== 4) fails.push(`.card radius differs — code=rounded-sm (4px) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.dividerVar !== "color/surface/separator") fails.push(`hairlines not bound to color/surface/separator — figma=${figma.sampleVariant.dividerVar}`);
  return { name: "Modal", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── Dialog check ──────────────────────────────────────────────────────────
function checkDialog() {
  const fails = [], notes = [];
  const src = readFileSync(join(root, "src/floating/dialog.tsx"), "utf8");
  const SUBSET = { variants: ["default", "primary", "error"] };
  const figma = readFigma("dialog");
  const fo = figma.variantOptions || {};
  const fprops = figma.properties || [];
  const hasProp = (name) => fprops.some((p) => p === name || p.startsWith(name + "#"));
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  for (const need of ["Title", "Show description", "Show cancel"]) if (!hasProp(need)) fails.push(`Figma missing component property: '${need}'`);
  if (!/\bcard\b/.test(src)) fails.push("code Dialog lost the `card` container class");
  if (!/hasBody/.test(src)) fails.push("code Dialog lost its optional-body (`hasBody`) logic");
  notes.push("confirmation `.card` chrome sharing Modal's card language; full-width split footer; icon-only close Button; body optional (confirmation-only shown)");
  notes.push("error variant = destructive-confirm case; Variant subset representative (code also has secondary/tertiary/info/success/warning)");
  if (figma.sampleVariant.cardFillVar !== "color/surface/inset") fails.push(`.card not bound to color/surface/inset (= layout-*-inset) — figma=${figma.sampleVariant.cardFillVar}`);
  if (figma.sampleVariant.borderVar !== "color/surface/separator") fails.push(`.card 2px border not bound to color/surface/separator — figma=${figma.sampleVariant.borderVar}`);
  if (figma.sampleVariant.cornerRadius !== 4) fails.push(`.card radius differs — code=rounded-sm (4px) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.dividerVar !== "color/surface/separator") fails.push(`hairline not bound to color/surface/separator — figma=${figma.sampleVariant.dividerVar}`);
  return { name: "Dialog", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · props=[${fprops.join(", ")}]` };
}

// ── Card check (foundation primitive) ─────────────────────────────────────
// Card is the `.card` CSS class, not a React component — so this guards the
// live CSS rule against the Figma recipe (drift either way). The variant-themed
// 2px border in Figma binds to the variant accent (color/<variant>/bg), which
// mirrors code's --card-border-color = the variant accent-text-color.
function checkCard() {
  const fails = [], notes = [];
  const css = readFileSync(join(root, "public/styles.css"), "utf8");
  const m = css.match(/\.card\s*\{([\s\S]*?)\}/);
  const block = m ? m[1] : "";
  const figma = readFigma("card");
  const fo = figma.variantOptions || {};
  const SUBSET = { variants: ["default", "primary", "secondary", "tertiary", "error"] };
  if (!block) fails.push("could not find the `.card` rule in public/styles.css");
  if (!eqSet(fo.Variant || [], SUBSET.variants)) fails.push(`Figma Variant axis [${fo.Variant}] != subset [${SUBSET.variants}]`);
  if (!subsetOf(SUBSET.variants, codeVariants)) fails.push(`subset variants not all in code Variant enum [${codeVariants}]`);
  if (!/rounded-sm/.test(block)) fails.push(".card lost `rounded-sm` (4px)");
  if (!/border-2/.test(block)) fails.push(".card lost `border-2` (2px border)");
  if (!/layout-(dark|light)-inset/.test(block)) fails.push(".card lost `bg-layout-*-inset` (surface/inset)");
  if (!/shadow-lg/.test(block)) fails.push(".card lost `shadow-lg`");
  if (!/card-border-color/.test(css)) fails.push("--card-border-color (variant-themed border) no longer defined");
  notes.push("foundation: the `.card` class — surface/inset bg + 2px variant-accent border + rounded-sm + shadow-lg; shared by floating (Modal/Dialog/Dropdown/Select/Tooltip/Menu) + layout panels");
  notes.push("Figma border binds per-variant to color/<variant>/bg; shadow via the shared 'elevation/card' effect style");
  if (figma.sampleVariant.fillVar !== "color/surface/inset") fails.push(`.card not bound to color/surface/inset — figma=${figma.sampleVariant.fillVar}`);
  if (figma.sampleVariant.cornerRadius !== 4) fails.push(`.card radius differs — code=rounded-sm (4px) figma=${figma.sampleVariant.cornerRadius}px`);
  if (figma.sampleVariant.shadowStyle !== "elevation/card") fails.push(`.card shadow not the shared 'elevation/card' style — figma=${figma.sampleVariant.shadowStyle}`);
  return { name: "Card", figma, fails, notes, summary: `Variant = ${(fo.Variant||[]).length} · foundation (.card class, variant-themed border)` };
}

const results = [checkCard(), checkButton(), checkTextField(), checkCheckbox(), checkSwitch(), checkToggleSquare(), checkChip(), checkProgress(), checkProgressCircle(), checkStatus(), checkNestedItem(), ...checkNestedSubtypes(), checkTabs(), checkTooltip(), checkSliderNumberField(), checkLabel(), checkNestedMenu(), checkModal(), checkDialog()];
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
