import { useMemo, useRef, useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { TreeGrid } from "./tree-grid";
import type { TreeNode } from "./flatten-tree";

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
}: {
  build: () => TreeNode<Datum>[];
  collapsed?: Iterable<string>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodes = useMemo(build, [build]);
  return (
    <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
      <TreeGrid
        nodes={nodes}
        collapsed={collapsed}
        virtualized
        scrollRef={scrollRef}
        ariaLabel="Virtual tree"
        getLabel={renderLabel}
      />
    </div>
  );
}

/**
 * The one rule the windowing arithmetic depends on.
 *
 * Windowing assumes uniform row heights, and `TreeRow` guarantees that with `h-9` — but
 * these tests run without the package's stylesheet, so without this every row is
 * content-sized and a group row (which carries a chevron button) is a fraction of a pixel
 * taller than a leaf. Fractions compound over ten thousand rows into a list whose spacers
 * and rows disagree about where the bottom is, which is a fact about the test environment
 * rather than about the component. Supplying the height restores the precondition the
 * component states.
 */
function withRowHeightCss() {
  const style = document.createElement("style");
  style.textContent = ".h-9 { height: 2.25rem; } .flex { display: flex; }";
  document.head.append(style);
  return () => {
    style.remove();
  };
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
  withRowHeightCss();
  const view = render(<Harness build={() => makeTree()} />);
  await settle();

  expect(items(view).length).toBeLessThan(60);
  // The first group and its first leaves, not the whole tree.
  expect(labels(view)).toContain("Group 0");
  expect(labels(view)).toContain("Leaf 0.0");
  expect(labels(view)).not.toContain("Group 50");
});

test("collapsing groups shortens the list the window is measured against", async () => {
  withRowHeightCss();
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
  withRowHeightCss();
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
  withRowHeightCss();
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
  withRowHeightCss();
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
