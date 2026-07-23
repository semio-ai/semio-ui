import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import { ListGrid, type ListColumn } from "./list-grid";

// The STUDIO-91 headline: text editing inside a row must survive the list —
// ListGrid must never steal focus from an in-row control, and a realtime
// re-render must not drop keystrokes. See the plan's R1/R2 split.

interface Row {
  id: string;
  name: string;
}
const ROWS: Row[] = [
  { id: "a", name: "Apple" },
  { id: "b", name: "Banana" },
  { id: "c", name: "Cherry" },
];

// An uncontrolled in-row input isolates ListGrid's behavior (its own value is
// DOM-owned, so any lost focus/value is the list's doing, not the field's).
const withInput: ListColumn<Row>[] = [
  { key: "name", flex: true, render: (r) => <span>{r.name}</span> },
  { key: "edit", render: (r) => <input aria-label={`edit-${r.id}`} defaultValue="" /> },
];

const editInput = (id: string) =>
  document.querySelector<HTMLInputElement>(`input[aria-label="edit-${id}"]`)!;

test("in-row input keeps focus AND typed value across a realtime re-render", async () => {
  const view = render(
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={withInput} selectionMode="single" ariaLabel="l" />,
  );
  const input = editInput("b");
  input.focus();
  await userEvent.type(input, "hello");
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe("hello");

  // Simulate a realtime data update: a fresh data array (new object identities,
  // same ids), as a live subscription would push mid-edit.
  view.rerender(
    <ListGrid
      data={ROWS.map((r) => ({ ...r }))}
      getRowId={(r) => r.id}
      columns={withInput}
      selectionMode="single"
      ariaLabel="l"
    />,
  );

  // The SAME input node still holds focus and the typed text — no focus theft,
  // no remount, no dropped keystrokes from the list.
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe("hello");
});

test("keys typed in an in-row input do not trigger list navigation or selection", async () => {
  const onSelectionChange = vi.fn();
  render(
    <ListGrid
      data={ROWS}
      getRowId={(r) => r.id}
      columns={withInput}
      selectionMode="single"
      onSelectionChange={onSelectionChange}
      ariaLabel="l"
    />,
  );
  const input = editInput("b");
  input.focus();
  // Space + arrows would toggle/move selection at the row level — but inside the
  // input they must reach the input and leave the list alone.
  await userEvent.type(input, "x y");
  await userEvent.keyboard("{ArrowDown}{ArrowUp}");
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe("x y");
  expect(onSelectionChange).not.toHaveBeenCalled();
});
