import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Dropzone } from "./dropzone";
import type { ListColumn } from "./list";

/**
 * `Dropzone` forwards a listing description to `ListGrid`, and the failure mode of a
 * forwarding layer is that it typechecks while dropping something: a column that never
 * reaches the grid renders an empty cell, not an error. So these assert the rendered
 * rows and cells, not that the props were passed.
 */

interface Row {
  id: string;
  name: string;
  detail: string;
}

const ROWS: Row[] = [
  { id: "one", name: "first.urdf", detail: "found" },
  { id: "two", name: "second.dae", detail: "missing" },
];

const COLUMNS: ListColumn<Row>[] = [
  { key: "name", flex: true, header: "File", render: (r) => <span>{r.name}</span> },
  { key: "detail", align: "right", render: (r) => <span>{r.detail}</span> },
];

/**
 * The grid's DATA rows. `ListGrid` renders a `grid`, and its column header is one of
 * that grid's rows — so the header is excluded by what it contains rather than by
 * position, which keeps these indices meaning the same thing whether or not a
 * `noHeader` Dropzone is under test: a data row owns `gridcell`s.
 */
const rows = () =>
  [...document.querySelectorAll('[role="row"]')].filter((row) =>
    row.querySelector('[role="gridcell"]'),
  );

test("renders one row per datum, with every column's cell", async () => {
  await render(<Dropzone onDrop={() => {}} data={ROWS} getRowId={(r) => r.id} columns={COLUMNS} />);

  const cells = rows().map((r) =>
    [...r.querySelectorAll("span")].map((s) => s.textContent).join("|"),
  );
  expect(cells).toEqual(["first.urdf|found", "second.dae|missing"]);
});

test("an empty list shows the drop prompt instead of a grid", async () => {
  await render(
    <Dropzone
      onDrop={() => {}}
      data={[]}
      getRowId={(r: Row) => r.id}
      columns={COLUMNS}
      dropText="Drop a file"
    />,
  );

  expect(document.querySelector('[aria-label="Files"]')).toBeNull();
  expect(document.body.textContent).toContain("Drop a file");
});

test("rows are identified by `getRowId`, not by a field named `key`", async () => {
  // The old engine required rows to carry `key`; nothing does now, so a datum with no
  // such field has to list correctly rather than collapse to one row.
  await render(
    <Dropzone
      onDrop={() => {}}
      data={ROWS}
      getRowId={(r) => r.id}
      columns={[COLUMNS[0]]}
      ariaLabel="Files"
    />,
  );

  expect(rows()).toHaveLength(2);
});
