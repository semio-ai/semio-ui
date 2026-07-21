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
