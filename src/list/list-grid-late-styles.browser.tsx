import { useMemo, useRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Size } from "../types";
import { ListGrid, type ListColumn } from "./list-grid";

/**
 * A windowed list whose rows are styled AFTER they mount.
 *
 * Deliberately the one layout file that does NOT import the stylesheet up front, because
 * that is the condition being reproduced: CI mounted the first row before the injected
 * stylesheet applied, so the row measured as a bare 18px line box instead of `h-9`'s 36px.
 * The height was measured once and never revisited, so a list of 36px rows windowed itself
 * at 18 — a scroll to row 500 arrived at row 1000, with the scrollbar off by a factor of two
 * for the rest of the session.
 *
 * Not a test-harness quirk. An app can style a list late for ordinary reasons: a
 * route-level CSS chunk, a lazily-imported component's styles, a web font swapping in.
 */

const VIEWPORT = 360;

interface Row {
  id: string;
  name: string;
}

const ROWS: Row[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: `r${i.toString()}`,
  name: `Row ${i.toString()}`,
}));

const COLUMNS: ListColumn<Row>[] = [
  { key: "name", flex: true, render: (r) => <span>{r.name}</span> },
];

function Harness() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => ROWS, []);
  return (
    <div ref={scrollRef} style={{ height: VIEWPORT, overflowY: "auto" }} data-testid="scroller">
      <ListGrid
        data={rows}
        getRowId={(r) => r.id}
        columns={COLUMNS}
        size={Size.Md}
        virtualized
        scrollRef={scrollRef}
        noHeader
        selectionMode="single"
        ariaLabel="Late styles"
      />
    </div>
  );
}

const settle = async () => {
  for (let i = 0; i < 6; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

/**
 * Wait for a condition, up to a bound.
 *
 * The remeasure this file is about is delivered by a `ResizeObserver`, which is a
 * notification the test cannot schedule against — a fixed number of frames is a guess at
 * how long it takes, and under a loaded machine it is the wrong guess a few percent of the
 * time. Returns rather than asserts, so a condition that never arrives still fails on the
 * real assertion below instead of on a timeout message.
 */
const waitFor = async (condition: () => boolean, timeoutMs = 2_000) => {
  const deadline = performance.now() + timeoutMs;
  while (!condition() && performance.now() < deadline) await settle();
};

test("a row height that only settles once styles arrive is picked up", async () => {
  const view = await render(<Harness />);
  await settle();

  const scroller = view.container.querySelector<HTMLElement>('[data-testid="scroller"]')!;
  const rowOf = (index: number) =>
    [...view.container.querySelectorAll<HTMLElement>('[role="option"]')].find(
      (element) => element.textContent === `Row ${index.toString()}`,
    );

  // Unstyled: rows are bare line boxes, and the list is internally consistent at that height.
  const unstyled = view.container.querySelector<HTMLElement>('[role="option"]')!;
  const unstyledHeight = unstyled.getBoundingClientRect().height;
  expect(unstyledHeight).toBeGreaterThan(0);
  expect(unstyledHeight).toBeLessThan(30);

  // Styles arrive after the fact, exactly as the CI run had them. When they actually take
  // effect is up to the browser, so the row is watched for until it is no longer a bare
  // line box — a stylesheet that never applies still fails on the assertion below.
  await import("../test-stylesheet");
  const firstRow = () => view.container.querySelector<HTMLElement>('[role="option"]')!;
  await waitFor(() => firstRow().getBoundingClientRect().height > 30);

  const styledHeight = firstRow().getBoundingClientRect().height;
  expect(styledHeight).toBeCloseTo(36, 0);

  // The window must now be computed from the real height. Before the fix it kept the
  // 18px measurement, so this scroll landed on row 1000 and the assertion below failed.
  //
  // Waited for rather than counted in frames, and deliberately waited for THIS condition
  // rather than for the row height to land first. The remeasure reaches the window by two
  // routes — a `ResizeObserver` on the observed row, and `measureRef` re-attaching when the
  // window moves — and only the second is under the test's control: a browser is free to
  // defer observer delivery, so a list that is still internally at 18px when the scroll is
  // issued corrects itself on the commit that scroll causes. Waiting for the row is
  // therefore both the honest end state and the reachable one; waiting for the height
  // first could sit on a notification that never comes while the list was fine.
  scroller.scrollTop = 500 * styledHeight;
  await waitFor(() => rowOf(500) !== undefined);
  expect(rowOf(500)).toBeDefined();

  // …and the content is as tall as the styled list, so the scrollbar tells the truth.
  expect(scroller.scrollHeight).toBeCloseTo(10_000 * styledHeight, -1);
});
