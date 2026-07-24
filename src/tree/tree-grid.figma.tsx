import figma from "@figma/code-connect";
import { TreeGrid } from "./tree-grid";

/**
 * Code Connect for TreeGrid — the nested, collapsible hierarchical row list.
 *
 * Like ListGrid, TreeGrid is a COMPOSITE component: its props (nodes / getLabel /
 * getEditor + selection + collapse) don't map onto Figma Variant/State axes — the
 * TreeRow atoms in the Figma file are visual-state replicas, not prop-driven. So
 * Code Connect points at the composition example frame and shows a representative
 * <TreeGrid> usage (a nested tree with a couple of groups) rather than a
 * per-variant prop translation.
 *
 * Validated on the Professional plan via `npx figma connect parse`. The file key
 * lives once in figma.config.json (`documentUrlSubstitutions`), not here.
 */
figma.connect(TreeGrid, "<SEMIO_UI_LIBRARY>?node-id=690-1359", {
  example: () => (
    <TreeGrid
      nodes={[
        {
          id: "robot",
          data: { label: "robot" },
          children: [
            { id: "robot/head", data: { label: "head" } },
            { id: "robot/arm", data: { label: "arm" } },
          ],
        },
        {
          id: "sensors",
          data: { label: "sensors" },
          children: [{ id: "sensors/lidar", data: { label: "lidar" } }],
        },
      ]}
      getLabel={(row) => row.data.label}
      defaultSelected={["robot/head"]}
      ariaLabel="Scene"
    />
  ),
});
