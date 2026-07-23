import { expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTreeSelection } from "./use-tree-selection";

// Hook-level behavior that the pure applySelection tests can't cover (state +
// anchor lifecycle). Lives in the browser project because it needs a live React.

const order = ["a", "b", "c", "d"];

test("setSelection drops a stale anchor but keeps one that's still selected", () => {
  const { result } = renderHook(() => useTreeSelection({ order }));

  // Establish an anchor at 'c'.
  act(() => result.current.select("c"));
  expect(result.current.anchorId).toBe("c");

  // A wholesale set that still contains 'c' preserves the anchor…
  act(() => result.current.setSelection(["a", "c"]));
  expect(result.current.anchorId).toBe("c");

  // …but a set that no longer contains it drops the anchor (so a later range
  // gesture won't extend from a row that isn't selected).
  act(() => result.current.setSelection(["a", "b"]));
  expect(result.current.anchorId).toBeNull();

  // An explicit anchor always wins.
  act(() => result.current.setSelection(["a", "b"], "b"));
  expect(result.current.anchorId).toBe("b");
});
