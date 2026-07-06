// Central Figma "Semio UI Library" link builder for Storybook `design` params
// (@storybook/addon-designs). The file key is a workspace URL identifier — not a
// secret, and (in URL form) not flagged by our git secret scanning — kept here in
// one place. Mirrors the same file referenced by Code Connect (packages/ui/figma.config.json).
const FIGMA_FILE = "https://www.figma.com/design/ExKZLlbGQ3lJxBddvR500j/Semio-UI-Library";

/** Build a Figma node deep-link for a story's `parameters.design.url`. */
export const figmaNode = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId}`;

/**
 * Button preview nodes (Visual × Variant, State=default) for 1:1 story→design
 * links. These point at **standalone instances** on the Examples page's
 * "Storybook previews" frame — NOT the variants inside the Button component set,
 * because Figma's embed renders the whole set for a node that lives inside it,
 * whereas a standalone instance embeds as a single button. Figma models Size as
 * an examples demo (not a variant axis) and doesn't build cta / custom-color as
 * variants — so size stories reuse their visual+variant node, custom-color reuses
 * its base visual, and cta stories have no 1:1 node.
 */
export const buttonVariant = {
  defaultPrimary: figmaNode("370-477"),
  defaultSecondary: figmaNode("370-496"),
  invertedPrimary: figmaNode("370-513"),
  invertedSecondary: figmaNode("370-530"),
  borderedPrimary: figmaNode("370-547"),
  borderedSecondary: figmaNode("370-564"),
} as const;
