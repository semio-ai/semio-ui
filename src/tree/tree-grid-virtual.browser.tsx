import { useMemo, useRef, useState } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Size } from "../types";
import { TreeGrid } from "./tree-grid";
import type { TreeNode } from "./flatten-tree";
import "../test-stylesheet";

/**
 * `TreeGrid` with `virtualized`.
 *
 * A tree windows the same way a flat list does, because `flattenTree` has already turned
 * the hierarchy into an array — so what is worth testing here is the part that is *not*
 * shared: the total is the flattened length, which changes when a group collapses, and
 * each row's depth is its own property rather than something inferred from its
 * neighbours, so indentation has to survive a row's neighbours being absent.
 */

const VIEWPORT = 360;

interface Datum {
  label: string;
}

/** `groups` groups of `perGroup` leaves — 10,100 flattened rows at the defaults. */
const makeTree = (groups = 100, perGroup = 100): TreeNode<Datum>[] =>
  Array.from({ length: groups }, (_unusedGroup, g) => ({
    id: `g${g.toString()}`,
    data: { label: `Group ${g.toString()}` },
    children: Array.from({ length: perGroup }, (_unusedLeaf, c) => ({
      id: `g${g.toString()}-c${c.toString()}`,
      data: { label: `Leaf ${g.toString()}.${c.toString()}` },
    })),
  }));

/** Stable so it is not a new component type on every render. */
const renderLabel = (row: { data: Datum }) => <span>{row.data.label}</span>;

function Harness({
  build,
  collapsed,
  size,
  selectGroupDescendants,
  onSelectionChange,
}: {
  build: () => TreeNode<Datum>[];
  collapsed?: Iterable<string>;
  size?: Size;
  selectGroupDescendants?: boolean;
  onSelectionChange?: (next: Set<string>) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodes = useMemo(build, [build]);
  return (
    <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
      <TreeGrid
        nodes={nodes}
        collapsed={collapsed}
        size={size}
        selectGroupDescendants={selectGroupDescendants}
        onSelectionChange={onSelectionChange}
        virtualized
        scrollRef={scrollRef}
        ariaLabel="Virtual tree"
        getLabel={renderLabel}
      />
    </div>
  );
}

const settle = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

const scroller = (view: { container: HTMLElement }) =>
  view.container.querySelector<HTMLElement>('[data-testid="scroller"]')!;
const items = (view: { container: HTMLElement }) =>
  view.container.querySelectorAll<HTMLElement>('[role="treeitem"]');
const labels = (view: { container: HTMLElement }) =>
  [...items(view)].map((element) => element.textContent ?? "");
const itemByLabel = (view: { container: HTMLElement }, label: string) =>
  [...items(view)].find((element) => element.textContent === label);

test("a ten-thousand-row tree mounts a bounded window", async () => {
  const view = render(<Harness build={() => makeTree()} />);
  await settle();

  expect(items(view).length).toBeLessThan(60);
  // The first group and its first leaves, not the whole tree.
  expect(labels(view)).toContain("Group 0");
  expect(labels(view)).toContain("Leaf 0.0");
  expect(labels(view)).not.toContain("Group 50");
});

test("collapsing groups shortens the list the window is measured against", async () => {
  const nodes = makeTree(100, 100);
  const expanded = render(<Harness build={() => nodes} />);
  await settle();
  const expandedHeight = scroller(expanded).scrollHeight;

  // Every group closed: 100 rows instead of 10,100.
  const collapsedIds = Array.from({ length: 100 }, (_, g) => `g${g.toString()}`);
  const collapsed = render(<Harness build={() => nodes} collapsed={collapsedIds} />);
  await settle();
  const collapsedHeight = scroller(collapsed).scrollHeight;

  expect(collapsedHeight).toBeLessThan(expandedHeight / 50);
  // …and with only 100 rows left, all of them fit in the window's reach.
  expect(labels(collapsed)).toContain("Group 0");
});

test("End reaches the last flattened row", async () => {
  const view = render(<Harness build={() => makeTree(100, 100)} />);
  await settle();
  items(view)[0].focus();

  await userEvent.keyboard("{End}");
  await settle();

  const last = itemByLabel(view, "Leaf 99.99");
  expect(last).toBeDefined();
  expect(document.activeElement).toBe(last);
});

test("a row deep in the tree keeps its own depth while its neighbours are absent", async () => {
  const view = render(<Harness build={() => makeTree(100, 100)} />);
  await settle();

  scroller(view).scrollTop = 5_000 * 36;
  await settle();

  const leaf = [...items(view)].find((element) => element.textContent?.startsWith("Leaf"))!;
  const group = [...items(view)].find((element) => element.textContent?.startsWith("Group"));
  // Depth is a property of the flattened row, so it does not depend on the parent row
  // being rendered — which, mid-window, it often is not.
  expect(leaf.getAttribute("aria-level")).toBe("2");
  if (group) expect(group.getAttribute("aria-level")).toBe("1");
});

test("expanding a group in view lengthens the list without disturbing the window", async () => {
  function Expandable() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const nodes = useMemo(() => makeTree(100, 100), []);
    const [collapsed, setCollapsed] = useState<Set<string>>(
      () => new Set(Array.from({ length: 100 }, (_, g) => `g${g.toString()}`)),
    );
    return (
      <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
        <TreeGrid
          nodes={nodes}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          virtualized
          scrollRef={scrollRef}
          ariaLabel="Expandable tree"
          getLabel={renderLabel}
        />
      </div>
    );
  }
  const view = render(<Expandable />);
  await settle();
  const before = scroller(view).scrollHeight;
  expect(labels(view)).not.toContain("Leaf 0.0");

  // Open the first group via its own disclosure control.
  const toggle = items(view)[0].querySelector("button")!;
  toggle.click();
  await settle();

  expect(labels(view)).toContain("Leaf 0.0");
  expect(scroller(view).scrollHeight).toBeGreaterThan(before);
  expect(items(view).length).toBeLessThan(60);
});

test("windowing off renders every visible row", async () => {
  const view = render(
    <div style={{ height: VIEWPORT, overflowY: "auto" }}>
      <TreeGrid nodes={makeTree(5, 10)} ariaLabel="Plain tree" getLabel={renderLabel} />
    </div>,
  );
  await settle();
  // 5 groups + 50 leaves.
  expect(view.container.querySelectorAll('[role="treeitem"]')).toHaveLength(55);
});

test("a smaller size gives shorter rows, and the window follows them", async () => {
  // The row height and the windowing estimate come from ONE table, so choosing a size
  // cannot leave the spacers describing a different geometry than the rows. `Sm` is `h-8`
  // against `Md`'s `h-9`, so the same tree is measurably shorter and still adds up.
  const view = render(<Harness build={() => makeTree(50, 20)} size={Size.Sm} />);
  await settle();

  const rowHeight = items(view)[0].getBoundingClientRect().height;
  expect(rowHeight).toBeCloseTo(32, 0);

  // 50 groups + 1000 leaves, at the height the rows actually are.
  const total = 50 + 50 * 20;
  expect(Math.abs(scroller(view).scrollHeight - total * rowHeight)).toBeLessThan(rowHeight * 2);
});

test("End still reaches the last row at a non-default size", async () => {
  const view = render(<Harness build={() => makeTree(30, 20)} size={Size.Xl} />);
  await settle();
  items(view)[0].focus();

  await userEvent.keyboard("{End}");
  await settle();

  const last = itemByLabel(view, "Leaf 29.19");
  expect(last).toBeDefined();
  expect(document.activeElement).toBe(last);
});

test("selecting a group selects its whole subtree, including rows that were never rendered", async () => {
  // `selectGroupDescendants` is built on `collectDescendants`, which walks the NODES —
  // the tree as given, not the slice on screen — and on `useTreeSelection`, which is pure
  // id arithmetic with no DOM in it. So the property to pin is that windowing changes
  // nothing here: a group's hundred children are selected even though about fifteen rows
  // exist as elements and none of those children are among them.
  const onSelectionChange = vi.fn();
  const view = render(
    <Harness
      build={() => makeTree(100, 100)}
      selectGroupDescendants
      onSelectionChange={onSelectionChange}
    />,
  );
  await settle();

  const mounted = items(view).length;
  expect(mounted).toBeLessThan(60);

  // The first row is Group 0. Click the row itself, not its disclosure toggle.
  items(view)[0].click();
  await settle();

  const selected = onSelectionChange.mock.calls.at(-1)![0] as Set<string>;
  // The group plus all hundred of its leaves.
  expect(selected.size).toBe(101);
  expect(selected.has("g0")).toBe(true);
  expect(selected.has("g0-c0")).toBe(true);
  // A leaf far outside the rendered window, which has no element to have been clicked.
  expect(selected.has("g0-c99")).toBe(true);
  expect(view.container.querySelector('[data-testid="scroller"]')).toBeTruthy();
});

test("without the flag, selecting a group selects only the group", async () => {
  // The default, and the difference worth being explicit about: a group row is selectable
  // in its own right unless the consumer asks for subtree selection.
  const onSelectionChange = vi.fn();
  const view = render(
    <Harness build={() => makeTree(100, 100)} onSelectionChange={onSelectionChange} />,
  );
  await settle();

  items(view)[0].click();
  await settle();

  const selected = onSelectionChange.mock.calls.at(-1)![0] as Set<string>;
  expect([...selected]).toEqual(["g0"]);
});

test("spacers put each rendered tree row at its true offset", async () => {
  // Same claim as the list's, and the tree has no header to complicate it: the row at
  // flattened index N must sit exactly N row-heights down, or the rows drift away from the
  // scrollbar. Verified against a deliberately introduced one-row spacer error.
  const view = render(<Harness build={() => makeTree(100, 100)} />);
  await settle();
  scroller(view).scrollTop = 4_000 * 36;
  await settle();

  const root = view.container.querySelector<HTMLElement>('[role="tree"]')!;
  const rootTop = root.getBoundingClientRect().top;
  const rows = [...items(view)];
  const rowHeight = rows[0].getBoundingClientRect().height;
  expect(rowHeight).toBeCloseTo(36, 0);

  // `aria-level` is not an index, so derive each row's flattened index from its label:
  // group g is at g * 101, and its leaf c one past that.
  const indexOf = (row: HTMLElement) => {
    const text = row.textContent ?? "";
    const group = /^Group (\d+)$/.exec(text);
    if (group) return Number(group[1]) * 101;
    const leaf = /^Leaf (\d+)\.(\d+)$/.exec(text)!;
    return Number(leaf[1]) * 101 + 1 + Number(leaf[2]);
  };

  for (const row of rows) {
    const offset = row.getBoundingClientRect().top - rootTop;
    expect(offset).toBeCloseTo(indexOf(row) * rowHeight, 0);
  }

  const last = rows.at(-1)!;
  const remaining = 10_100 - 1 - indexOf(last);
  const bottomGap = root.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
  expect(bottomGap).toBeCloseTo(remaining * rowHeight, 0);
});
