import { afterEach, expect, test } from "vitest";
import { useTooltipStore } from "./store";

afterEach(() => useTooltipStore.getState().unregisterAnchor("content-anchor"));

test("updating an anchor to the content it already holds writes nothing", () => {
  const content = "Explanation";
  useTooltipStore.getState().registerAnchor({
    id: "content-anchor",
    content,
    positioning: {},
  });
  const anchors = useTooltipStore.getState().anchors;
  useTooltipStore.getState().updateAnchorContent("content-anchor", content);
  // Subscribers compare the anchors map by identity, so an unchanged map re-renders none.
  expect(useTooltipStore.getState().anchors).toBe(anchors);

  useTooltipStore.getState().updateAnchorContent("content-anchor", "Another explanation");
  expect(useTooltipStore.getState().anchors).not.toBe(anchors);
  expect(useTooltipStore.getState().anchors.get("content-anchor")?.content).toBe(
    "Another explanation",
  );
});
