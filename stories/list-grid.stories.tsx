import { useState } from "react";
import {
  ListGrid,
  type ListColumn,
  type ResolveRowVisual,
  Variant,
  defaultResolveRowVisual,
} from "@semio/ui";

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
  {
    key: "name",
    header: "Name",
    flex: true,
    render: (r) => <span className="truncate">{r.name}</span>,
  },
  {
    key: "kind",
    header: "Kind",
    hideBelow: "sm",
    render: (r) => <span className="text-neutral-500">{r.kind}</span>,
  },
  {
    key: "updated",
    header: "Updated",
    align: "right",
    hideBelow: "xs",
    render: (r) => <span className="font-mono text-xs text-neutral-500">{r.updated}</span>,
  },
];

// Per-story Figma design link → the ListGrid composition example frame.
const design = (url: string) => ({ design: { type: "figma" as const, url } });
const FIGMA_LIST_GRID =
  "https://www.figma.com/design/ExKZLlbGQ3lJxBddvR500j/Semio-UI-Library?node-id=689-1309";

export default { title: "ui/ListGrid", parameters: design(FIGMA_LIST_GRID) };

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
      columns={[
        { key: "name", flex: true, render: (r) => <span className="truncate">{r.name}</span> },
      ]}
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
          {
            key: "name",
            header: "Name",
            flex: true,
            render: (r) => <span className="truncate">{r.name}</span>,
          },
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
          {
            key: "kind",
            header: "Kind",
            render: (r) => <span className="text-neutral-500">{r.kind}</span>,
          },
        ]}
      />
    </div>
  );
};

// Per-row color/variant: each row can carry its own theme variant or arbitrary
// custom color (consistent with the rest of the UI library and with the
// hierarchical primitives' arbitrary coloring). The resolver spreads the default
// (theme-aware accent intensities) and adds a per-row color/variant, so selection
// + hover render in that row's color. Left column = a swatch of the same color.
const ROW_VARIANT: Record<string, Variant> = {
  r1: Variant.Error,
  r2: Variant.Success,
  r3: Variant.Info,
  r4: Variant.Warning,
  r5: Variant.Primary,
};
export const PerRowVariant = () => {
  const [sel, setSel] = useState<Set<string>>(new Set(["r2"]));
  const resolveVisual: ResolveRowVisual<Row> = (state, row) => ({
    ...defaultResolveRowVisual(state, row),
    variant: ROW_VARIANT[row.id],
  });
  return (
    <div className="w-[520px] p-4">
      <ListGrid
        data={ROWS}
        getRowId={(r) => r.id}
        selectionMode="single"
        selected={sel}
        onSelectionChange={setSel}
        resolveVisual={resolveVisual}
        ariaLabel="Per-row variant"
        columns={[
          {
            key: "name",
            header: "Name",
            flex: true,
            render: (r) => <span className="truncate">{r.name}</span>,
          },
          {
            key: "kind",
            header: "Kind",
            align: "right",
            render: (r) => <span className="text-neutral-500">{r.kind}</span>,
          },
        ]}
      />
    </div>
  );
};

const ROW_COLOR: Record<string, string> = {
  r1: "#e5484d",
  r2: "#30a46c",
  r3: "#0091ff",
  r4: "#f5a623",
  r5: "#8e4ec6",
};
export const PerRowCustomColor = () => {
  const [sel, setSel] = useState<Set<string>>(new Set(["r3"]));
  const resolveVisual: ResolveRowVisual<Row> = (state, row) => ({
    ...defaultResolveRowVisual(state, row),
    color: ROW_COLOR[row.id],
  });
  return (
    <div className="w-[520px] p-4">
      <ListGrid
        data={ROWS}
        getRowId={(r) => r.id}
        selectionMode="single"
        selected={sel}
        onSelectionChange={setSel}
        resolveVisual={resolveVisual}
        ariaLabel="Per-row custom color"
        columns={[
          {
            key: "dot",
            header: "",
            render: (r) => (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ROW_COLOR[r.id] }}
              />
            ),
          },
          {
            key: "name",
            header: "Name",
            flex: true,
            render: (r) => <span className="truncate">{r.name}</span>,
          },
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

/**
 * One click selects, two open — the desktop-file idiom, via the optional
 * `onItemDoubleClick`.
 *
 * The gesture is wired here rather than in the list because what a second click
 * *means* is the consumer's: in studio it navigates to the row's page. Keyboard
 * activation stays on `onAction` (Enter), so the two paths remain distinct and a
 * consumer can adopt either without the other.
 */
export const DoubleClickToOpen = () => {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="w-[520px] space-y-2 p-4">
      <ListGrid
        data={ROWS}
        getRowId={(r) => r.id}
        columns={COLUMNS}
        selectionMode="single"
        selected={sel}
        onSelectionChange={setSel}
        onItemDoubleClick={(id) => setOpened(id)}
        onAction={(id) => setOpened(id)}
        getSearchText={(r) => r.name}
        ariaLabel="Double-click to open"
      />
      <p className="text-xs opacity-70">
        {opened ? `Opened: ${opened}` : "Select with one click; open with two (or Enter)."}
      </p>
    </div>
  );
};
