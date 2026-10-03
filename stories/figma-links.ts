// Central Figma "Semio UI Library" link builder for Storybook `design` params
// (@storybook/addon-designs). The file key is a workspace URL identifier — not a
// secret, and (in URL form) not flagged by our git secret scanning — kept here in
// one place. Mirrors the same file referenced by Code Connect (packages/ui/figma.config.json).
const FIGMA_FILE = "https://www.figma.com/design/ExKZLlbGQ3lJxBddvR500j/Semio-UI-Library";

/** Build a Figma node deep-link for a story's `parameters.design.url`. */
export const figmaNode = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId}`;

/**
 * Button preview nodes (Visual × Variant) for 1:1 story→design links. Each points
 * at a dedicated **`preview/<visual>/<variant>` frame** on the Examples page,
 * NOT a variant inside the Button component set — Figma's embed zooms to the
 * containing frame/set, so a node that lives inside one shows the whole thing;
 * a dedicated one-variant frame embeds as just that variant. Each frame holds a
 * **Light** and **Dark** cell (Color-collection mode pinned per cell), so the
 * Design panel shows both themes at once. Figma models Size as an examples demo
 * (not a variant axis) and doesn't build cta / custom-color as variants — so size
 * stories reuse their visual+variant frame, custom-color reuses its base visual,
 * and cta stories have no 1:1 node.
 */
export const buttonVariant = {
  defaultPrimary: figmaNode("387-476"),
  defaultSecondary: figmaNode("387-513"),
  invertedPrimary: figmaNode("387-548"),
  invertedSecondary: figmaNode("387-583"),
  borderedPrimary: figmaNode("387-618"),
  borderedSecondary: figmaNode("387-653"),
} as const;

/**
 * TextField preview nodes for 1:1 story→design links. Each points at a dedicated
 * `preview/textfield/interact/<variant>` frame on the Examples page (a single
 * variant rendered in a **Light** and **Dark** cell, Color-mode pinned per cell),
 * NOT a variant inside the TextField set — so the Figma embed shows just that
 * field in both themes rather than zooming to the whole 60-variant set. The
 * stories all use `outline="interact"`; `always`/`hidden` are shown in the set.
 */
export const textFieldVariant = {
  interactPrimary: figmaNode("498-758"),
  interactDefault: figmaNode("498-803"),
} as const;

/**
 * Checkbox preview nodes for 1:1 story→design links. Each points at a dedicated
 * `preview/checkbox/<variant>` frame on the Examples page (the checked box in a
 * **Light** and **Dark** cell, Color-mode pinned per cell), NOT a variant inside
 * the Checkbox set. Size + disabled stories reuse `primary` (Figma models size as
 * examples, not an axis — matching Button/TextField).
 */
export const checkboxVariant = {
  primary: figmaNode("504-799"),
  secondary: figmaNode("504-817"),
  tertiary: figmaNode("504-834"),
  success: figmaNode("504-851"),
  warning: figmaNode("504-868"),
  error: figmaNode("504-885"),
  info: figmaNode("504-902"),
} as const;

/**
 * Switch preview nodes for 1:1 story→design links. Each points at a dedicated
 * `preview/switch/<variant>` frame on the Examples page (the on-state switch in a
 * **Light** and **Dark** cell, Color-mode pinned per cell). Off/disabled stories
 * reuse `primary`.
 */
export const switchVariant = {
  default: figmaNode("507-918"),
  primary: figmaNode("507-931"),
  secondary: figmaNode("507-944"),
  tertiary: figmaNode("507-957"),
  error: figmaNode("507-970"),
} as const;

/**
 * ToggleSquare preview nodes for 1:1 story→design links. Each points at a dedicated
 * `preview/togglesquare/<variant>` frame on the Examples page (the on-state toggle in
 * a **Light** and **Dark** cell, Color-mode pinned per cell). Off/partial/disabled
 * stories reuse `primary`.
 */
export const toggleSquareVariant = {
  default: figmaNode("508-1038"),
  primary: figmaNode("508-1059"),
  secondary: figmaNode("508-1080"),
  tertiary: figmaNode("508-1101"),
  error: figmaNode("508-1122"),
} as const;

/**
 * Input *presets* — Search / Email / Password / NumberField are not their own
 * Figma components; they're configurations of the TextField set (+ a label / eye /
 * units). These point at the `preset/<name>` frames on the "Input presets" board
 * (Examples page). Only NumberField has Storybook stories today; the others are
 * documented Figma-side only.
 */
export const inputPreset = {
  search: figmaNode("517-943"),
  email: figmaNode("517-970"),
  password: figmaNode("517-1011"),
  numberField: figmaNode("517-1031"),
} as const;

/**
 * Chip preview nodes for 1:1 story→design links. Each points at a dedicated
 * `preview/chip/<variant>` frame on the Examples page (a full chip — icon + label +
 * delete — in a **Light** and **Dark** cell, Color-mode pinned per cell). Size /
 * no-icon / no-delete stories reuse `info`; custom-color reuses `primary`.
 */
export const chipVariant = {
  primary: figmaNode("523-1080"),
  info: figmaNode("523-1101"),
} as const;

/** Progress bar preview frames — `preview/progress/<variant>` (Light+Dark), fixed ~60% demo. */
export const progressVariant = {
  default: figmaNode("530-1028"),
  primary: figmaNode("530-1041"),
  secondary: figmaNode("530-1050"),
  tertiary: figmaNode("530-1063"),
  error: figmaNode("530-1076"),
  success: figmaNode("530-1089"),
  warning: figmaNode("530-1102"),
  info: figmaNode("530-1115"),
} as const;

/** ProgressCircle preview frames — `preview/progresscircle/<variant>` (Light+Dark). Size / icon stories reuse `success`. */
export const progressCircleVariant = {
  primary: figmaNode("530-1156"),
  secondary: figmaNode("530-1173"),
  tertiary: figmaNode("530-1200"),
  success: figmaNode("530-1227"),
} as const;

/** Status (dot) preview frames — `preview/status/<variant>` (Light+Dark). */
export const statusVariant = {
  default: figmaNode("546-1077"),
  primary: figmaNode("546-1086"),
  secondary: figmaNode("546-1093"),
  tertiary: figmaNode("546-1102"),
  error: figmaNode("546-1111"),
  success: figmaNode("546-1120"),
  warning: figmaNode("546-1129"),
  info: figmaNode("546-1138"),
} as const;

/** Spinner preview frame — `preview/spinner` (static representation of the animated ring). */
export const spinnerPreview = figmaNode("546-1147");

/**
 * Menu — the composed nested-elements example (NestedLabel + NestedItem rows +
 * NestedSeparator) on the Components page. The primitives only render inside a
 * Dropdown/ContextMenu, so the menu story links here rather than to a bare row.
 */
export const menuExample = figmaNode("556-724");

/**
 * Floating containers. Two of the four were promoted to real component sets —
 * Modal and Dialog have a fixed, content-agnostic card shell, so they're
 * variant-bound components (with a composed usage example alongside). Dropdown
 * and Select stay as composition example frames: they're arrangements of
 * already-componentized rows (NestedItem/NestedRadio/Chip) over a dynamic,
 * data-driven list, which doesn't map cleanly to a static component.
 */
export const modalComponent = figmaNode("600-1375");
export const dialogComponent = figmaNode("600-1495");

export const floatingExample = {
  dropdown: figmaNode("569-1162"),
  select: figmaNode("569-1214"),
} as const;

/** Tabs preview frame — `preview/tabs` (Light+Dark). The reusable tab-row primitive
 * a tabbed modal composes from (SidebarModal/TabbedModal are composed in Figma). */
export const tabsPreview = figmaNode("579-1198");

/** Tooltip preview frame — `preview/tooltip` (Light+Dark). */
export const tooltipPreview = figmaNode("587-1217");

/** SliderNumberField preview frame — `preview/slidernumberfield` (Light+Dark). */
export const sliderNumberFieldPreview = figmaNode("587-1235");

/**
 * Text — the role component set, and the specimen showing what each role resolves to.
 *
 * Points at the SET rather than a per-role preview frame, unlike Button/Chip. Those
 * link one frame per variant because Figma's embed zooms to the containing frame, so a
 * node inside a set shows the whole set. Here the whole set IS the subject: the roles
 * are only meaningful beside each other — `value` and `body` share a rung and differ by
 * contrast, `label` and `caption` share a rung and a colour and differ by case.
 *
 * ⚠ Selection is NOT modelled in Figma. `::selection` and `user-select` have no
 * equivalent there, so whether a role is selectable lives only in the `.text-role-*`
 * classes — the design link cannot confirm it, and the browser tests are what do.
 */
export const textRole = {
  /** The `Text` component set — all four roles, each row labelled with what it resolves to. */
  set: figmaNode("786-903"),
  /**
   * The specimen on the Examples page: every role in both themes, labelled, with what it
   * is for and placeholder copy at its real size.
   *
   * The library file carries the design as it stands, not how it got there — so the
   * boards that compared candidate ramps and recorded which was chosen do not live in
   * Figma. Those arguments belong where someone changing the code will meet them, which
   * is the comments on the `.text-role-*` blocks in `packages/ui/public/styles.css`.
   */
  specimen: figmaNode("835-1401"),
} as const;
