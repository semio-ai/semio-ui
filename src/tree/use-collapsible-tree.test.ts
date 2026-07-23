import { describe, expect, it } from "vitest";
import { toggleInSet, withMembership } from "./use-collapsible-tree";

describe("toggleInSet", () => {
  it("adds a missing id and removes a present one, without mutating the input", () => {
    const base = new Set(["x"]);
    const added = toggleInSet(base, "y");
    expect([...added].sort()).toEqual(["x", "y"]);
    expect([...base]).toEqual(["x"]); // input untouched

    const removed = toggleInSet(added, "x");
    expect([...removed]).toEqual(["y"]);
  });
});

describe("withMembership", () => {
  it("returns the same reference when membership is unchanged", () => {
    const base = new Set(["x"]);
    expect(withMembership(base, "x", true)).toBe(base);
    expect(withMembership(base, "z", false)).toBe(base);
  });

  it("returns a new set when membership changes", () => {
    const base = new Set(["x"]);
    const added = withMembership(base, "y", true);
    expect(added).not.toBe(base);
    expect([...added].sort()).toEqual(["x", "y"]);
    expect([...withMembership(base, "x", false)]).toEqual([]);
  });
});
