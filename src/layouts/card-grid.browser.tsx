import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { CardGrid } from "./card-grid";

/**
 * Two-dimensional navigation is the whole reason `CardGrid` exists rather than
 * reusing `ListGrid`, and none of it can be exercised without a live DOM: the row
 * step comes from the *measured* `grid-template-columns`, and roving focus is real
 * `document.activeElement` movement injected by Base UI's composite.
 *
 * Grid used throughout — six items, explicit `grid-cols-3`, so the layout is:
 *
 *     a  b  c
 *     d  e  f
 *
 * A row step is therefore +3/-3, which is distinguishable from a neighbour step.
 * That distinction is the point: a 1-D implementation passes a Left/Right test and
 * fails these.
 */
interface Item {
  id: string;
  name: string;
}

const ITEMS: Item[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Bravo" },
  { id: "c", name: "Charlie" },
  { id: "d", name: "Delta" },
  { id: "e", name: "Echo" },
  { id: "f", name: "Foxtrot" },
];

const options = () => [...document.querySelectorAll('[role="option"]')];
const focusedName = () => document.activeElement?.textContent?.trim() ?? null;
const sorted = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b));

function renderGrid(props: Partial<Parameters<typeof CardGrid<Item>>[0]> = {}) {
  return render(
    <CardGrid
      data={ITEMS}
      getItemId={(item) => item.id}
      selectionMode="single"
      ariaLabel="cards"
      // Tracks set INLINE, not via `grid-cols-3`: this project renders without
      // the compiled stylesheet, so a utility class would leave the container
      // with no resolved columns and the measurement would read 1 — making every
      // row-step assertion below silently vacuous.
      style={{ display: "grid", width: 600, gridTemplateColumns: "repeat(3, 1fr)" }}
      {...props}
    >
      {(item) => <div>{item.name}</div>}
    </CardGrid>,
  );
}

test("renders one option per datum, with a single tab stop", () => {
  renderGrid();
  expect(options().map((el) => el.textContent?.trim())).toEqual([
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
  ]);
  // Roving tabindex: the grid is one stop, not six.
  expect(options().filter((el) => el.getAttribute("tabindex") === "0")).toHaveLength(1);
});

test("clicking selects exactly that item and sets aria-selected", async () => {
  const onSelectionChange = vi.fn();
  renderGrid({ onSelectionChange });
  await userEvent.click(options()[1]);
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["b"]);
  expect(options()[1].getAttribute("aria-selected")).toBe("true");
});

test("ArrowRight/ArrowLeft step one item", async () => {
  renderGrid();
  await userEvent.click(options()[0]);
  await userEvent.keyboard("{ArrowRight}");
  expect(focusedName()).toBe("Bravo");
  await userEvent.keyboard("{ArrowLeft}");
  expect(focusedName()).toBe("Alpha");
});

/**
 * The core assertion. At three columns, Down from `a` must land on `d` — the item
 * directly below — not on `b`. A linear implementation moves to `b` and fails here.
 */
test("ArrowDown/ArrowUp step a whole row, not a neighbour", async () => {
  renderGrid();
  await userEvent.click(options()[0]); // Alpha (row 0, col 0)

  await userEvent.keyboard("{ArrowDown}");
  expect(focusedName()).toBe("Delta"); // +3

  await userEvent.keyboard("{ArrowUp}");
  expect(focusedName()).toBe("Alpha"); // -3
});

test("selection follows focus, so arrowing moves the selection too", async () => {
  const onSelectionChange = vi.fn();
  renderGrid({ onSelectionChange });
  await userEvent.click(options()[0]);
  await userEvent.keyboard("{ArrowDown}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["d"]);
  expect(options()[3].getAttribute("aria-selected")).toBe("true");
});

/**
 * The reason the column count is measured rather than passed as a prop: the same
 * markup navigates differently at a different width. Here the grid is narrowed to
 * two columns, which re-lays the items as
 *
 *     a  b
 *     c  d
 *     e  f
 *
 * so Down from `a` must now land on `c`, not the `d` it lands on at three columns.
 * A `columns` prop would keep reporting 3 and send focus to the wrong item — this
 * is the case that would fail silently in production at one breakpoint.
 */
test("the row step tracks the column count actually in effect", async () => {
  renderGrid({ style: { display: "grid", width: 400, gridTemplateColumns: "repeat(2, 1fr)" } });
  await userEvent.click(options()[0]); // Alpha
  await userEvent.keyboard("{ArrowDown}");
  expect(focusedName()).toBe("Charlie"); // +2 at two columns, not +3
});

test("Enter activates without changing the selection", async () => {
  const onAction = vi.fn();
  const onSelectionChange = vi.fn();
  renderGrid({ onAction, onSelectionChange });
  await userEvent.click(options()[2]); // Charlie
  onSelectionChange.mockClear();

  await userEvent.keyboard("{Enter}");
  expect(onAction).toHaveBeenCalledWith("c", expect.anything());
  // Activation is navigation, not selection — it must not re-write the selection.
  expect(onSelectionChange).not.toHaveBeenCalled();
});

test("Cmd+Arrow moves focus without disturbing the selection", async () => {
  const onSelectionChange = vi.fn();
  renderGrid({ onSelectionChange });
  await userEvent.click(options()[0]); // selects a
  onSelectionChange.mockClear();

  await userEvent.keyboard("{Meta>}{ArrowRight}{/Meta}");
  expect(focusedName()).toBe("Bravo");
  // Focus moved; selection stayed on `a`.
  expect(onSelectionChange).not.toHaveBeenCalled();
  expect(options()[0].getAttribute("aria-selected")).toBe("true");
});

test("a click inside an embedded control does not change the selection", async () => {
  const onSelectionChange = vi.fn();
  const onButton = vi.fn();
  render(
    <CardGrid
      data={ITEMS}
      getItemId={(item) => item.id}
      selectionMode="single"
      ariaLabel="cards"
      style={{ display: "grid", width: 600, gridTemplateColumns: "repeat(3, 1fr)" }}
      onSelectionChange={onSelectionChange}
    >
      {(item) => (
        <div>
          {item.name}
          <button type="button" onClick={onButton}>
            act on {item.name}
          </button>
        </div>
      )}
    </CardGrid>,
  );

  await userEvent.click(document.querySelectorAll("button")[1]!);
  expect(onButton).toHaveBeenCalledTimes(1);
  // The overflow menu / footer action belongs to itself, not to the card.
  expect(onSelectionChange).not.toHaveBeenCalled();
});

test("disabled items are skipped by navigation and cannot be selected", async () => {
  const onSelectionChange = vi.fn();
  renderGrid({
    isItemDisabled: (item) => item.id === "b",
    onSelectionChange,
  });
  await userEvent.click(options()[0]); // Alpha
  await userEvent.keyboard("{ArrowRight}");
  // Bravo is disabled, so the composite skips it.
  expect(focusedName()).toBe("Charlie");

  // Deliberately no click-on-disabled assertion: `aria-disabled` makes Playwright
  // wait for the element to become enabled and time out. The navigation skip above
  // is the behaviour that matters, and the item carries `aria-disabled` for AT.
  expect(options()[1].getAttribute("aria-disabled")).toBe("true");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["c"]);
});

test("selectionMode=none announces a grid and activates on click", async () => {
  const onAction = vi.fn();
  renderGrid({ selectionMode: "none", onAction });
  expect(document.querySelector('[role="grid"]')).not.toBeNull();
  expect(document.querySelectorAll('[role="gridcell"]')).toHaveLength(6);
  await userEvent.click(document.querySelectorAll('[role="gridcell"]')[1]!);
  expect(onAction).toHaveBeenCalledWith("b", expect.anything());
});
