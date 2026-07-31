# Tree primitives

Composable building blocks for **collapsible, selectable, keyboard-navigable
hierarchical row lists** — the pattern behind the animation track/control lists
and the live-data view.

The design is deliberately **assembly-first**. There is no monolith that owns
your row content. Instead the *skeleton* is standardized (flattening, collapse,
selection, roving focus, indentation/guide-lines, the row layout) and everything
domain-specific is **injected**:

| Seam | What you provide | How |
| --- | --- | --- |
| **Row content** | labels, editors, action buttons | `getLabel` / `getEditor` / `getActions` (or `TreeRow`'s `label`/`editor`/`actions` slots) |
| **Selection state + policy** | the selected set, how hierarchy affects it | controlled `selected` + `onSelectionChange`, `scopeOf`, `selectGroupDescendants` |
| **State → style** | which colors/tints a row gets | `resolveVisual` (defaults to a neutral resolver) |

There are two ways in: the batteries-included **`TreeGrid`** (use this first),
or the **à-la-carte hooks + primitives** when you need a custom renderer.

---

## Option A — `TreeGrid` (recommended)

Give it a tree of nodes and tell it how to render a row. It wires flatten +
collapse + selection + roving-focus keyboard nav + the standardized row shape.

```tsx
import { TreeGrid, type TreeNode, type FlatTreeRow } from "@semio/ui";

interface Row { label: string; editor?: "slider" | "swatch" }

const nodes: TreeNode<Row>[] = [
  {
    id: "head",
    data: { label: "head" },
    children: [
      { id: "head/pitch", data: { label: "pitch", editor: "slider" } },
      { id: "head/yaw",   data: { label: "yaw",   editor: "slider" } },
    ],
  },
  { id: "name", data: { label: "name" } },
];

// Hoist row renderers so they're stable across renders.
const renderLabel = (row: FlatTreeRow<Row>) => <span>{row.data.label}</span>;
const renderEditor = (row: FlatTreeRow<Row>) =>
  row.data.editor === "slider" ? <input type="range" aria-label={row.data.label} /> : undefined;

<TreeGrid
  nodes={nodes}
  ariaLabel="Parameters"
  getLabel={renderLabel}
  getEditor={renderEditor}
/>;
```

A node with `children` is a **group** (gets an expand toggle). A node can be
*both* a group and editable — return an `editor` for it and it renders a toggle
*and* a control (e.g. a `color` node with a swatch that expands to `r`/`g`/`b`).

### Selection

Uncontrolled (the grid owns it):

```tsx
<TreeGrid nodes={nodes} getLabel={renderLabel}
  onSelectionChange={(ids) => console.log([...ids])} />
```

Controlled — keep your own store authoritative (this is how the animation
editor keeps selection in zustand and just mirrors it):

```tsx
<TreeGrid
  nodes={nodes}
  getLabel={renderLabel}
  selected={selectedIds}                 // Set<string> of node ids
  onSelectionChange={setSelectedIds}
  selectGroupDescendants                 // selecting a group selects its subtree
  scopeOf={(id) => instanceOf(id)}       // selection resets when crossing scopes…
  onScopeChange={(scope) => activate(scope)} // …and you're told when it does
/>;
```

The unit is the **node id**. If your domain selects by something else (the
animation editor selects `trackId`s), map node → domain inside
`onSelectionChange`.

### Collapse

Uncontrolled by default. To persist it, control it:

```tsx
<TreeGrid nodes={nodes} getLabel={renderLabel}
  collapsed={collapsedIds}               // string[] | Set<string> of group ids
  onCollapsedChange={(next) => persist([...next])} />
```

### Common options

| Prop | Default | Notes |
| --- | --- | --- |
| `guideLines` | `"full"` | `"full"` = a rule in every indent column (matches the animation track list). `"last-child"` = file-tree connectors that stop at last children. |
| `defaultLeafIcon` | small dot | Fallback icon for leaves with no `getLeafIcon`. Pass `null` for bare labels. |
| `resolveVisual` | neutral | `(state, data) => { bar?, background? }` — maps focus/selected/emphasis/anchor (+ your row data) to the left-bar + background tint. |
| `loop` | `false` | Roving focus wraps at the ends. |

### Keyboard (built in)

Up/Down/Home/End move focus · Left/Right collapse/expand a group · Space selects
(Shift = range, Ctrl/Cmd = toggle) · Enter enters the row's first control · Escape
returns focus to the row. Click selects; Ctrl/Shift-click toggle/range.

---

## Option B — à la carte

When you need a custom renderer (multi-column, a totally different row), compose
the pieces yourself. `TreeGrid`'s source is the reference for this.

```tsx
import {
  flattenTree, useCollapsibleTree, useTreeSelection,
  TreeNavRoot, TreeNavItem, TreeRow, TreeToggle,
  defaultResolveRowVisual,
} from "@semio/ui";

function MyList({ nodes }: { nodes: TreeNode<Row>[] }) {
  const collapse = useCollapsibleTree();
  const rows = flattenTree(nodes, { isCollapsed: collapse.isCollapsed });
  const order = rows.map((r) => r.id);
  const selection = useTreeSelection({ order });
  const [focus, setFocus] = useState(0);

  return (
    <TreeNavRoot role="tree" highlightedIndex={focus} onHighlightedIndexChange={setFocus}>
      {rows.map((row, i) => (
        <TreeNavItem
          key={row.id}
          ariaLevel={row.depth + 1}
          ariaSelected={selection.isSelected(row.id)}
          onClick={(e) => selection.select(row.id, { toggle: e.metaKey, range: e.shiftKey })}
        >
          <TreeRow
            depth={row.depth}
            ancestorIsLast={row.ancestorIsLast}
            icon={row.isGroup
              ? <TreeToggle expanded={row.expanded} onToggle={() => collapse.toggle(row.id)} />
              : undefined}
            label={<span>{row.data.label}</span>}
            visual={defaultResolveRowVisual(
              { focused: i === focus, selected: selection.isSelected(row.id), emphasized: false, anchor: selection.anchorId === row.id },
              row.data,
            )}
          />
        </TreeNavItem>
      ))}
    </TreeNavRoot>
  );
}
```

### The pieces

| Export | Kind | Responsibility |
| --- | --- | --- |
| `flattenTree(roots, { isCollapsed })` | fn | tree → ordered rows (`depth`, `isGroup`, `expanded`, `ancestorIsLast`) |
| `useCollapsibleTree(opts)` | hook | collapse set, controlled/uncontrolled |
| `useTreeSelection(opts)` | hook | selection gestures (replace/toggle/range) + anchor + scope policy. `applySelection` is the pure, testable core. |
| `resolveRowVisual` / `defaultResolveRowVisual` | type / fn | interaction-state → `{ bar, background }` |
| `TreeIndent` | component | indentation + guide-lines + icon slot |
| `TreeToggle` | component | disclosure chevron (accessible by default) |
| `TreeLeafDot` | component | default leaf icon |
| `TreeRow` | component | presentational row: indent · label · editor · actions, over a bar/background |
| `TreeNavRoot` / `TreeNavItem` | components | roving-focus adapter for **vertical** hierarchical lists, over Base UI's composite via `internals/composite` — the package's only import site for that unstable path. A two-dimensional pattern gets its own sibling adapter (`layouts/use-grid-navigation`) over the same primitive rather than adding orientation flags here. |
| `TreeGrid` | component | Option A — all of the above wired together |

---

## Accessibility

- `TreeToggle` follows the WAI-ARIA **disclosure** pattern (native button,
  `aria-expanded`, a guaranteed accessible name).
- `TreeIndent` guide-lines are decorative (`aria-hidden`).
- `TreeGrid` renders `role="tree"` / `treeitem` with `aria-level` / `aria-expanded`
  / `aria-selected`. `TreeRow` on its own asserts **no** role — a custom renderer
  opts into tree semantics via its `role` / `ariaLevel` / `ariaExpanded` /
  `ariaSelected` props once it supplies the keyboard layer.

## Testing

Behavior that needs a real DOM (focus, keyboard, roving `tabIndex`) is covered by
**vitest browser mode** (`*.browser.tsx`, real Chromium via Playwright); pure
logic and markup use node unit tests (`*.test.ts(x)`). Run `npm run test:unit`
(fast, no browser) or `npm run test:browser`.
