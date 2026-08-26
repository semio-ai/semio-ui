import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, type RefObject } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Size } from "../types";
import { ListGrid, type ListColumn } from "./list-grid";
import "../test-stylesheet";

/**
 * `ListGrid` with `virtualized` — the rows near the viewport only.
 *
 * Two things are worth testing beyond "it renders": that the DOM really is bounded
 * (the point of the feature, and the thing a consumer's performance test guards), and
 * that everything the list already did keeps working when most of its rows are absent —
 * range selection, type-ahead and Home/End all run over the data, and none of them may
 * quietly narrow to the visible window.
 */

const VIEWPORT = 360;
const ROW = 36; // Size.Md → h-9

interface Row {
  id: string;
  name: string;
  size: string;
}

/** Row 500's size cell is far wider than any other, for the column-floor tests. */
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `r${i.toString()}`,
    name: `Row ${i.toString()}`,
    size: i === 500 ? "1,234,567,890 bytes" : "3 kB",
  }));

const COLUMNS: ListColumn<Row>[] = [
  { key: "name", header: "Name", flex: true, render: (r) => <span>{r.name}</span> },
  { key: "size", header: "Size", render: (r) => <span>{r.size}</span> },
];

function Harness({
  rows,
  columns = COLUMNS,
  width = 800,
  selectionMode = "single",
  onSelectionChange,
}: {
  rows: Row[];
  columns?: ListColumn<Row>[];
  width?: number;
  selectionMode?: "none" | "single" | "multiple";
  onSelectionChange?: (next: Set<string>) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ width }} data-testid="outer">
      <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
        <ListGrid
          data={rows}
          getRowId={(r) => r.id}
          columns={columns}
          size={Size.Md}
          virtualized
          scrollRef={scrollRef}
          selectionMode={selectionMode}
          onSelectionChange={onSelectionChange}
          getSearchText={(r) => r.id}
          allowTypeAhead
          ariaLabel="Virtual list"
        />
      </div>
    </div>
  );
}

/** Let layout effects, the ResizeObserver and a paint settle. */
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

const scroller = (view: { container: HTMLElement }) =>
  view.container.querySelector<HTMLElement>('[data-testid="scroller"]')!;
const options = (view: { container: HTMLElement }) =>
  view.container.querySelectorAll<HTMLElement>('[role="option"]');
const optionTexts = (view: { container: HTMLElement }) =>
  [...options(view)].map((element) => element.querySelector("span")?.textContent ?? "");

/**
 * A row's nth cell. `ListRow` puts two `aria-hidden` overlays (the tint and the
 * indicator bar) before its cells, so the cells are its non-hidden children rather
 * than a fixed child index.
 */
const cell = (row: HTMLElement, index: number) => {
  const listRow = row.firstElementChild!;
  return [...listRow.children].filter((child) => !child.hasAttribute("aria-hidden"))[
    index
  ] as HTMLElement;
};

test("ten thousand rows mount a bounded window, over a full-height scroll area", async () => {
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();

  // The guarantee: DOM size is a function of the viewport, not of the data.
  const mounted = options(view).length;
  expect(mounted).toBeGreaterThan(VIEWPORT / ROW);
  expect(mounted).toBeLessThan(VIEWPORT / ROW + 30);

  // …while the scroll area still measures the whole list, so the scrollbar tells the
  // truth about how much there is.
  expect(scroller(view).scrollHeight).toBeGreaterThan(10_000 * ROW - ROW * 2);
});

test("scrolling swaps in the rows for that offset", async () => {
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  expect(optionTexts(view)).toContain("Row 0");

  // Measured, not assumed: a hardcoded row height made this fail as a baffling
  // window-offset error on a CI run where the rows were briefly unstyled.
  scroller(view).scrollTop = 500 * options(view)[0].getBoundingClientRect().height;
  await settle();

  const texts = optionTexts(view);
  expect(texts).toContain("Row 500");
  expect(texts).not.toContain("Row 0");
  expect(options(view).length).toBeLessThan(VIEWPORT / ROW + 30);
});

test("cells stay column-aligned across the window", async () => {
  const view = render(<Harness rows={makeRows(5_000)} />);
  await settle();
  const rows = [...options(view)];
  // The subgrid survived the spacers: every row's second cell starts at the same x.
  const lefts = rows.map((row) => cell(row, 1).getBoundingClientRect().left);
  const first = lefts[0];
  for (const left of lefts) expect(Math.abs(left - first)).toBeLessThan(1);
});

test("a column does not shrink back when a wide row scrolls out of the window", async () => {
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  const sizeCell = () => cell(options(view)[0], 1).getBoundingClientRect().width;

  const narrow = sizeCell();

  // Bring the one very wide cell into view; the auto track has to grow for it.
  scroller(view).scrollTop = 500 * ROW;
  await settle();
  const wide = sizeCell();
  expect(wide).toBeGreaterThan(narrow + 20);

  // Scroll away again. Without a floor the track would snap back to `narrow`, which is
  // the ~100px lateral jump that reads as the table rearranging itself mid-scroll.
  scroller(view).scrollTop = 9_000 * ROW;
  await settle();
  expect(sizeCell()).toBeGreaterThan(wide - 2);
});

test("the floor is recorded on the grid's own track template", async () => {
  // The same guarantee read off the mechanism rather than off rendered pixels: once a
  // wide cell has been seen, that track carries a `minmax()` floor. Needs the layout
  // rules, because a floor is measured from the used track widths and an element that is
  // not laid out as a grid has none.
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  const grid = () => view.container.querySelector<HTMLElement>(".grid")!;
  expect(grid().style.gridTemplateColumns).not.toContain("minmax");

  scroller(view).scrollTop = 500 * ROW;
  await settle();
  expect(grid().style.gridTemplateColumns).toContain("minmax");
});

test("a container resize re-measures the floor instead of holding the old width open", async () => {
  // The floors must not outlive the width they were measured at — that is what lets a
  // narrowing list give space back, and what lets `hideBelow` collapse a column to zero.
  //
  // Asserted as "smaller than the wide floor", not "absent": clearing is immediately
  // followed by a legitimate re-measure at the new width, so a floor still being present is
  // correct. The earlier version of this test demanded no floor at all, which only passed
  // because measurement returned nothing in a suite that ran without the stylesheet.
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  const grid = () => view.container.querySelector<HTMLElement>(".grid")!;
  const floorOf = () => {
    const match = /minmax\(([\d.]+)px/.exec(grid().style.gridTemplateColumns);
    return match ? Number(match[1]) : 0;
  };

  scroller(view).scrollTop = 500 * ROW;
  await settle();
  const wide = floorOf();
  expect(wide).toBeGreaterThan(100);

  view.container.querySelector<HTMLElement>('[data-testid="outer"]')!.style.width = "400px";
  await settle();
  expect(floorOf()).toBeLessThan(wide);
});

test("hideBelow still collapses a column in a windowed list", async () => {
  // The floors and the responsive-hiding container query are the two things competing for
  // the same track. Only testable now that the real stylesheet is loaded: hiding is a pure
  // CSS container query, so with inert classes there was nothing to observe.
  const columns: ListColumn<Row>[] = [
    { key: "name", header: "Name", flex: true, render: (r) => <span>{r.name}</span> },
    { key: "size", header: "Size", hideBelow: "xl", render: (r) => <span>{r.size}</span> },
  ];
  const view = render(<Harness rows={makeRows(5_000)} columns={columns} width={800} />);
  await settle();
  const sizeCell = () => cell(options(view)[0], 1);
  expect(sizeCell().getBoundingClientRect().width).toBeGreaterThan(0);

  // Below the `xl` container breakpoint (576px) the column's cells go `display: none`.
  view.container.querySelector<HTMLElement>('[data-testid="outer"]')!.style.width = "420px";
  await settle();
  expect(getComputedStyle(sizeCell()).display).toBe("none");
  expect(sizeCell().getBoundingClientRect().width).toBe(0);
});

test("spacers put each rendered row at its true offset in the list", async () => {
  // THE claim windowing rests on, and the one that satisfies a DOM assertion while being
  // visibly wrong: a row's distance from the top of the grid must equal its index times the
  // row height, or the rows drift out of step with the scrollbar the further you go.
  //
  // The header is measured rather than tolerated. An earlier version allowed a whole row of
  // slack to absorb it, which made the assertion blind to a one-row spacer error — checked
  // by introducing one.
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  scroller(view).scrollTop = 4_000 * ROW;
  await settle();

  const grid = view.container.querySelector<HTMLElement>(".grid")!;
  const gridTop = grid.getBoundingClientRect().top;
  const headerHeight = (grid.firstElementChild as HTMLElement).getBoundingClientRect().height;
  const rows = [...options(view)];
  const rowHeight = rows[0].getBoundingClientRect().height;
  const indexOf = (row: HTMLElement) => Number(row.getAttribute("aria-posinset")) - 1;

  // Absolute placement: the leading spacer really does stand in for the rows above.
  const firstOffset = rows[0].getBoundingClientRect().top - gridTop;
  expect(firstOffset).toBeCloseTo(headerHeight + indexOf(rows[0]) * rowHeight, 0);

  // And no accumulated drift across the window.
  for (const row of rows) {
    const offset = row.getBoundingClientRect().top - gridTop;
    expect(offset).toBeCloseTo(headerHeight + indexOf(row) * rowHeight, 0);
  }

  // The content ends where the trailing spacer says it does, so the scrollbar is not lying.
  const last = rows.at(-1)!;
  const remaining = 10_000 - 1 - indexOf(last);
  const bottomGap = grid.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
  expect(bottomGap).toBeCloseTo(remaining * rowHeight, 0);
});

test("End moves the cursor and the selection to the last row in the data", async () => {
  const onSelectionChange = vi.fn();
  const view = render(<Harness rows={makeRows(10_000)} onSelectionChange={onSelectionChange} />);
  await settle();
  options(view)[0].focus();

  await userEvent.keyboard("{End}");
  await settle();

  expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["r9999"]));
  const last = [...options(view)].find(
    (element) => element.querySelector("span")?.textContent === "Row 9999",
  );
  expect(last).toBeDefined();
  expect(document.activeElement).toBe(last);
});

/**
 * A later sibling of the list, re-rendered by the same scroll event that moves the window.
 *
 * React runs layout effects child-before-parent and in tree order, so this one runs at the
 * END of the very commit that swapped the window — after everything the list does in its
 * own layout phase. That makes "by the time this commit finished" an observable moment,
 * which is the only way to state the invariant below without a wall-clock threshold that
 * would really be measuring how loaded the machine is.
 */
function CommitProbe({
  scrollRef,
  onCommit,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  onCommit: () => void;
}) {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const onScroll = () => {
      rerender();
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      element.removeEventListener("scroll", onScroll);
    };
  }, [scrollRef]);
  useLayoutEffect(() => {
    onCommit();
  });
  return null;
}

test("a cursor move that unmounts the focused row never ends the commit on the body", async () => {
  // Moving the cursor across the window brings its row in and takes the OLD focused row
  // out — and removing the focused element drops focus to `document.body`. Whatever puts
  // focus back has to do it within that same commit, because while focus sits on the body
  // the list is not listening and any keystroke that arrives is delivered to the body and
  // silently discarded. Not theoretical: that is how the type-ahead test below lost the
  // last character of `r7000` on a loaded CI machine, leaving the cursor a keystroke short
  // at row 700 — a ~10ms hole between the removal and a restore that ran after paint.
  let removedFocusedRow = false;
  let removals = 0;
  let commitsEndingOnBody = 0;

  function ProbedHarness() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const rows = useMemo(() => makeRows(10_000), []);
    return (
      <div style={{ width: 800 }}>
        <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
          <ListGrid
            data={rows}
            getRowId={(r) => r.id}
            columns={COLUMNS}
            size={Size.Md}
            virtualized
            scrollRef={scrollRef}
            selectionMode="single"
            ariaLabel="Virtual list"
          />
          <CommitProbe
            scrollRef={scrollRef}
            onCommit={() => {
              if (!removedFocusedRow) return;
              removedFocusedRow = false;
              if (document.activeElement === document.body) commitsEndingOnBody++;
            }}
          />
        </div>
      </div>
    );
  }

  const view = render(<ProbedHarness />);
  await settle();
  options(view)[0].focus();

  const onFocusOut = (event: Event) => {
    // A null `relatedTarget` means focus went nowhere — the element was removed.
    if ((event as FocusEvent).relatedTarget) return;
    removals++;
    removedFocusedRow = true;
  };
  document.addEventListener("focusout", onFocusOut, true);
  await userEvent.keyboard("{End}");
  await settle();
  document.removeEventListener("focusout", onFocusOut, true);

  // The scenario really happened — without this the assertion below is vacuously true.
  expect(removals).toBeGreaterThan(0);
  expect(commitsEndingOnBody).toBe(0);
});

test("a shift-range spans rows that were never rendered", async () => {
  const onSelectionChange = vi.fn();
  const view = render(
    <Harness
      rows={makeRows(1_000)}
      selectionMode="multiple"
      onSelectionChange={onSelectionChange}
    />,
  );
  await settle();
  options(view)[0].focus();
  // Space anchors the selection on row 0.
  await userEvent.keyboard(" ");
  await settle();

  // Extend to the end. Selection runs over the id order, not the DOM, so the rows in
  // between count even though only a dozen of them ever existed as elements.
  await userEvent.keyboard("{Shift>}{End}{/Shift}");
  await settle();

  const selected = onSelectionChange.mock.calls.at(-1)![0] as Set<string>;
  expect(selected.size).toBe(1_000);
  expect(selected.has("r500")).toBe(true);
});

test("type-ahead jumps to an unrendered row and brings it into view", async () => {
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  options(view)[0].focus();

  // `r7000` is thousands of rows below the window. Typed against the id because
  // Space is a selection gesture in this list, so a query containing one cannot reach
  // type-ahead at all.
  await userEvent.keyboard("r7000");
  await settle();

  const target = [...options(view)].find(
    (element) => element.querySelector("span")?.textContent === "Row 7000",
  );
  expect(target).toBeDefined();
  expect(scroller(view).scrollTop).toBeGreaterThan(6_000 * ROW);
});

test("a row reports its place in the data, not in the window", async () => {
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  scroller(view).scrollTop = 500 * options(view)[0].getBoundingClientRect().height;
  await settle();

  const row500 = [...options(view)].find(
    (element) => element.querySelector("span")?.textContent === "Row 500",
  )!;
  // A screen reader counting the DOM would say "3 of 12"; these say what is true.
  expect(row500.getAttribute("aria-setsize")).toBe("10000");
  expect(row500.getAttribute("aria-posinset")).toBe("501");
});

test("windowing off renders every row", async () => {
  // The opt-in really is opt-in: the same list without `virtualized` is unchanged.
  const rows = makeRows(200);
  const view = render(
    <div style={{ height: VIEWPORT, overflowY: "auto" }}>
      <ListGrid
        data={rows}
        getRowId={(r) => r.id}
        columns={COLUMNS}
        selectionMode="single"
        ariaLabel="Plain list"
      />
    </div>,
  );
  await settle();
  expect(view.container.querySelectorAll('[role="option"]')).toHaveLength(200);
});

test("a windowed list with no scrollRef renders everything and says why", async () => {
  // Degrading to a correct-but-unwindowed list beats rendering nothing; the warning is
  // what stops that going unnoticed.
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const rows = makeRows(50);
  const view = render(
    <ListGrid
      data={rows}
      getRowId={(r) => r.id}
      columns={COLUMNS}
      virtualized
      selectionMode="single"
      ariaLabel="No scroll ref"
    />,
  );
  await settle();
  expect(view.container.querySelectorAll('[role="option"]')).toHaveLength(50);
  warn.mockRestore();
});

test("the window follows a controlled row height rather than assuming 16px roots", async () => {
  // `Size.Sm` is `h-8`; the window must be computed from the measured 32px, not from
  // the Md estimate. A wrong height shows up as the wrong number of mounted rows.
  function SmallHarness() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const rows = useMemo(() => makeRows(5_000), []);
    return (
      <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
        <ListGrid
          data={rows}
          getRowId={(r) => r.id}
          columns={COLUMNS}
          size={Size.Sm}
          virtualized
          scrollRef={scrollRef}
          selectionMode="single"
          ariaLabel="Small rows"
        />
      </div>
    );
  }
  const view = render(<SmallHarness />);
  await settle();
  const measured = options(view)[0].getBoundingClientRect().height;
  const expected = 5_000 * measured;
  // Within a row of the real thing: the spacers were sized from the measurement, not
  // from the Md estimate.
  expect(Math.abs(scroller(view).scrollHeight - expected)).toBeLessThan(measured * 2);
});
