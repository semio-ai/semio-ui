// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Select } from "./select";
import { Tooltip } from "./tooltip";

beforeEach(() => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
];

test.each(["icons", "labels", "both"] as const)(
  "%s accessible name includes the field label and follows the selected value",
  (visuals) => {
    const { rerender } = render(
      <Select
        value="viewer"
        options={OPTIONS}
        onChange={() => {}}
        label="Role"
        visuals={visuals}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Role: Viewer" });
    if (visuals !== "icons") expect(trigger.textContent).toContain("Viewer");
    rerender(
      <Select
        value="editor"
        options={OPTIONS}
        onChange={() => {}}
        label="Role"
        visuals={visuals}
      />,
    );
    expect(screen.getByRole("button", { name: "Role: Editor" })).toBe(trigger);
    expect(screen.queryByRole("button", { name: "Role: Viewer" })).toBeNull();
    if (visuals !== "icons") expect(trigger.textContent).toContain("Editor");
  },
);

test.each([true, false])("disabled=%s gates a pointer attempt to open the menu", (disabled) => {
  render(
    <Select
      value="viewer"
      options={OPTIONS}
      onChange={() => {}}
      label="Role"
      disabled={disabled}
    />,
  );
  fireEvent.pointerDown(screen.getByRole("button", { name: "Role: Viewer" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.queryByRole("menu") !== null).toBe(!disabled);
});

test.each(["icons", "labels", "both"] as const)(
  "%s uses native disabled button semantics",
  (visuals) => {
    render(
      <Select
        value="viewer"
        options={OPTIONS}
        onChange={() => {}}
        label="Role"
        visuals={visuals}
        disabled
      />,
    );
    const trigger = screen.getByRole("button", { name: "Role: Viewer" });
    expect(trigger.tagName).toBe("BUTTON");
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
  },
);

test.each(["icons", "labels", "both"] as const)(
  "%s focus exposes the wrapping Tooltip explanation",
  async (visuals) => {
    render(
      <Tooltip content="Current role" side="left">
        <span>
          <Select
            value="viewer"
            options={OPTIONS}
            onChange={() => {}}
            label="Role"
            visuals={visuals}
          />
        </span>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Role: Viewer" });
    fireEvent.focus(trigger);
    await waitFor(() => expect(screen.getByRole("tooltip").textContent).toBe("Current role"));
  },
);

test("a wrapping explanation stays open when the pointer enters its content", async () => {
  render(
    <Tooltip content="Members can view the project.">
      <span data-testid="rung-explanation">
        <Select value="viewer" options={OPTIONS} onChange={() => {}} label="Role" />
      </span>
    </Tooltip>,
  );
  const trigger = screen.getByTestId("rung-explanation");
  fireEvent.pointerMove(trigger, { pointerType: "mouse" });
  await waitFor(() => expect(document.querySelector(".tooltip-content")).not.toBeNull());
  const content = document.querySelector<HTMLElement>(".tooltip-content")!;
  // Deliver both edges of the hover transition to the real Radix primitive.
  // Browser coverage also checks the pointer's path and the popup's hit testing.
  fireEvent.pointerLeave(trigger, { pointerType: "mouse", relatedTarget: content });
  fireEvent.pointerMove(content, { pointerType: "mouse" });
  expect(content.isConnected).toBe(true);
  expect(trigger.getAttribute("data-state")).toMatch(/^(instant|delayed)-open$/);
  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() => expect(trigger.getAttribute("data-state")).toBe("closed"));
});
