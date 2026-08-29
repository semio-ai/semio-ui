import { useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { TreeNavItem, TreeNavRoot } from "./use-tree-navigation";

/**
 * Roving focus over an index space **larger than the DOM** — the property windowing
 * depends on, and the one Base UI does not promise.
 *
 * `TreeNavRoot` keeps the composite's element array in the data's index space, so
 * every row that is scrolled out is a hole in that array. Two undocumented Base UI
 * behaviours make that work: bounds come from the array's `length` rather than from
 * how many elements are really in it, and an absent element counts as an *enabled*
 * row rather than a wall. Neither is a documented contract, so each is pinned here
 * by its own test: if a Base UI upgrade changes one, these fail rather than a
 * consumer's ten-thousand-row list quietly navigating only the visible dozen.
 */

const TOTAL = 1000;

/** A list that renders a moving slice of `TOTAL` rows, always including the cursor. */
function WindowedNav({
  total = TOTAL,
  disabledIndices,
  loop = false,
  windowSize = 10,
}: {
  total?: number;
  disabledIndices?: number[];
  loop?: boolean;
  windowSize?: number;
}) {
  const [highlighted, setHighlighted] = useState(0);
  const start = Math.max(0, highlighted - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize);
  const indices = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div>
      <span data-testid="cursor">{highlighted}</span>
      <span data-testid="mounted">{indices.length}</span>
      <TreeNavRoot
        role="listbox"
        ariaLabel="windowed"
        highlightedIndex={highlighted}
        onHighlightedIndexChange={setHighlighted}
        total={total}
        disabledIndices={disabledIndices}
        loop={loop}
      >
        {indices.map((index) => (
          <TreeNavItem key={index} index={index} role="option" ariaSetSize={total}>
            <span>row {index}</span>
          </TreeNavItem>
        ))}
      </TreeNavRoot>
    </div>
  );
}

const cursor = (view: { container: HTMLElement }) =>
  view.container.querySelector<HTMLElement>('[data-testid="cursor"]')!.textContent;
const rowByText = (view: { container: HTMLElement }, index: number) =>
  [...view.container.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (element) => element.textContent === `row ${index.toString()}`,
  );

test("only the window is in the DOM, but the cursor is the whole list's", async () => {
  const view = render(<WindowedNav />);
  expect(view.container.querySelectorAll('[role="option"]')).toHaveLength(10);
  rowByText(view, 0)!.focus();

  for (let i = 0; i < 40; i++) await userEvent.keyboard("{ArrowDown}");

  expect(cursor(view)).toBe("40");
  // Still ten rows mounted — the window moved rather than grew.
  expect(view.container.querySelectorAll('[role="option"]')).toHaveLength(10);
});

test("ArrowDown crosses the window edge and focus follows into the new row", async () => {
  const view = render(<WindowedNav windowSize={6} />);
  rowByText(view, 0)!.focus();

  for (let i = 0; i < 12; i++) await userEvent.keyboard("{ArrowDown}");

  expect(cursor(view)).toBe("12");
  const focused = rowByText(view, 12);
  expect(focused).toBeDefined();
  // The row holding focus did not exist when the key was pressed; the cursor being
  // pinned into the window is what makes the composite's focus() find it.
  expect(document.activeElement).toBe(focused);
  expect(focused!.tabIndex).toBe(0);
});

test("End reaches the last row in the DATA, not the last one rendered", async () => {
  const view = render(<WindowedNav />);
  rowByText(view, 0)!.focus();
  await userEvent.keyboard("{End}");
  // Pins: bounds are taken from the element array's length, which is `total`.
  expect(cursor(view)).toBe(String(TOTAL - 1));
  expect(document.activeElement).toBe(rowByText(view, TOTAL - 1));
});

test("Home returns to the first row from deep in the list", async () => {
  const view = render(<WindowedNav />);
  rowByText(view, 0)!.focus();
  await userEvent.keyboard("{End}");
  await userEvent.keyboard("{Home}");
  expect(cursor(view)).toBe("0");
  expect(document.activeElement).toBe(rowByText(view, 0));
});

test("an unmounted row is a hole, not a wall — navigation passes straight through", async () => {
  // Pins the second Base UI behaviour: `isListIndexDisabled` treats an absent element
  // as enabled. Were a hole to read as disabled, ArrowDown would refuse to leave the
  // window and this would stall at its edge.
  const view = render(<WindowedNav windowSize={4} />);
  rowByText(view, 0)!.focus();
  for (let i = 0; i < 25; i++) await userEvent.keyboard("{ArrowDown}");
  expect(cursor(view)).toBe("25");
});

test("disabled rows are skipped from the index list, even while unrendered", async () => {
  // A windowed list cannot rely on `aria-disabled`: rows 1-3 are not in the DOM to
  // carry it. The container takes the indices instead.
  const view = render(<WindowedNav disabledIndices={[1, 2, 3]} windowSize={8} />);
  rowByText(view, 0)!.focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(cursor(view)).toBe("4");
});

test("End skips a disabled last row", async () => {
  const view = render(<WindowedNav disabledIndices={[TOTAL - 1]} />);
  rowByText(view, 0)!.focus();
  await userEvent.keyboard("{End}");
  expect(cursor(view)).toBe(String(TOTAL - 2));
});

test("a scrolled-out row leaves no stale element behind", async () => {
  // The trap this guards: a detached node left in the array reads as *disabled* to the
  // composite (it checks visibility), so a row that had been scrolled out and whose
  // slot was never cleared would become a permanent gap. Going out and coming back
  // must land on the row itself.
  const view = render(<WindowedNav windowSize={4} />);
  rowByText(view, 0)!.focus();
  for (let i = 0; i < 10; i++) await userEvent.keyboard("{ArrowDown}");
  expect(cursor(view)).toBe("10");
  for (let i = 0; i < 10; i++) await userEvent.keyboard("{ArrowUp}");
  expect(cursor(view)).toBe("0");
  expect(document.activeElement).toBe(rowByText(view, 0));
});

test("loop wraps to the last row in the data", async () => {
  const view = render(<WindowedNav loop />);
  rowByText(view, 0)!.focus();
  await userEvent.keyboard("{ArrowUp}");
  expect(cursor(view)).toBe(String(TOTAL - 1));
});

test("exactly one row is the tab stop", () => {
  const view = render(<WindowedNav />);
  const stops = [...view.container.querySelectorAll<HTMLElement>('[role="option"]')].filter(
    (element) => element.tabIndex === 0,
  );
  expect(stops).toHaveLength(1);
  expect(stops[0].textContent).toBe("row 0");
});

test("a shrinking list does not leave the cursor out of bounds", async () => {
  // The element array is truncated to `total`, so End on a list that just got shorter
  // lands inside it rather than on a stale index.
  const view = render(<WindowedNav total={5} windowSize={5} />);
  rowByText(view, 0)!.focus();
  await userEvent.keyboard("{End}");
  expect(cursor(view)).toBe("4");
});

test("the row reports the list's size, not the window's", () => {
  const view = render(<WindowedNav />);
  expect(rowByText(view, 0)!.getAttribute("aria-setsize")).toBe(String(TOTAL));
});

/**
 * The same moving slice under the **grid** vocabulary — `grid`/`row` rather than
 * `listbox`/`option`. Its start is deliberately not zero: window-relative numbering
 * satisfies "every row has an `aria-rowindex`" while naming the wrong row, and only an
 * offset slice tells the two apart.
 */
function WindowedGridNav({ start, windowSize = 10 }: { start: number; windowSize?: number }) {
  const indices = Array.from({ length: windowSize }, (_, i) => start + i);
  return (
    <TreeNavRoot
      role="grid"
      ariaRowCount={TOTAL}
      ariaLabel="windowed grid"
      highlightedIndex={start}
      onHighlightedIndexChange={() => undefined}
      total={TOTAL}
    >
      {indices.map((index) => (
        <TreeNavItem key={index} index={index} role="row" ariaRowIndex={index + 1}>
          <span>row {index}</span>
        </TreeNavItem>
      ))}
    </TreeNavRoot>
  );
}

test("a grid row's index is its place in the data, and it carries no list ARIA", () => {
  const view = render(<WindowedGridNav start={500} />);
  const rows = [...view.container.querySelectorAll<HTMLElement>('[role="row"]')];
  expect(rows).toHaveLength(10);

  // The count of rows a reader is told about is the data's; ten are mounted.
  expect(view.container.querySelector('[role="grid"]')!.getAttribute("aria-rowcount")).toBe(
    String(TOTAL),
  );
  expect(rows.map((row) => row.getAttribute("aria-rowindex"))).toEqual(
    Array.from({ length: 10 }, (_, i) => String(501 + i)),
  );

  // `total` reaches the container's navigation arithmetic and stops there. `row` permits
  // setsize/posinset, but they place a row among siblings at one level — a `treegrid`'s
  // question — so on a flat grid they restate `aria-rowindex` in a second vocabulary.
  for (const row of rows) {
    expect(row.getAttribute("aria-setsize")).toBeNull();
    expect(row.getAttribute("aria-posinset")).toBeNull();
  }
});

test("the roles that do define the list vocabulary keep it, and take no row index", () => {
  // The other direction of the assertion above, without which "correctly withheld from
  // `row`" and "never emitted at all" look identical.
  const view = render(
    <>
      <TreeNavRoot
        role="tree"
        ariaLabel="tree"
        highlightedIndex={0}
        onHighlightedIndexChange={() => undefined}
        total={1}
      >
        <TreeNavItem index={0} role="treeitem" ariaLevel={1} ariaSetSize={7} ariaPosInSet={3}>
          <span>branch</span>
        </TreeNavItem>
      </TreeNavRoot>
      <TreeNavRoot
        role="listbox"
        ariaLabel="listbox"
        highlightedIndex={0}
        onHighlightedIndexChange={() => undefined}
        total={1}
      >
        <TreeNavItem index={0} role="option" ariaSetSize={7} ariaPosInSet={3}>
          <span>leaf</span>
        </TreeNavItem>
      </TreeNavRoot>
    </>,
  );

  for (const role of ["treeitem", "option"]) {
    const item = view.container.querySelector<HTMLElement>(`[role="${role}"]`)!;
    expect(item.getAttribute("aria-setsize")).toBe("7");
    expect(item.getAttribute("aria-posinset")).toBe("3");
    expect(item.getAttribute("aria-rowindex")).toBeNull();
  }
});

/**
 * Cursor and rendered slice controlled independently, so the gap between "the cursor
 * moved to a row that is not mounted" and "that row finally mounts" can be held open
 * for as long as a test likes. `WindowedNav` above cannot express it: it derives its
 * window from the cursor, so the cursor's row is always present.
 */
function DetachedWindowNav({ cursorIndex, rendered }: { cursorIndex: number; rendered: number[] }) {
  return (
    <div>
      <button type="button" data-testid="outside">
        outside
      </button>
      <TreeNavRoot
        role="listbox"
        ariaLabel="detached"
        highlightedIndex={cursorIndex}
        onHighlightedIndexChange={() => undefined}
        total={TOTAL}
      >
        {rendered.map((index) => (
          <TreeNavItem key={index} index={index} role="option" ariaSetSize={TOTAL}>
            <span>row {index}</span>
          </TreeNavItem>
        ))}
      </TreeNavRoot>
    </div>
  );
}

test("focus owed to an unmounted row is cancelled when the user leaves the list", () => {
  // The debt outlives the render that incurred it — deliberately, because the row it is
  // owed to usually arrives a commit or two later once the list has scrolled to it. What
  // must not outlive the user: if they have gone somewhere else in the meantime, the row
  // mounting is not permission to drag them back. Reachable without a race whenever the
  // row does not mount promptly — the cursor jumped clear of the window, the list
  // re-filtered — since a mouse-scroll much later is enough to bring it in.
  const view = render(<DetachedWindowNav cursorIndex={0} rendered={[0, 1, 2, 3]} />);
  rowByText(view, 0)!.focus();
  expect(document.activeElement).toBe(rowByText(view, 0));

  // Cursor moves to a row that is not mounted: focus is now owed to row 500.
  view.rerender(<DetachedWindowNav cursorIndex={500} rendered={[0, 1, 2, 3]} />);

  // The user leaves for something else entirely, with the debt still outstanding.
  const outside = view.container.querySelector<HTMLElement>('[data-testid="outside"]')!;
  outside.focus();
  expect(document.activeElement).toBe(outside);

  // Row 500 arrives. It must not take focus off what the user is actually using.
  view.rerender(<DetachedWindowNav cursorIndex={500} rendered={[499, 500, 501]} />);
  expect(rowByText(view, 500)).toBeDefined();
  expect(document.activeElement).toBe(outside);
});
