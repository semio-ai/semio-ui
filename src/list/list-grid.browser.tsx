import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { Variant } from "../types";
import { defaultResolveRowVisual } from "../tree/resolve-row-visual";
import { ListGrid, type ListColumn } from "./list-grid";

interface Row {
  id: string;
  name: string;
}

const ROWS: Row[] = [
  { id: "a", name: "Apple" },
  { id: "b", name: "Banana" },
  { id: "c", name: "Cherry" },
];

const NAME_COL: ListColumn<Row>[] = [
  { key: "name", flex: true, render: (r) => <span>{r.name}</span> },
];

const options = () => [...document.querySelectorAll('[role="option"]')];
const rows = () => [...document.querySelectorAll('[role="row"]')];
const sorted = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b));

test("renders one row per datum with its cell content", () => {
  render(<ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" ariaLabel="l" />);
  expect(options().map((el) => el.textContent?.trim())).toEqual(["Apple", "Banana", "Cherry"]);
});

test("single-select: clicking a row selects exactly it and sets aria-selected", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[1]);
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["b"]);
  expect(options()[1].getAttribute("aria-selected")).toBe("true");
});

test("multiple: Cmd+click toggles, Shift+click replaces with the range", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="multiple" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]); // a
  await userEvent.keyboard("{Meta>}");
  await userEvent.click(options()[2]); // + c (toggle)
  await userEvent.keyboard("{/Meta}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a", "c"]);

  await userEvent.keyboard("{Shift>}");
  await userEvent.click(options()[1]); // shift from anchor c → b..c range (replace)
  await userEvent.keyboard("{/Shift}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["b", "c"]);
});

test("multiple: Shift+ArrowDown extends selection by roving (focus must advance)", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="multiple" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]); // select a, anchor a, focus a
  await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a", "b"]);
  // The second extend only reaches c if roving focus actually advanced to b.
  await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a", "b", "c"]);
});

test("Cmd+ArrowDown moves roving focus without changing selection", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="multiple" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]);
  onSelectionChange.mockClear();
  await userEvent.keyboard("{Meta>}{ArrowDown}{/Meta}");
  expect(onSelectionChange).not.toHaveBeenCalled(); // focus-only
  expect(options()[1].getAttribute("tabindex")).toBe("0"); // focus moved to b
});

test("first row disabled: the initial roving tab-stop is the first enabled row", () => {
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" isRowDisabled={(r) => r.id === "a"} ariaLabel="l" />,
  );
  const opts = options();
  expect(opts[0].getAttribute("aria-disabled")).toBe("true");
  expect(opts[0].getAttribute("tabindex")).toBe("-1"); // disabled 'a' is not the tab stop
  expect(opts[1].getAttribute("tabindex")).toBe("0"); // first enabled 'b' is
});

test("selection follows focus: ArrowDown moves selection to the next row (single)", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]); // select a, focus a
  await userEvent.keyboard("{ArrowDown}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["b"]);
});

test("multiple: Shift+Home / Shift+End extend the range to each edge from the anchor", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="multiple" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[1]); // anchor b (middle of a,b,c)
  await userEvent.keyboard("{Shift>}{Home}{/Shift}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a", "b"]); // b→first
  await userEvent.keyboard("{Shift>}{End}{/Shift}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["b", "c"]); // b→last
});

test("loop: ArrowUp from the first row wraps to the last (selection follows)", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" loop onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]); // focus + select a
  await userEvent.keyboard("{ArrowUp}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["c"]); // wrapped to last (a,b,c)
  expect(options()[2].getAttribute("tabindex")).toBe("0");
});

test("controlled: without a parent update, clicking does not drift the rendered selection", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid
      data={ROWS}
      getRowId={(r) => r.id}
      columns={NAME_COL}
      selectionMode="single"
      selected={new Set(["b"])}
      onSelectionChange={onSelectionChange}
      ariaLabel="l"
    />,
  );
  await userEvent.click(options()[0]); // request select a
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a"]); // change is reported…
  // …but the parent owns state and didn't update, so the render stays on 'b'.
  expect(options()[1].getAttribute("aria-selected")).toBe("true");
  expect(options()[0].getAttribute("aria-selected")).toBe("false");
});

test("hideBelow emits the container-query class on the header and every body cell", () => {
  const columns: ListColumn<Row>[] = [
    { key: "name", header: "Name", flex: true, render: (r) => <span>{r.name}</span> },
    { key: "kind", header: "Kind", hideBelow: "sm", render: () => <span>kind</span> },
  ];
  render(<ListGrid data={ROWS} getRowId={(r) => r.id} columns={columns} selectionMode="single" ariaLabel="l" />);
  // One header cell + one cell per row carry the hidden-below-sm class.
  const hidden = document.querySelectorAll('[class~="@max-sm:hidden"]');
  expect(hidden.length).toBe(ROWS.length + 1);
});

test("all rows disabled: nothing is selectable and there is no crash", () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" isRowDisabled={() => true} onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  expect(options()).toHaveLength(ROWS.length);
  expect(options().every((o) => o.getAttribute("aria-disabled") === "true")).toBe(true);
  (options()[0] as HTMLElement).click();
  expect(onSelectionChange).not.toHaveBeenCalled();
});

test("none mode: click fires onAction and selects nothing", async () => {
  const onAction = vi.fn();
  render(<ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="none" onAction={onAction} ariaLabel="l" />);
  await userEvent.click(rows()[1]);
  expect(onAction).toHaveBeenCalledWith("b", expect.anything());
  expect(rows()[1].getAttribute("aria-selected")).toBe(null);
});

test("multiple: clicking the header select-all toggles all rows on, then off", async () => {
  const onSelectionChange = vi.fn();
  const withHeader: ListColumn<Row>[] = [{ key: "name", header: "Name", flex: true, render: (r) => <span>{r.name}</span> }];
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={withHeader} selectionMode="multiple" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  const header = document.querySelector<HTMLElement>('[role="button"][aria-label="Select all"]');
  expect(header).toBeTruthy();
  await userEvent.click(header!);
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a", "b", "c"]);
  await userEvent.click(header!);
  expect([...onSelectionChange.mock.calls.at(-1)![0]]).toEqual([]);
});

test("multiple: Cmd+A selects all, Escape clears", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="multiple" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]);
  await userEvent.keyboard("{Meta>}a{/Meta}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a", "b", "c"]);
  await userEvent.keyboard("{Escape}");
  expect([...onSelectionChange.mock.calls.at(-1)![0]]).toEqual([]);
});

test("type-ahead moves roving focus to the row whose search text matches", async () => {
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" getSearchText={(r) => r.name} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]); // focus Apple
  await userEvent.keyboard("c"); // → Cherry
  const cherry = options().find((o) => o.textContent?.includes("Cherry"))!;
  expect(cherry.getAttribute("tabindex")).toBe("0");
});

test("per-row visual: each row applies its own variant / custom-color", () => {
  const resolveVisual = (state: Parameters<typeof defaultResolveRowVisual>[0], row: Row) => ({
    ...defaultResolveRowVisual(state, row),
    ...(row.id === "a" ? { color: "rgb(48, 164, 108)" } : {}),
    ...(row.id === "b" ? { variant: Variant.Success } : {}),
  });
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" resolveVisual={resolveVisual} ariaLabel="l" />,
  );
  const opts = options();
  const rowA = opts[0].querySelector<HTMLElement>(".responsive")!;
  expect(rowA.classList.contains("custom-color")).toBe(true);
  expect(rowA.style.getPropertyValue("--custom-color")).toBe("rgb(48, 164, 108)");
  const rowB = opts[1].querySelector<HTMLElement>(".responsive")!;
  expect(rowB.classList.contains("success")).toBe(true);
});

test("multiple + disallowEmptySelection: header select-all never empties the selection", async () => {
  const withHeader: ListColumn<Row>[] = [{ key: "name", header: "Name", flex: true, render: (r) => <span>{r.name}</span> }];
  render(
    <ListGrid
      data={ROWS}
      getRowId={(r) => r.id}
      columns={withHeader}
      selectionMode="multiple"
      disallowEmptySelection
      defaultSelected={["a", "b", "c"]}
      ariaLabel="l"
    />,
  );
  const header = document.querySelector<HTMLElement>('[role="button"][aria-label="Select all"]')!;
  await userEvent.click(header); // all selected + disallowEmptySelection → no-op, not a clear
  expect(options().every((o) => o.getAttribute("aria-selected") === "true")).toBe(true);
});

test("deselectOnClickAway: clicking outside the list clears the selection", async () => {
  const onSelectionChange = vi.fn();
  render(
    <div>
      <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" onSelectionChange={onSelectionChange} ariaLabel="l" />
      <button type="button" data-testid="outside">outside</button>
    </div>,
  );
  await userEvent.click(options()[0]);
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["a"]);
  await userEvent.click(document.querySelector<HTMLElement>('[data-testid="outside"]')!);
  expect([...onSelectionChange.mock.calls.at(-1)![0]]).toEqual([]);
});

test("isRowDisabled: disabled rows are aria-disabled, unclickable, and skipped by roving", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid
      data={ROWS}
      getRowId={(r) => r.id}
      columns={NAME_COL}
      selectionMode="single"
      isRowDisabled={(r) => r.id === "b"}
      onSelectionChange={onSelectionChange}
      ariaLabel="l"
    />,
  );
  const opts = options();
  expect(opts[1].getAttribute("aria-disabled")).toBe("true"); // Banana
  // aria-disabled isn't user-clickable; a raw click still hits the handler,
  // which must guard against selecting a disabled row.
  (opts[1] as HTMLElement).click();
  expect(onSelectionChange).not.toHaveBeenCalled();

  // Selection-follows-focus skips the disabled row: a → (skip b) → c.
  await userEvent.click(opts[0]);
  onSelectionChange.mockClear();
  await userEvent.keyboard("{ArrowDown}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["c"]);
});

test("none mode: ArrowDown roves focus without selecting", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="none" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(rows()[0]);
  await userEvent.keyboard("{ArrowDown}");
  expect(rows()[1].getAttribute("tabindex")).toBe("0");
  expect(onSelectionChange).not.toHaveBeenCalled();
});

// Reliability guard: an interactive control inside a cell must handle its own
// click WITHOUT the row treating it as a selection gesture.
test("clicking an in-row button does not select the row", async () => {
  const onSelectionChange = vi.fn();
  const onButton = vi.fn();
  const columns: ListColumn<Row>[] = [
    { key: "name", flex: true, render: (r) => <span>{r.name}</span> },
    { key: "action", render: (r) => <button type="button" onClick={() => onButton(r.id)}>act</button> },
  ];
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={columns} selectionMode="single" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(document.querySelectorAll("button")[1] as HTMLElement); // Banana's button
  expect(onButton).toHaveBeenCalledWith("b");
  expect(onSelectionChange).not.toHaveBeenCalled();
});
