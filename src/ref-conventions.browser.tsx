import { useCallback, useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { ListRow } from "./list/list-row";
import { TreeRow } from "./tree/tree-row";
import { ScrollArea } from "./layouts/scroll-area";
import "./test-stylesheet";

/**
 * How a ref reaches a component in this package.
 *
 * React 19 passes `ref` to function components as an ordinary prop, and `forwardRef` is
 * deprecated. The package is mid-migration: older components (`Button`, `Avatar`,
 * `ScrollArea`, the icons) still wrap `forwardRef`, while newer or newly-touched ones
 * (`MenuButton`, `Combobox`, `Autocomplete`, `FloatingArrow`, and now `ListRow` /
 * `TreeRow`) declare `ref` in their props.
 *
 * That the second group works at all is the thing worth pinning. It reads as a mistake to
 * anyone carrying React 18 habits — a plain `ref` prop was silently stripped there — and it
 * fails *quietly* if it ever regresses: a windowed list whose measurement ref never
 * attaches does not throw, it just keeps using its estimate and puts the spacers slightly
 * out of step with the rows. These tests make that a red suite instead.
 *
 * NOTE for the peer range: `package.json` still allows `react ^18.2.0`, under which this
 * pattern does not work — in four components that predate this change as well as these two.
 * The code has effectively moved on; the range has not.
 */

test("ListRow receives a ref through its props", async () => {
  let received: HTMLElement | null = null;
  await render(
    <ListRow
      columns={[{ key: "a" }]}
      cells={[<span key="a">cell</span>]}
      ref={(node) => {
        received = node;
      }}
    />,
  );
  // The row element itself, which is what a windowed list measures.
  expect(received).not.toBeNull();
  expect((received as unknown as HTMLElement).textContent).toBe("cell");
});

test("TreeRow receives a ref through its props", async () => {
  let received: HTMLElement | null = null;
  await render(
    <TreeRow
      depth={0}
      label={<span>label</span>}
      ref={(node) => {
        received = node;
      }}
    />,
  );
  expect(received).not.toBeNull();
  expect((received as unknown as HTMLElement).textContent).toBe("label");
});

test("a row ref reports the height the window is computed from", async () => {
  // The point of the ref, not merely that it fires: `ROW_HEIGHT` is a `rem` class, so only
  // a real measurement knows how tall a row is in an app that changed its root font size.
  let node: HTMLElement | null = null;
  await render(
    <TreeRow
      depth={0}
      label={<span>x</span>}
      ref={(element) => {
        node = element;
      }}
    />,
  );
  expect(node).not.toBeNull();
  expect((node as unknown as HTMLElement).getBoundingClientRect().height).toBeCloseTo(36, 0);
});

test("ScrollArea hands out its scrolling element once, not once per render", async () => {
  // `viewportRef` is a normal prop rather than the component's own `ref` — that one is its
  // imperative handle — so it is unaffected by the migration above. What it must not do is
  // churn.
  //
  // Asserted through a CALLBACK ref, which records every hand-off: `mergeRefs` is a plain
  // function, so calling it in the render body returns a new callback each render, and React
  // responds to a changed ref callback by detaching the old one — handing the consumer a
  // `null` — before attaching the new. Un-memoized, an unrelated re-render therefore records
  // [node, null, node]; memoized, it records [node] and nothing more. For a windowed list
  // that ref is the element its whole geometry is read from, so the difference is not
  // academic.
  const handoffs: (HTMLElement | null)[] = [];
  function Harness() {
    const [tick, setTick] = useState(0);
    // STABLE, deliberately. An inline arrow would be a new callback every render, which
    // makes React re-attach regardless of what this component does — true of any component,
    // `forwardRef` or not. Holding the identity still is what isolates the memoization.
    const record = useCallback((node: HTMLDivElement | null) => {
      handoffs.push(node);
    }, []);
    return (
      <div style={{ height: 200 }}>
        <button type="button" onClick={() => setTick((t) => t + 1)} data-testid="rerender">
          rerender {tick}
        </button>
        <ScrollArea viewportRef={record}>
          <div style={{ height: 2000 }} data-testid="tall" />
        </ScrollArea>
      </div>
    );
  }
  const view = await render(<Harness />);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  const viewport = view.container.querySelector<HTMLElement>("[data-scroll-area-viewport]");
  expect(viewport).not.toBeNull();
  // The element handed over is the scroll viewport — the box that scrolls — not the root.
  expect(handoffs.at(-1)).toBe(viewport);
  const initialHandoffs = handoffs.length;

  view.container.querySelector<HTMLElement>('[data-testid="rerender"]')!.click();
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  // The re-render neither detached nor re-attached it.
  expect(handoffs.length).toBe(initialHandoffs);
  expect(handoffs).not.toContain(null);
  expect(view.container.querySelector<HTMLElement>("[data-scroll-area-viewport]")).toBe(viewport);
});
