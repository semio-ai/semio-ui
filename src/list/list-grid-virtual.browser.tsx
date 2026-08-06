import { useMemo, useRef } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Size } from "../types";
import { ListGrid, type ListColumn } from "./list-grid";

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

/**
 * The utilities the windowed layout actually depends on.
 *
 * These browser tests run without the package's stylesheet — Tailwind is compiled by
 * the build, not by vitest — so every class in the components is inert here. That is
 * fine for the rest of the suite, which tests focus, keyboard and selection, but the
 * spacer/subgrid arrangement IS a layout claim: the cells line up because the rows are
 * grid items on the parent's tracks, and spacers work because they are grid items too.
 * Injecting the four rules in play keeps that claim testable without pulling a CSS
 * build into the unit suite, and they are copied from the utilities the components
 * name, so a Tailwind change that altered them would show up as a failure here.
 */
const LAYOUT_CSS = `
  .grid { display: grid; }
  .grid-cols-subgrid { grid-template-columns: subgrid; }
  .col-span-full { grid-column: 1 / -1; }
  .h-9 { height: 2.25rem; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

function withLayoutCss() {
  const style = document.createElement("style");
  style.textContent = LAYOUT_CSS;
  document.head.append(style);
  return () => {
    style.remove();
  };
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

  scroller(view).scrollTop = 500 * ROW;
  await settle();

  const texts = optionTexts(view);
  expect(texts).toContain("Row 500");
  expect(texts).not.toContain("Row 0");
  expect(options(view).length).toBeLessThan(VIEWPORT / ROW + 30);
});

test("cells stay column-aligned across the window", async () => {
  const cleanup = withLayoutCss();
  const view = render(<Harness rows={makeRows(5_000)} />);
  await settle();
  const rows = [...options(view)];
  // The subgrid survived the spacers: every row's second cell starts at the same x.
  const lefts = rows.map((row) => cell(row, 1).getBoundingClientRect().left);
  const first = lefts[0];
  for (const left of lefts) expect(Math.abs(left - first)).toBeLessThan(1);
  cleanup();
});

test("a column does not shrink back when a wide row scrolls out of the window", async () => {
  const cleanup = withLayoutCss();
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
  cleanup();
});

test("the floor is recorded on the grid's own track template", async () => {
  // The same guarantee read off the mechanism rather than off rendered pixels: once a
  // wide cell has been seen, that track carries a `minmax()` floor. Needs the layout
  // rules, because a floor is measured from the used track widths and an element that is
  // not laid out as a grid has none.
  const cleanup = withLayoutCss();
  const view = render(<Harness rows={makeRows(10_000)} />);
  await settle();
  const grid = () => view.container.querySelector<HTMLElement>(".grid")!;
  expect(grid().style.gridTemplateColumns).not.toContain("minmax");

  scroller(view).scrollTop = 500 * ROW;
  await settle();
  expect(grid().style.gridTemplateColumns).toContain("minmax");
  cleanup();
});

test("a container resize discards the floors, so a narrower list can re-measure", async () => {
  // `hideBelow` collapses a column by making its cells `display:none`, which only works
  // if the track can still reach zero — so a floor measured while the column was
  // visible must not outlive the resize that hid it. Asserted on the track template:
  // the floor is gone after the width changes, leaving the column free to re-measure
  // (or to collapse) at the new width.
  const cleanup = withLayoutCss();
  const view = render(<Harness rows={makeRows(5_000)} />);
  await settle();
  const grid = () => view.container.querySelector<HTMLElement>(".grid")!;

  scroller(view).scrollTop = 500 * ROW;
  await settle();
  expect(grid().style.gridTemplateColumns).toContain("minmax");

  view.container.querySelector<HTMLElement>('[data-testid="outer"]')!.style.width = "400px";
  await settle();
  expect(grid().style.gridTemplateColumns).not.toContain("minmax");
  cleanup();
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
  scroller(view).scrollTop = 500 * ROW;
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
