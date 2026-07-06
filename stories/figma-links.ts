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
