import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TreeToggle } from "./tree-toggle";

// Smoke test for the browser harness itself: a real click in real Chromium.
test("TreeToggle invokes onToggle with the next expanded state on click", async () => {
  const onToggle = vi.fn();
  const screen = await render(<TreeToggle expanded onToggle={onToggle} ariaLabel="Toggle color" />);

  await screen.getByRole("button", { name: "Toggle color" }).click();

  expect(onToggle).toHaveBeenCalledWith(false);
});
