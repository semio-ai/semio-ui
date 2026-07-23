import { useState } from "react";
import { ListGrid, type ListColumn } from "@semio/ui";

interface Row {
  id: string;
  name: string;
  kind: string;
  updated: string;
}

const ROWS: Row[] = [
  { id: "r1", name: "Atlas", kind: "Robot", updated: "2m ago" },
  { id: "r2", name: "Beacon", kind: "Sensor", updated: "5m ago" },
  { id: "r3", name: "Cartographer", kind: "Service", updated: "1h ago" },
  { id: "r4", name: "Delta", kind: "Robot", updated: "3h ago" },
  { id: "r5", name: "Echo", kind: "Sensor", updated: "yesterday" },
];

const COLUMNS: ListColumn<Row>[] = [
  { key: "name", header: "Name", flex: true, render: (r) => <span className="truncate">{r.name}</span> },
  { key: "kind", header: "Kind", hideBelow: "sm", render: (r) => <span className="text-neutral-500">{r.kind}</span> },
  {
    key: "updated",
    header: "Updated",
    align: "right",
    hideBelow: "xs",
    render: (r) => <span className="font-mono text-xs text-neutral-500">{r.updated}</span>,
  },
];

export default { title: "ui/ListGrid" };

export const DisplayOnly = () => (
  <div className="w-[520px] p-4">
    <ListGrid data={ROWS} getRowId={(r) => r.id} columns={COLUMNS} ariaLabel="Display list" />
  </div>
);

export const SingleSelect = () => {
  const [sel, setSel] = useState<Set<string>>(new Set(["r2"]));
  return (
    <div className="w-[520px] p-4">
      <ListGrid
        data={ROWS}
        getRowId={(r) => r.id}
        columns={COLUMNS}
        selectionMode="single"
        selected={sel}
        onSelectionChange={setSel}
        getSearchText={(r) => r.name}
        ariaLabel="Single-select list"
      />
    </div>
  );
};

export const MultipleSelect = () => (
  <div className="w-[520px] p-4">
    <ListGrid
      data={ROWS}
      getRowId={(r) => r.id}
      columns={COLUMNS}
      selectionMode="multiple"
      defaultSelected={["r1", "r2"]}
      getSearchText={(r) => r.name}
      ariaLabel="Multi-select list"
    />
  </div>
);

export const NoHeaderSingleColumn = () => (
  <div className="w-[360px] p-4">
    <ListGrid
      data={ROWS}
      getRowId={(r) => r.id}
      columns={[{ key: "name", flex: true, render: (r) => <span className="truncate">{r.name}</span> }]}
      selectionMode="single"
      noHeader
      defaultSelected={["r3"]}
      ariaLabel="Compact list"
    />
  </div>
);

// Capability check (parity with the old TableList's rich cells): a cell may
// render ANY content and reflect the row's interaction state via the second
// `render` arg — here an avatar, a chip, and a "✓ selected" marker.
export const RichCells = () => {
  const [sel, setSel] = useState<Set<string>>(new Set(["r2"]));
  return (
    <div className="w-[560px] p-4">
      <ListGrid
        data={ROWS}
        getRowId={(r) => r.id}
        selectionMode="single"
        selected={sel}
        onSelectionChange={setSel}
        ariaLabel="Rich cells"
        columns={[
          {
            key: "avatar",
            header: "",
            render: (r) => (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-500/30 text-[10px] font-semibold">
                {r.name[0]}
              </span>
            ),
          },
          { key: "name", header: "Name", flex: true, render: (r) => <span className="truncate">{r.name}</span> },
          {
            key: "kind",
            header: "Kind",
            render: (r) => (
              <span className="rounded-xs bg-neutral-500/20 px-1.5 py-0.5 text-xs">{r.kind}</span>
            ),
          },
          {
            key: "state",
            header: "",
            align: "right",
            // Reflects the interaction state passed to render().
            render: (_r, { selected }) => (
              <span className="text-xs text-neutral-500">{selected ? "✓ selected" : ""}</span>
            ),
          },
        ]}
      />
    </div>
  );
};

// Capability + reliability demo: rows containing editable inputs. Typing (and
// arrowing at the text boundary) stays in the field — the list never steals
// focus. Behavior is locked by list-grid-reliability.browser.tsx.
export const EditableCells = () => {
  const [names, setNames] = useState<Record<string, string>>(
    Object.fromEntries(ROWS.map((r) => [r.id, r.name])),
  );
  return (
    <div className="w-[520px] p-4">
      <ListGrid
        data={ROWS}
        getRowId={(r) => r.id}
        selectionMode="single"
        defaultSelected={["r1"]}
        ariaLabel="Editable cells"
        columns={[
          {
            key: "name",
            header: "Name (editable)",
            flex: true,
            render: (r) => (
              <input
                aria-label={`name-${r.id}`}
                className="w-full bg-transparent outline-none"
                value={names[r.id]}
                onChange={(e) => setNames((prev) => ({ ...prev, [r.id]: e.target.value }))}
              />
            ),
          },
          { key: "kind", header: "Kind", render: (r) => <span className="text-neutral-500">{r.kind}</span> },
        ]}
      />
    </div>
  );
};

// Pure-CSS responsive column hiding via container queries: `Updated` (hideBelow
// "xs" = 320px) and `Kind` (hideBelow "sm" = 384px) drop out as the grid's own
// width shrinks — no JS, no ResizeObserver. Each column's `auto` track collapses.
export const ResponsiveHiding = () => (
  <div className="flex flex-col gap-6 p-4">
    {[520, 360, 280].map((w) => (
      <div key={w}>
        <div className="mb-1 font-mono text-xs text-neutral-500">{w}px</div>
        <div style={{ width: w }}>
          <ListGrid
            data={ROWS}
            getRowId={(r) => r.id}
            columns={COLUMNS}
            selectionMode="single"
            defaultSelected={["r1"]}
            ariaLabel={`List at ${w.toString()}px`}
          />
        </div>
      </div>
    ))}
  </div>
);
