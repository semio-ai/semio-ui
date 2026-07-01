// Central Figma "Semio UI Library" link builder for Storybook `design` params
// (@storybook/addon-designs). The file key is a workspace URL identifier — not a
// secret, and (in URL form) not flagged by our git secret scanning — kept here in
// one place. Mirrors the same file referenced by Code Connect (packages/ui/figma.config.json).
const FIGMA_FILE = "https://www.figma.com/design/ExKZLlbGQ3lJxBddvR500j/Semio-UI-Library";

/** Build a Figma node deep-link for a story's `parameters.design.url`. */
export const figmaNode = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId}`;
