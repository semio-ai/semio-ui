// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListGrid, type ListColumn, type ListGridProps } from "./list-grid";

interface Row {
  id: string;
  name: string;
}

const COLUMNS: ListColumn<Row>[] = [
  { key: "name", header: "Name", flex: true, render: (row) => row.name },
  { key: "kind", header: "Kind", render: () => "Robot" },
  { key: "updated", header: "Updated", render: () => "Today" },
];

const EMPTY_BODY = <span data-empty-body>No items found.</span>;

function renderGrid(props: Partial<ListGridProps<Row>> = {}) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <ListGrid
      data={[]}
      getRowId={(row) => row.id}
      columns={COLUMNS}
      ariaLabel="Items"
      emptyBody={EMPTY_BODY}
      {...props}
    />,
  );
  return container;
}

describe("ListGrid emptyBody", () => {
  it.each([false, true])("renders a full-width grid row with noHeader=%s", (noHeader) => {
    const container = renderGrid({ noHeader });
    const grid = container.querySelector('[role="grid"]');
    const cell = container.querySelector("[data-empty-body]")?.parentElement;
    const row = cell?.parentElement;

    expect(grid?.contains(row ?? null)).toBe(true);
    expect(row?.classList.contains("col-span-full")).toBe(true);
    expect(row?.getAttribute("role")).toBe("row");
    expect(row?.getAttribute("aria-rowindex")).toBe(noHeader ? "1" : "2");
    expect(cell?.getAttribute("role")).toBe("gridcell");
    expect(cell?.getAttribute("aria-colspan")).toBe("3");
    expect(grid?.getAttribute("aria-rowcount")).toBe(noHeader ? "1" : "2");
    expect(
      Array.from(
        container.querySelectorAll('[role="columnheader"]'),
        (header) => header.textContent,
      ),
    ).toEqual(noHeader ? [] : ["Name", "Kind", "Updated"]);
  });

  it.each(["single", "multiple"] as const)(
    "renders the empty message without row roles in %s listbox mode",
    (selectionMode) => {
      const container = renderGrid({ selectionMode });

      expect(container.querySelector('[role="listbox"]')?.textContent).toContain("No items found.");
      expect(container.querySelectorAll('[role="row"]')).toHaveLength(0);
    },
  );

  it("does not render an empty body when data is non-empty", () => {
    const container = renderGrid({ data: [{ id: "a", name: "Atlas" }] });

    // Only the header and data row belong in the grid, including when an empty
    // body wrapper would itself contain no text.
    expect(container.querySelector(".grid")?.children).toHaveLength(2);
  });

  it("does not render an empty body when emptyBody is unset", () => {
    const container = renderGrid({ emptyBody: undefined });

    expect(container.querySelector(".grid")?.children).toHaveLength(1);
  });
});
