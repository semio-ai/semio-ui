import figma from "@figma/code-connect";
import { ListGrid } from "./list-grid";

/**
 * Code Connect for ListGrid — the flat, column-aligned list built on the shared
 * tree selection + roving-focus engine.
 *
 * ListGrid is a COMPOSITE component: its props (data / getRowId / columns + the
 * per-cell render) don't map onto Figma Variant/State axes — the ListRow atoms
 * in the Figma file are visual-state replicas, not prop-driven. So Code Connect
 * points at the composition example frame and shows a representative <ListGrid>
 * usage (a multi-column, multi-select list) rather than a per-variant prop
 * translation.
 *
 * Validated on the Professional plan via `npx figma connect parse`. The file key
 * lives once in figma.config.json (`documentUrlSubstitutions`), not here.
 */
figma.connect(ListGrid, "<SEMIO_UI_LIBRARY>?node-id=689-1309", {
  example: () => (
    <ListGrid
      data={[
        { id: "atlas", name: "Atlas", kind: "Robot" },
        { id: "beacon", name: "Beacon", kind: "Sensor" },
        { id: "cartographer", name: "Cartographer", kind: "Service" },
      ]}
      getRowId={(row) => row.id}
      columns={[
        { key: "name", header: "Name", flex: true, render: (row) => row.name },
        { key: "kind", header: "Kind", hideBelow: "sm", render: (row) => row.kind },
      ]}
      selectionMode="multiple"
      defaultSelected={["beacon"]}
      getSearchText={(row) => row.name}
      ariaLabel="Items"
    />
  ),
});
