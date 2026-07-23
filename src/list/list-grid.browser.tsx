import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
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

test("selection follows focus: ArrowDown moves selection to the next row (single)", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={NAME_COL} selectionMode="single" onSelectionChange={onSelectionChange} ariaLabel="l" />,
  );
  await userEvent.click(options()[0]); // select a, focus a
  await userEvent.keyboard("{ArrowDown}");
  expect(sorted(onSelectionChange.mock.calls.at(-1)![0])).toEqual(["b"]);
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

// R1 reliability guard: an interactive control inside a cell must handle its own
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
