import type { Meta, StoryObj } from "@storybook/react-vite";
import { Markdown } from "@semio/ui";

/**
 * `Markdown` renders user-authored prose — an asset's description, a release's
 * notes, a project README. The stories below are chosen to pin the decisions that
 * are easy to regress rather than to demonstrate syntax: that the type scale stays
 * subordinate to the page, that fenced code reuses `Snippet`, that raw HTML is
 * inert, and that nothing is rendered for nothing.
 */
const meta: Meta<typeof Markdown> = {
  component: Markdown,
  title: "ui/Markdown",
  decorators: [
    (Story) => (
      // Constrained width, because line length is part of whether prose reads —
      // and because a table or a code fence has to be seen overflowing something.
      <div className="mx-auto w-full max-w-2xl p-5 text-neutral-900 dark:text-neutral-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Markdown>;

/** The realistic case: what an asset description actually looks like. */
export const AssetDescription: Story = {
  args: {
    children: `The Quori mobile manipulation platform, rigged for animation.

## What's included

- A full skeleton with **retargetable** arm and head chains
- A simplified collision mesh for fast physics
- Two example poses: \`neutral\` and \`reach-forward\`

## Compatibility

Works with any humanoid rig that follows the standard joint naming. See the
[rigging guide](https://example.com/rigging) for the naming table.

> Heads up: the collision mesh is convex-decomposed, so very thin geometry is
> approximated.
`,
  },
};

/**
 * Every heading level at once. The point is that `#` does NOT out-shout the page
 * title above it: this content is a guest inside a page that owns its own
 * hierarchy, so `#` lands near a section heading and the levels step down from
 * there. They are also emitted starting at `<h2>`, leaving `<h1>` to the page.
 */
export const HeadingScale: Story = {
  args: {
    children: `# Level one
Prose under level one.

## Level two
Prose under level two.

### Level three
Prose under level three.

#### Level four
Prose under level four.

##### Level five
Level five and six share level four's treatment — past four levels the
difference stops being legible, and inventing more sizes only makes deep
documents look broken.
`,
  },
};

/** Fenced blocks render through `Snippet`, so they get the product's own syntax
 *  highlighting and copy button rather than a second, plainer code style. Inline
 *  code is a separate, much quieter treatment. */
export const CodeBlocks: Story = {
  args: {
    children: `Install the dependency, then call \`resolve()\` with a range:

\`\`\`typescript
import { resolve } from "@semio/core";

const pinned = resolve("^1.2.0", releases);
\`\`\`

A fence with no language still renders, just unhighlighted:

\`\`\`
joint_head_pan
joint_head_tilt
\`\`\`
`,
  },
};

/** GFM: tables, task lists, strikethrough and autolinks. A table wider than the
 *  container scrolls inside its own box rather than making the page scroll. */
export const GithubFlavoured: Story = {
  args: {
    children: `| Joint | Range | Default | Notes |
|---|---|---|---|
| \`head_pan\` | -90° … 90° | 0° | Clamped in firmware |
| \`head_tilt\` | -30° … 45° | 0° | |
| \`arm_left_shoulder\` | -180° … 180° | 0° | Continuous rotation |

- [x] Skeleton exported
- [x] Collision mesh generated
- [ ] Baked textures

~~Deprecated in 2.0~~ — use the new naming. Autolinked: https://example.com
`,
  },
};

/**
 * Raw HTML in the source is rendered as inert TEXT, not as markup.
 *
 * This is the security decision made visible. The renderer builds a React element
 * tree and never assembles an HTML string, and the `rehype-raw` plugin that would
 * reintroduce raw HTML is deliberately absent — so a description written by one
 * user cannot inject markup or script into a page shown to another. If this story
 * ever renders a styled box or fires anything, that protection has been removed.
 */
export const RawHtmlIsInert: Story = {
  args: {
    children: `Ordinary prose, then raw HTML:

<div style="background: red; padding: 20px">A styled box</div>

<img src=x onerror="alert('xss')">

<script>alert("xss")</script>

And an anchor with a script URL: [click me](javascript:alert('xss'))
`,
  },
};

/** Nothing to render occupies no space, so a caller never has to check first —
 *  an asset nobody described leaves no empty gap on its page. */
export const Empty: Story = {
  args: { children: "   " },
};
