import { describe, expect, it } from "vitest";
import { flattenTree, type TreeNode } from "./flatten-tree";

interface Payload {
  label: string;
}

const tree: TreeNode<Payload>[] = [
  {
    id: "a",
    data: { label: "A" },
    children: [
      { id: "a.1", data: { label: "A.1" } },
      {
        id: "a.2",
        data: { label: "A.2" },
        children: [{ id: "a.2.x", data: { label: "A.2.x" } }],
      },
    ],
  },
  { id: "b", data: { label: "B" } },
];

describe("flattenTree", () => {
  it("emits rows in depth-first order with correct depth and group flags", () => {
    const rows = flattenTree(tree);
    expect(rows.map((r) => r.id)).toEqual(["a", "a.1", "a.2", "a.2.x", "b"]);
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 1, 2, 0]);
    expect(rows.map((r) => r.isGroup)).toEqual([true, false, true, false, false]);
  });

  it("omits descendants of collapsed groups but keeps the group row", () => {
    const rows = flattenTree(tree, { isCollapsed: (id) => id === "a" });
    expect(rows.map((r) => r.id)).toEqual(["a", "b"]);
    const groupA = rows.find((r) => r.id === "a");
    expect(groupA?.isGroup).toBe(true);
    expect(groupA?.expanded).toBe(false);
  });

  it("collapses only the targeted subtree, leaving deeper siblings visible", () => {
    const rows = flattenTree(tree, { isCollapsed: (id) => id === "a.2" });
    expect(rows.map((r) => r.id)).toEqual(["a", "a.1", "a.2", "b"]);
    expect(rows.find((r) => r.id === "a.2.x")).toBeUndefined();
  });

  it("computes ancestorIsLast root-to-parent, length === depth", () => {
    const rows = flattenTree(tree);
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId.a.ancestorIsLast).toEqual([]);
    // parent "a" is NOT the last root sibling ("b" follows) → false
    expect(byId["a.1"].ancestorIsLast).toEqual([false]);
    expect(byId["a.2"].ancestorIsLast).toEqual([false]);
    // ancestors: "a" (not last) then "a.2" (last child of a) → [false, true]
    expect(byId["a.2.x"].ancestorIsLast).toEqual([false, true]);
  });

  it("reports leaves as non-expanded", () => {
    const rows = flattenTree(tree);
    expect(rows.find((r) => r.id === "b")?.expanded).toBe(false);
  });
});
