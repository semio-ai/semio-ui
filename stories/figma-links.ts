// Central Figma "Semio UI Library" link builder for Storybook `design` params
// (@storybook/addon-designs). The file key is a workspace URL identifier — not a
// secret, and (in URL form) not flagged by our git secret scanning — kept here in
// one place. Mirrors the same file referenced by Code Connect (packages/ui/figma.config.json).
const FIGMA_FILE = "https://www.figma.com/design/ExKZLlbGQ3lJxBddvR500j/Semio-UI-Library";

/** Build a Figma node deep-link for a story's `parameters.design.url`. */
export const figmaNode = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId}`;

/**
 * Button variant nodes (Visual × Variant, State=default) for 1:1 story→variant
 * design links. Figma models Size as an examples demo (not a variant axis) and
 * doesn't build cta / custom-color as variants — so size stories reuse their
 * visual+variant node, custom-color reuses its base visual, and cta stories have
 * no 1:1 node.
 */
export const buttonVariant = {
  defaultPrimary: figmaNode("191-43"),
  defaultSecondary: figmaNode("191-64"),
  invertedPrimary: figmaNode("194-22"),
  invertedSecondary: figmaNode("194-42"),
  borderedPrimary: figmaNode("194-122"),
  borderedSecondary: figmaNode("194-142"),
} as const;
