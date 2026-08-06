import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Size,
  TreeGrid,
  Variant,
  defaultResolveRowVisual,
  type FlatTreeRow,
  type ResolveRowVisual,
  type TreeNode,
} from "@semio/ui";
import { type ReactElement, useMemo, useRef, useState } from "react";

/**
 * Sanity-check gallery for the shared hierarchical row-list component
 * (`TreeGrid`) and its primitives.
 *
 * Keyboard (click a row first, then): Up/Down move focus · Home/End jump ·
 * Left/Right collapse/expand a group · Space selects (Shift = range,
 * Ctrl/Cmd = toggle) · Enter enters the row's first control · Escape leaves it.
 * Click selects; Ctrl/Shift-click toggle/range.
 */
// Per-story Figma design link → the TreeGrid composition example frame.
const design = (url: string) => ({ design: { type: "figma" as const, url } });
const FIGMA_TREE_GRID =
  "https://www.figma.com/design/ExKZLlbGQ3lJxBddvR500j/Semio-UI-Library?node-id=690-1359";

const meta: Meta = {
  title: "ui/TreePrimitives",
  parameters: design(FIGMA_TREE_GRID),
  decorators: [
    (Story) => (
      <div className="min-h-[28rem] w-full bg-neutral-900 p-5 text-neutral-100">
        <div className="w-[26rem] rounded border border-white/10 bg-black/20">{Story()}</div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

// ── Shared row payload + renderers (hoisted so they're stable across renders) ──

interface RowData {
  label: string;
  editor?: "slider" | "swatch" | "text";
  /** Optional domain color, used by the custom-visual example. */
  color?: string;
}

const renderLabel = (row: FlatTreeRow<RowData>): ReactElement => (
  <span className="truncate px-1 text-sm">{row.data.label}</span>
);

const renderEditor = (row: FlatTreeRow<RowData>): ReactElement | undefined => {
  switch (row.data.editor) {
    case "slider":
      return <input type="range" aria-label={`${row.data.label} value`} className="h-1 w-28" />;
    case "swatch":
      return (
        <span
          className="inline-block size-4 rounded border border-white/20"
          style={{ backgroundColor: row.data.color ?? "#34d399" }}
        />
      );
    case "text":
      return (
        <input
          aria-label={`${row.data.label} value`}
          className="w-24 rounded bg-white/10 px-1 text-xs"
          defaultValue="—"
        />
      );
    default:
      return undefined;
  }
};

// ── 1. Basic tree with mixed editors ──────────────────────────────────────────

const basicNodes: TreeNode<RowData>[] = [
  {
    id: "head",
    data: { label: "head" },
    children: [
      { id: "head/pitch", data: { label: "pitch", editor: "slider" } },
      { id: "head/yaw", data: { label: "yaw", editor: "slider" } },
    ],
  },
  { id: "name", data: { label: "name", editor: "text" } },
];

export const Default: Story = {
  render: () => (
    <TreeGrid
      nodes={basicNodes}
      ariaLabel="Basic tree"
      getLabel={renderLabel}
      getEditor={renderEditor}
    />
  ),
};

// ── 2. Group that is ALSO editable (the color / color.r orthogonality) ─────────

const colorNodes: TreeNode<RowData>[] = [
  {
    id: "background/color",
    data: { label: "color", editor: "swatch", color: "#f59e0b" },
    children: [
      { id: "background/color.r", data: { label: "r", editor: "slider" } },
      { id: "background/color.g", data: { label: "g", editor: "slider" } },
      { id: "background/color.b", data: { label: "b", editor: "slider" } },
    ],
  },
];

export const GroupIsAlsoEditable: Story = {
  name: "Group is also editable (color → r/g/b)",
  render: () => (
    <TreeGrid
      nodes={colorNodes}
      ariaLabel="Color tree"
      getLabel={renderLabel}
      getEditor={renderEditor}
    />
  ),
};

// ── 3. Live-data-shaped key hierarchy (deep, collapse-heavy) ───────────────────

const liveNodes: TreeNode<RowData>[] = [
  {
    id: "robot",
    data: { label: "robot" },
    children: [
      {
        id: "robot/head",
        data: { label: "head" },
        children: [
          { id: "robot/head/pitch", data: { label: "pitch", editor: "slider" } },
          { id: "robot/head/yaw", data: { label: "yaw", editor: "slider" } },
        ],
      },
      {
        id: "robot/arm",
        data: { label: "arm" },
        children: [
          { id: "robot/arm/shoulder", data: { label: "shoulder", editor: "slider" } },
          { id: "robot/arm/elbow", data: { label: "elbow", editor: "slider" } },
        ],
      },
    ],
  },
  { id: "arora.dt", data: { label: "arora.dt", editor: "text" } },
];

export const LiveDataShape: Story = {
  name: "Live-data-shaped hierarchy",
  render: () => (
    <TreeGrid
      nodes={liveNodes}
      ariaLabel="Live data tree"
      getLabel={renderLabel}
      getEditor={renderEditor}
      defaultCollapsed={["robot/arm"]}
    />
  ),
};

// ── 4. Selection with a live readout (uncontrolled, group selects subtree) ─────

function SelectionDemo(): ReactElement {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="flex flex-col">
      <TreeGrid
        nodes={liveNodes}
        ariaLabel="Selectable tree"
        getLabel={renderLabel}
        getEditor={renderEditor}
        selectGroupDescendants
        onSelectionChange={(next) => setSelected([...next].sort((a, b) => a.localeCompare(b)))}
      />
      <div className="border-t border-white/10 p-2 font-mono text-[11px] text-neutral-400">
        selected: {selected.length ? selected.join(", ") : "(none)"}
      </div>
    </div>
  );
}

export const SelectionWithReadout: Story = {
  name: "Selection (click / Ctrl / Shift, group selects subtree)",
  render: () => <SelectionDemo />,
};

// ── 5. Custom visual resolver (animation-style track-colored selection) ────────

const trackColorResolver: ResolveRowVisual<RowData> = (state, data) => {
  const color = data.color ?? "#60a5fa";
  if (state.selected) return { bar: color, background: `${color}30` };
  if (state.emphasized) return { background: `${color}18` };
  return { bar: null, background: null };
};

const coloredNodes: TreeNode<RowData>[] = [
  { id: "x", data: { label: "position X", editor: "slider", color: "#f87171" } },
  { id: "y", data: { label: "position Y", editor: "slider", color: "#4ade80" } },
  { id: "z", data: { label: "position Z", editor: "slider", color: "#60a5fa" } },
];

export const CustomVisualResolver: Story = {
  name: "Custom visual resolver (per-row color)",
  render: () => (
    <TreeGrid
      nodes={coloredNodes}
      ariaLabel="Colored tree"
      getLabel={renderLabel}
      getEditor={renderEditor}
      resolveVisual={trackColorResolver}
    />
  ),
};

// ── 5b. Per-row theme variant / custom color via the design-system fields ──────
// Confirms the hierarchical primitives support the SAME color capabilities as
// ListGrid: a resolver can return `{ variant }` (theme palette, dark-mode aware)
// or `{ color }` (arbitrary), spreading the theme-aware default intensities.

const variantNodes: TreeNode<RowData>[] = [
  {
    id: "sensors",
    data: { label: "sensors" },
    children: [
      { id: "sensors/ok", data: { label: "healthy", editor: "slider", color: "#30a46c" } },
      { id: "sensors/warn", data: { label: "degraded", editor: "slider", color: "#f5a623" } },
      { id: "sensors/err", data: { label: "faulted", editor: "slider", color: "#e5484d" } },
    ],
  },
];

// Map each row to a theme variant; per-row `color` (the node's own) overrides it.
const perRowColorResolver: ResolveRowVisual<RowData> = (state, data) => ({
  ...defaultResolveRowVisual(state, data),
  variant: Variant.Info,
  color: data.color,
});

export const PerRowThemeVariantAndColor: Story = {
  name: "Per-row theme variant / custom color (design-system fields)",
  render: () => (
    <TreeGrid
      nodes={variantNodes}
      ariaLabel="Per-row colored tree"
      getLabel={renderLabel}
      getEditor={renderEditor}
      resolveVisual={perRowColorResolver}
      defaultSelected={["sensors/warn"]}
    />
  ),
};

// ── 6. Guide-line styles (configurable; default matches the animation package) ─

export const GuideLinesFull: Story = {
  name: "Guide lines: full (animation-style, default)",
  render: () => (
    <TreeGrid
      nodes={liveNodes}
      ariaLabel="Full guides"
      getLabel={renderLabel}
      getEditor={renderEditor}
      guideLines="full"
    />
  ),
};

export const GuideLinesLastChild: Story = {
  name: "Guide lines: last-child (file-tree style)",
  render: () => (
    <TreeGrid
      nodes={liveNodes}
      ariaLabel="Last-child guides"
      getLabel={renderLabel}
      getEditor={renderEditor}
      guideLines="last-child"
    />
  ),
};

/**
 * A ten-thousand-row tree, windowed.
 *
 * A tree windows exactly as a flat list does: `flattenTree` has already produced an array,
 * so the rows on screen are a slice of it and collapsing a group simply makes that array
 * shorter. Collapse a few groups here and the scrollbar shortens to match. Indentation and
 * guide lines are per-row facts, so a row is unaffected by its neighbours being absent.
 */
export const VirtualizedTree: StoryObj = {
  render: () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const nodes = useMemo(
      () =>
        Array.from({ length: 100 }, (_unusedGroup, g) => ({
          id: `group-${g.toString()}`,
          data: { name: `Group ${g.toString()}` },
          children: Array.from({ length: 100 }, (_unusedLeaf, c) => ({
            id: `group-${g.toString()}-leaf-${c.toString()}`,
            data: { name: `Leaf ${g.toString()}.${c.toString()}` },
          })),
        })),
      [],
    );
    return (
      <div className="w-[420px] p-4">
        <div className="mb-2 text-xs text-neutral-500">10,100 rows · windowed</div>
        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto rounded-sm border border-neutral-500/20"
        >
          <TreeGrid
            nodes={nodes}
            virtualized
            scrollRef={scrollRef}
            ariaLabel="Virtualized tree"
            getLabel={(row) => <span className="truncate text-sm">{row.data.name}</span>}
          />
        </div>
      </div>
    );
  },
};

/**
 * The same tree at every row size.
 *
 * `size` is the rhythm `ListGrid` uses, so a tree and a listing at the same size are the
 * same height — a tree next to a listing should not look like two differently-built things.
 * `Md` is the default and the anchor the rest of the product is spaced to.
 *
 * A row is a single line at every size: these change the box around the content, not how
 * much of it fits. Content that would need two lines is the consumer's to shorten.
 */
export const RowSizes: StoryObj = {
  render: () => {
    const nodes: TreeNode<{ name: string }>[] = [
      {
        id: "root",
        data: { name: "Assembly" },
        children: [
          { id: "root-a", data: { name: "Left arm" } },
          { id: "root-b", data: { name: "Right arm" } },
        ],
      },
    ];
    return (
      <div className="flex flex-col gap-4 p-4">
        {[Size.Xs, Size.Sm, Size.Md, Size.Lg, Size.Xl].map((size) => (
          <div key={size}>
            <div className="mb-1 text-xs text-neutral-500">{size}</div>
            <TreeGrid
              nodes={nodes}
              size={size}
              ariaLabel={`Tree at ${size}`}
              getLabel={(row) => <span className="sized-text truncate">{row.data.name}</span>}
            />
          </div>
        ))}
      </div>
    );
  },
};
