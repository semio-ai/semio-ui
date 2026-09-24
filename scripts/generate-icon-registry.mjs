/**
 * Codegen for the default icon registry (SEM-161).
 *
 * Emits two generated files consumed by `src/icons/registry/default-registry.ts`:
 *   - `tabler.generated.ts` — the curated set of @tabler/icons-react icons in the
 *     default registry (an explicit seed below), keyed kebab-case.
 *   - `semio.generated.ts`  — @semio/ui's own custom icons from src/icons/,
 *     keyed kebab-case, with the non-glyph/parametric exports excluded.
 *
 * Rationale: a full Tabler map would be ~6k icons; @semio/ui only needs a few
 * dozen. We seed the default with exactly those (zero-config for the package's
 * own components) and let consumers extend via <IconProvider>. Run:
 *
 *   npm run generate:icons -w @semio/ui
 *
 * The generated files are committed; re-run after editing TABLER_SEED or adding
 * a custom icon under src/icons/.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ts from "typescript";
import * as Tabler from "@tabler/icons-react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "..", "src", "icons");
const OUT_DIR = join(ICONS_DIR, "registry");

/**
 * Custom icons that are NOT plain `{ className }` glyphs and must be curated out
 * (wrappers, or components with required props beyond `className`). The dts build
 * is the backstop: anything left here that isn't assignable to `IconComponent`
 * fails typecheck, so this list stays honest.
 */
const CUSTOM_EXCLUDE = new Set([
  "StaticIcon", // wrapper: renders an arbitrary passed-in icon (required `children`)
  "WorldElementIcon", // parametric: picks a glyph from an element type
  "IconPlayPause", // stateful: requires `center: "play" | "pause"`
  "IconHandleIndicator", // requires a `handle` prop — an affordance, not a glyph
  "IconVariant", // parametric: picks a status glyph from `variant`, renders null otherwise
  // — superseded by the `status-*` role keys
]);

/** Compatibility glyph names point callers toward their semantic replacements. */
const DEPRECATED_CUSTOM_KEYS = {
  "at": "email",
  "arrow-big-up": "key-shift",
  "bezier": "pane-placeholder or transition-bezier-handles",
  "check": "selected or step-complete",
  "chevron-right-pipe": "menu-toggle",
  "eye": "show, state-visible, or preview-open",
  "eye-off": "hide, state-hidden, or preview-close",
  "file-type-face": "asset-face in Studio",
  "graph-view": "view-data",
  "hexagon": "option-placeholder",
  "letter-c": "key-c",
  "letter-v": "key-v",
  "letter-x": "key-x",
  "letter-z": "key-z",
  "list": "view-list",
  "lock-off": "unlock or state-unlocked",
  "minus": "selection-indeterminate",
  "moon": "theme-dark",
  "panels-top-left": "layout-settings",
  "plus": "add",
  "point": "unselected",
  "point-filled": "option-placeholder",
  "select-close": "deselect-all",
  "select-cursor": "select or select-all",
  "speaker": "unmute or state-unmuted",
  "speaker-off": "mute or state-muted",
  "sun-moon": "theme-system",
  "vector-flat": "view-keys",
  "vector-angled": "view-transitions",
  "vector-bezier": "view-preview",
  "vector-bezier-handles": "view-spline or transition-bezier-handles",
  "vector-bezier-auto-clamp": "transition-auto-clamped",
  "x": "clear-input or step-stopped",
  "bounce": "playback-bounce",
  "player-end-bounds": "playback-seek-start-bounds or playback-seek-end-bounds",
  "vector-back": "transition-back",
  "vector-circ": "transition-circular",
  "vector-cubic": "transition-cubic",
  "vector-expo": "transition-exponential",
  "vector-linear": "transition-linear",
  "vector-quad": "transition-quadratic",
  "vector-quart": "transition-quartic",
  "vector-quint": "transition-quintic",
  "vector-sine": "transition-sine"
};

/** Preserve established keys independently of component identifier spelling. */
const CUSTOM_KEYS = {
  IconRotate3d: "rotate-3d",
  IconAdd: "plus",
  IconClose: "x",
  Playback01x: "playback-0.1",
  Playback05x: "playback-0.5",
  Playback10x: "playback-1.0",
  Playback15x: "playback-1.5",
  Playback20x: "playback-2.0",
};

/** PascalCase / `IconFoo` → kebab-case key (`IconChevronDown` → `chevron-down`). */
function toKey(name) {
  return name
    .replace(/^Icon/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// --- 1. Tabler seed: the curated set of @tabler/icons-react icons in the default ---
// This is an EXPLICIT list, not import-scanned: @semio/ui's own components render
// icons through `<Icon name>`, which means they no longer import Tabler directly —
// so the seed must stand on its own. Add an export name here when the default
// registry should gain another Tabler glyph. Validated against the live module.
const TABLER_SEED = [
  "IconArrowBigDown", "IconArrowBigDownLines", "IconArrowBigUp", "IconArrowDown",
  "IconArrowUp", "IconCheck", "IconChefHat", "IconChevronDown", "IconChevronLeft",
  "IconChevronRight", "IconChevronRightPipe", "IconChevronUp", "IconCircle",
  "IconClipboardCheck", "IconClipboardPlus", "IconCommand", "IconExclamationMark",
  "IconHeart", "IconHexagon", "IconJacket", "IconLayoutGrid", "IconLine", "IconMenu2",
  "IconMinus", "IconMoon", "IconPencil", "IconPinned", "IconPlayerPause", "IconPlus",
  "IconPoint", "IconPointFilled", "IconRotate", "IconRotate2", "IconSearch", "IconSelector",
  "IconShoe", "IconShoppingBag", "IconSquare", "IconStar", "IconSun", "IconSunMoon",
  "IconSunglasses", "IconTransformPoint", "IconUser", "IconView360", "IconWorld", "IconX",
];
// Compatibility keys for the unmounted RobotBuilderWidget's WorldElementIcon.
const DEPRECATED_TABLER_KEYS = new Set([
  "line", "pencil", "pinned", "transform-point", "view360",
]);
const missing = TABLER_SEED.filter((n) => !Tabler[n]);
if (missing.length) throw new Error(`TABLER_SEED has unknown Tabler icons: ${missing.join(", ")}`);
let tablerSorted = [...new Set(TABLER_SEED)].sort();

// --- 2. Custom icons: scan src/icons/*.tsx for exported glyph components ---
const exportRe =
  /export\s+(?:const|function)\s+([A-Za-z0-9_]+)|export\s*\{([^}]*)\}/g;
const custom = []; // { name, key, from }
for (const entry of readdirSync(ICONS_DIR, { withFileTypes: true })) {
  if (!entry.isFile() || !/\.tsx$/.test(entry.name)) continue;
  const mod = `../${  entry.name.replace(/\.tsx$/, "")}`;
  const text = readFileSync(join(ICONS_DIR, entry.name), "utf8");
  for (const m of text.matchAll(exportRe)) {
    const names = m[1] ? [m[1]] : m[2].split(",");
    for (const raw of names) {
      const name = raw.trim().split(/\s+as\s+/).pop().trim();
      if (!name || name.endsWith("Props") || name.endsWith("Type")) continue; // skip type exports
      if (CUSTOM_EXCLUDE.has(name)) continue;
      custom.push({ name, key: CUSTOM_KEYS[name] ?? toKey(name), from: mod });
    }
  }
}
// de-dupe by component name; later glyphs with a duplicate KEY are reported
const seenName = new Set();
const customUnique = custom.filter((c) => !seenName.has(c.name) && seenName.add(c.name));
customUnique.sort((a, b) => a.key.localeCompare(b.key));

/** Curated native glyphs own their keys; fallback libraries cannot shadow them. */
function registryKeys(file, name) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const keys = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) {
      let object = node.initializer;
      while (object.expression) object = object.expression;
      for (const property of object.properties) keys.push(property.name.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return keys;
}
const ownedKeys = new Set([
  ...customUnique.map((icon) => icon.key),
  ...registryKeys(join(OUT_DIR, "solar.tsx"), "solarIconRegistry"),
  ...registryKeys(join(OUT_DIR, "roles.ts"), "roleIconRegistry"),
]);
tablerSorted = tablerSorted.filter((name) => !ownedKeys.has(toKey(name)));

const HEADER =
  "// AUTO-GENERATED by scripts/generate-icon-registry.mjs — do not edit by hand.\n" +
  "// Run `npm run generate:icons -w @semio/ui` to regenerate.\n";

// --- 3. Emit tabler.generated.ts ---
const tablerOut =
  `${HEADER
  }import {\n${tablerSorted.map((n) => `  ${n},`).join("\n")}\n} from "@tabler/icons-react";\n` +
  `import type { IconRegistry } from "./types";\n\n` +
  // `satisfies` (not `: IconRegistry`) so the literal keys survive for the
  // `keyof`-derived `IconName` type — an annotation would widen to
  // `Record<string, …>` and erase them.
  `export const tablerIconRegistry = {\n${
  tablerSorted.map((n) => {
    const key = toKey(n);
    const deprecated = DEPRECATED_TABLER_KEYS.has(key)
      ? "  /** @deprecated Legacy WorldElementIcon compatibility; its Studio robot sidebar is not mounted. Avoid new usage. */\n"
      : "";
    return `${deprecated}  "${key}": ${n},`;
  }).join("\n")
  }\n} satisfies IconRegistry;\n`;
writeFileSync(join(OUT_DIR, "tabler.generated.ts"), tablerOut);

// --- 4. Emit semio.generated.ts ---
const importsByModule = new Map();
for (const c of customUnique) {
  if (!importsByModule.has(c.from)) importsByModule.set(c.from, []);
  importsByModule.get(c.from).push(c.name);
}
const semioImports = [...importsByModule.entries()]
  .sort()
  .map(([mod, names]) => `import { ${names.sort().join(", ")} } from "${mod}";`)
  .join("\n");
const semioOut =
  `${HEADER +
  semioImports
  }\nimport type { IconRegistry } from "./types";\n\n` +
  `export const semioIconRegistry = {\n${
  customUnique.map((c) => {
    const replacement = DEPRECATED_CUSTOM_KEYS[c.key];
    const note = replacement ? `  /** @deprecated Use ${replacement}. */\n` : "";
    return `${note}  "${c.key}": ${c.name},`;
  }).join("\n")
  }\n} satisfies IconRegistry;\n`;
writeFileSync(join(OUT_DIR, "semio.generated.ts"), semioOut);

console.log(
  `Generated ${tablerSorted.length} Tabler + ${customUnique.length} custom icon registry entries.`,
);
