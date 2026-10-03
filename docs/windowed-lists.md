# Windowed (virtualized) lists and trees

`ListGrid` and `TreeGrid` render **every row** by default. That is right into the
hundreds and wrong at thousands: the DOM and the mount cost both grow with the data.
Passing `virtualized` renders only the rows near the viewport instead.

It is **opt-in**, and deliberately not automatic above some row count, for two reasons:
it needs a scroll container that only you can identify, and it changes what "a column
as wide as its content" means. Both are visible trade-offs rather than optimizations
to apply behind a caller's back.

> **React 19 or later.** The row primitives take `ref` as an ordinary prop, which is
> React 19 behaviour. On React 18 the measurement ref never attaches and a windowed
> list silently keeps using its estimated row height.

---

## The one thing you have to get right

**A windowed list does not own its scroll container — you do — and it needs a ref to
the element that actually scrolls.** Everything else is defaults.

```tsx
import { useRef } from "react";
import { ListGrid } from "@semio/ui";

function Assets({ rows }: { rows: Asset[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <ListGrid
        data={rows}
        getRowId={(r) => r.id}
        columns={columns}
        virtualized
        scrollRef={scrollRef}
        selectionMode="single"
        ariaLabel="Assets"
      />
    </div>
  );
}
```

Two mistakes to avoid:

- **Pointing `scrollRef` at the wrong element.** It must be the element with the
  overflow, not an ancestor of it. If in doubt, the element whose `scrollTop` changes
  when you scroll is the one.
- **Forgetting it entirely.** With `virtualized` set and no `scrollRef`, the list
  degrades to rendering every row — correct output, none of the benefit — and warns
  once in development. It does not throw, so the warning is the only signal.

### Inside a `ScrollArea`

`ScrollArea` is a Radix scroll area, so the element that scrolls is its _viewport_,
not its root. Reach it with `viewportRef` and hand the same ref to the grid:

```tsx
const viewportRef = useRef<HTMLDivElement>(null);

<ScrollArea viewportRef={viewportRef}>
  <ListGrid data={rows} virtualized scrollRef={viewportRef} … />
</ScrollArea>
```

`viewportRef` is purely additive — `onScrollChange`, `onViewportChange`, the
`motionScrollY`/`motionScrollX` values and the imperative `ScrollAreaRef` all keep
working and remain the way to _observe_ scrolling. This hands out the node.

**Pass something stable** — a `useRef` object, or a callback held still with
`useCallback`. React re-attaches a ref whose identity changed, so an inline arrow
hands you a `null` on every render of the component above it. That is React's
behaviour rather than `ScrollArea`'s, but it matters here because that node is where
the whole geometry is read from.

---

## Trees

Identical, because `flattenTree` has already turned the hierarchy into an array — the
rows on screen are a slice of it, and collapsing a group just makes it shorter:

```tsx
const scrollRef = useRef<HTMLDivElement>(null);

<div ref={scrollRef} className="h-full overflow-y-auto">
  <TreeGrid nodes={nodes} virtualized scrollRef={scrollRef} getLabel={renderLabel} />
</div>;
```

**Memoize `nodes`.** `TreeGrid` re-flattens whenever their identity changes, so
building the tree inline in JSX re-flattens every row on every render — which at ten
thousand rows undoes what windowing bought you. This is true unwindowed too; windowing
just raises the stakes.

Indentation, guide lines and depth are per-row facts, so they are unaffected by a
row's neighbours being absent. So is subtree selection: `selectGroupDescendants`
is computed from the nodes and the id order, never from what is rendered, so clicking
a group still takes all of its children including the ones far outside the window.

---

## What windowing does _not_ change

Everything that operates on the data keeps operating on the data:

|                                        |                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Selection, range selection, select-all | over the whole id order — a Shift+End range spans rows that were never rendered             |
| Type-ahead                             | matches the whole data set and scrolls the match into view                                  |
| `Home` / `End`, arrow bounds, `loop`   | the ends of the **list**, not of the window                                                 |
| `selectGroupDescendants`               | the whole subtree                                                                           |
| A row's position in ARIA               | reported from the data, so assistive technology is not told the window's size is the list's |

Which properties carry that position depends on the role. A `treeitem` or an `option`
is placed by `aria-setsize`/`aria-posinset`. A `grid` states `aria-rowcount` and its
rows `aria-rowindex` — one numbering over **every** row the grid owns, so `ListGrid`
counts its column header as row 1 and a `noHeader` grid numbers from its first datum.
Both halves move together or the last row comes up one short of the count.

Pick one pair per row rather than supplying both. `row` permits setsize/posinset as
well, but there they mean position among sibling rows at one level, which is a
`treegrid`'s question; on a flat grid they restate `aria-rowindex` in a vocabulary
that implies a hierarchy the grid does not have.

A grid's rows also own **cells**, and have to say so: `gridcell` on each body cell,
`columnheader` in the header row. A cell with no role is generic, the accessibility
tree prunes it, and the row is left stating an index over nothing — which reads as a
correctly numbered, entirely empty grid.

If you find something that narrowed to the visible rows, that is a bug — please file it.

---

## Columns are content-sized, and stay put

A CSS `auto` track is as wide as the cells the browser can see, which under windowing
means the _rendered_ rows. Left alone, columns resize as you scroll — measured at
around 100px of lateral movement on a column holding mixed-width values, which reads
as the table rearranging itself under the reader.

So a windowed list also keeps a **floor** per content-sized track: the widest that
track has been since the data, the columns, or the container's width last changed.
Columns still size to their content and still respond to the container; they grow into
place and never snap back mid-scroll.

You usually need nothing here. When you do:

| Prop                   | Effect                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ListColumn.minWidth`  | a floor up front, composed with the measured one — the wider wins. Use it to stop a column collapsing when its visible cells happen to be empty. |
| `ListColumn.width`     | opts out of content sizing entirely; the track is exactly this.                                                                                  |
| `ListColumn.hideBelow` | unchanged — still a pure CSS container query, and the floors are discarded on a container resize so a hidden column still collapses to zero.     |

---

## Row height

Windowing assumes **uniform row heights**, which the row primitives guarantee: both
`ListRow` and `TreeRow` take their height from `ROW_HEIGHT[size]`, because a row here
is deliberately a single line. Choose the density with `size` (`Md` = `h-9` is the
default and the anchor the rest of the product is spaced to); a row's height changes,
not how much content fits in it. Content that needs two lines is yours to shorten —
truncate it, drop a column, move it to a detail view.

The height is **measured** rather than assumed, because `ROW_HEIGHT` is a `rem` class
and its pixel value depends on your app's root font size. `ROW_HEIGHT_PX` is only an
estimate for the first paint, before a row exists to measure; the window corrects
itself once one does. Both are exported from `@semio/ui` if you are building rows
yourself.

`overscan` (default 6) is how many rows are rendered beyond each edge of the viewport.
Raise it if fast scrolling shows gaps on a slow machine.

---

## À la carte: `useRowWindow`

If you compose the row primitives directly instead of using `ListGrid`/`TreeGrid`, the
hook underneath is exported. It answers "which slice is worth rendering, and how much
empty space stands in for the rest".

```tsx
import { useEffect, useRef, useState } from "react";
import { ROW_HEIGHT_PX, Size, TreeNavItem, TreeNavRoot, TreeRow, useRowWindow } from "@semio/ui";

interface Row {
  id: string;
  name: string;
}

export function MyWindowedList({ rows }: { rows: Row[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);

  const rowWindow = useRowWindow({
    total: rows.length,
    scrollRef,
    estimatedRowHeight: ROW_HEIGHT_PX[Size.Md],
    // Keeps the keyboard cursor mounted so roving focus can cross a window edge.
    pinnedIndex: cursor,
  });

  // Moving the cursor scrolls to it; this is what makes Home/End and type-ahead work
  // when their target is outside the rendered slice.
  useEffect(() => {
    rowWindow.scrollToIndex(cursor);
  }, [cursor, rowWindow]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <TreeNavRoot
        highlightedIndex={cursor}
        onHighlightedIndexChange={setCursor}
        // The index space is the DATA's, not the window's.
        total={rows.length}
        // Something must stay tabbable when the cursor is scrolled out of view.
        tabStopIndex={rowWindow.pinnedIndexInWindow ? cursor : rowWindow.start}
      >
        {rowWindow.paddingTop > 0 && <div aria-hidden style={{ height: rowWindow.paddingTop }} />}
        {rows.slice(rowWindow.start, rowWindow.end).map((row, offset) => {
          const index = rowWindow.start + offset;
          return (
            <TreeNavItem
              key={row.id}
              index={index}
              ariaSetSize={rows.length}
              ariaPosInSet={index + 1}
            >
              <TreeRow
                // One row reports the real height the arithmetic runs on.
                ref={offset === 0 ? rowWindow.measureRef : undefined}
                depth={0}
                label={<span>{row.name}</span>}
              />
            </TreeNavItem>
          );
        })}
        {rowWindow.paddingBottom > 0 && (
          <div aria-hidden style={{ height: rowWindow.paddingBottom }} />
        )}
      </TreeNavRoot>
    </div>
  );
}
```

Four contracts are easy to get wrong, and each fails quietly:

1. **Spacers, not absolute positioning.** An absolutely-positioned grid item leaves
   the track sizing it would otherwise take part in, which for rows laid out on
   `grid-cols-subgrid` means losing column alignment altogether. Empty spacer rows
   keep every row in normal flow.
2. **`TreeNavItem.index` is the row's index in the DATA**, not in the slice. The
   container keeps its element array in the data's index space, so absolute indices
   are what make `Home`/`End` and the arrow bounds mean the ends of the list.
3. **`TreeNavRoot.total` is the full row count.** It is the index space every keyboard
   calculation runs in.
4. **Disabled rows must be declared as `disabledIndices`** on the root. Roving
   navigation otherwise reads `aria-disabled` off the elements, and a row that is
   scrolled out has none.

`pinnedIndexInWindow` is false when the cursor is too far from the scroll offset to be
worth rendering — after the user has scrolled away from it with the mouse. Point
`tabStopIndex` at a row that exists in that case, or the list drops out of the tab
order until they happen to scroll back.

---

## Testing a windowed list

Two things are worth asserting, and one environment note.

Assert that the **DOM is bounded** — that is the property you are buying, and the one
a performance regression would take away:

```tsx
expect(container.querySelectorAll('[role="option"]').length).toBeLessThan(40);
expect(scroller.scrollHeight).toBeGreaterThan(10_000 * ROW - ROW * 2);
```

Assert that the data-wide behaviour survived: a `Shift+End` range that spans unrendered
rows, `End` reaching the real last row, type-ahead finding a match thousands of rows
away.

The environment note: most of this package's browser tests run **without the compiled
stylesheet**, so every Tailwind class in the components is inert. That is fine for focus,
keyboard and selection — and leaving the stylesheet out of those keeps them from quietly
coming to depend on paint.

Windowing is the exception, because its claims are about real geometry: uniform row
heights, and cells aligned on shared column tracks. A layout suite gets the **real**
stylesheet with one import:

```tsx
import "../test-stylesheet";
```

That compiles `make-kit/make.css` — the same entry the shipped `dist/semio-ui.css` is
built from — so a class resolves in the test to what it resolves to in the product. See
`list-grid-virtual.browser.tsx` and `tree-grid-virtual.browser.tsx`.

**Do not hand-write stand-in rules** (`.h-9 { height: 2.25rem }` and friends). That is
what these suites used to do, and such a test can only agree with itself: change `h-9` or
`grid-cols-subgrid` and the stand-in keeps passing while the product breaks. Spacer-based
positioning is exactly the kind of thing that satisfies a DOM assertion while being
visibly wrong on screen, which is why the geometry has to be the real one.
