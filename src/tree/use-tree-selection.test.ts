import { describe, expect, it } from "vitest";
import {
  applySelection,
  idsInRange,
  resolveGesture,
  type SelectionState,
} from "./use-tree-selection";

const order = ["a", "b", "c", "d", "e"];
const noDesc = (id: string) => [id];
const start: SelectionState = { selected: new Set(), anchorId: null };

describe("resolveGesture", () => {
  it("prioritizes range over toggle over replace", () => {
    expect(resolveGesture({})).toBe("replace");
    expect(resolveGesture({ toggle: true })).toBe("toggle");
    expect(resolveGesture({ range: true })).toBe("range");
    expect(resolveGesture({ range: true, toggle: true })).toBe("range");
  });
});

describe("idsInRange", () => {
  it("is direction-agnostic and inclusive", () => {
    expect(idsInRange(order, "b", "d")).toEqual(["b", "c", "d"]);
    expect(idsInRange(order, "d", "b")).toEqual(["b", "c", "d"]);
  });
  it("falls back to the target when the anchor is absent", () => {
    expect(idsInRange(order, "zzz", "c")).toEqual(["c"]);
  });
});

describe("applySelection", () => {
  const params = { order, expand: noDesc };

  it("replace selects only the target and sets the anchor", () => {
    const r = applySelection({ selected: new Set(["a", "b"]), anchorId: "a" }, "d", {}, params);
    expect([...r.selected]).toEqual(["d"]);
    expect(r.anchorId).toBe("d");
  });

  it("toggle adds then removes, keeping the rest", () => {
    const added = applySelection({ selected: new Set(["a"]), anchorId: "a" }, "c", { toggle: true }, params);
    expect([...added.selected].sort()).toEqual(["a", "c"]);
    const removed = applySelection(added, "c", { toggle: true }, params);
    expect([...removed.selected]).toEqual(["a"]);
  });

  it("range extends from the anchor and preserves it", () => {
    const r = applySelection({ selected: new Set(["b"]), anchorId: "b" }, "d", { range: true }, params);
    expect([...r.selected].sort()).toEqual(["b", "c", "d"]);
    expect(r.anchorId).toBe("b");
  });

  it("rangeMode 'replace' makes the selection exactly the range (Finder-style), keeping the anchor", () => {
    // 'a' was selected but is outside the b→d range; replace drops it.
    const r = applySelection(
      { selected: new Set(["a", "b"]), anchorId: "b" },
      "d",
      { range: true },
      { order, expand: noDesc, rangeMode: "replace" },
    );
    expect([...r.selected].sort()).toEqual(["b", "c", "d"]);
    expect(r.anchorId).toBe("b");
  });

  it("rangeMode defaults to 'extend' (unchanged for TreeGrid)", () => {
    const r = applySelection({ selected: new Set(["a", "b"]), anchorId: "b" }, "d", { range: true }, params);
    expect([...r.selected].sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("range with no anchor falls back to replace", () => {
    const r = applySelection(start, "c", { range: true }, params);
    expect([...r.selected]).toEqual(["c"]);
    expect(r.anchorId).toBe("c");
  });

  it("range falls back to replace when the anchor is no longer selected (stale/controlled)", () => {
    // e.g. an external controlled update dropped 'a' from the selection.
    const r = applySelection({ selected: new Set(["c"]), anchorId: "a" }, "e", { range: true }, params);
    expect([...r.selected]).toEqual(["e"]);
    expect(r.anchorId).toBe("e");
  });

  it("expands group nodes to their descendants", () => {
    const expand = (id: string) => (id === "b" ? ["b", "b1", "b2"] : [id]);
    const r = applySelection(start, "b", {}, { order, expand });
    expect([...r.selected].sort()).toEqual(["b", "b1", "b2"]);
  });

  it("resets selection and reports scopeChanged when crossing scopes", () => {
    const scopeOf = (id: string) => (id === "e" ? "scope2" : "scope1");
    // anchor 'a' is scope1; targeting 'e' (scope2) with a range gesture still resets.
    const r = applySelection(
      { selected: new Set(["a", "b"]), anchorId: "a" },
      "e",
      { range: true },
      { order, expand: noDesc, scopeOf },
    );
    expect(r.scopeChanged).toBe(true);
    expect(r.scope).toBe("scope2");
    expect([...r.selected]).toEqual(["e"]);
    expect(r.anchorId).toBe("e");
  });

  it("does not report a scope change within the same scope", () => {
    const scopeOf = () => "only";
    const r = applySelection({ selected: new Set(["a"]), anchorId: "a" }, "c", {}, { order, expand: noDesc, scopeOf });
    expect(r.scopeChanged).toBe(false);
  });
});
