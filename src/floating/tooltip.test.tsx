// @vitest-environment jsdom
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Variant } from "../types";
import { NestedItem } from "../nested-elements/item";
import { Dropdown } from "./dropdown";
import { Tooltip, isEscapeConsumedByTooltip } from "./tooltip";

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
  Object.defineProperty(HTMLElement.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
});

test("the visible controlled tooltip supplies its trigger's accessible description", async () => {
  const portalContainer = document.createElement("div");
  document.body.append(portalContainer);
  function Fixture() {
    const [open, setOpen] = useState(true);
    return (
      <Tooltip
        content="Explanation"
        controlledState={[open, setOpen]}
        portalContainer={portalContainer}
        variant={Variant.Primary}
        invert
      >
        <button type="button">Trigger</button>
      </Tooltip>
    );
  }
  try {
    render(<Fixture />);
    const popup = await screen.findByRole("tooltip");
    const trigger = screen.getByRole("button", { name: "Trigger" });
    expect(screen.getAllByText("Explanation")).toHaveLength(1);
    expect(popup.textContent).toBe("Explanation");
    expect(popup.id).not.toBe("");
    expect(trigger.getAttribute("aria-describedby")).toBe(popup.id);
    expect(popup.getAttribute("data-state")).toBe("open");
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(portalContainer.contains(popup)).toBe(true);
    expect(popup.closest(".z-10")).not.toBeNull();
    expect(popup.classList.contains("card-invert")).toBe(true);
    expect(popup.classList.contains(Variant.Primary)).toBe(true);
    expect(popup.querySelector("svg")?.getAttribute("preserveAspectRatio")).toBe("none");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
    expect(trigger.getAttribute("data-state")).toBe("closed");
  } finally {
    cleanup();
    portalContainer.remove();
  }
});

test("a trigger that names its own description keeps it while the tooltip is open", async () => {
  render(
    <>
      <span id="existing-description">Explanation</span>
      <Tooltip content="Explanation" controlledState={[true, () => {}]}>
        <button type="button" aria-describedby="existing-description">
          Trigger
        </button>
      </Tooltip>
    </>,
  );
  await screen.findByRole("tooltip");
  expect(screen.getByRole("button", { name: "Trigger" }).getAttribute("aria-describedby")).toBe(
    "existing-description",
  );
});

test.each([true, false])("aria-disabled=%s controls press dismissal", async (disabled) => {
  render(
    <Tooltip content="Explanation">
      <button type="button" aria-disabled={disabled}>
        Trigger
      </button>
    </Tooltip>,
  );
  const trigger = screen.getByRole("button", { name: "Trigger" });
  act(() => trigger.focus());
  await screen.findByRole("tooltip");
  fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
  fireEvent.click(trigger);
  await waitFor(() =>
    expect(trigger.getAttribute("data-state")).toBe(disabled ? "open" : "closed"),
  );
  if (disabled) {
    // A dispatched scroll is measurement feedback and keeps the explanation open.
    fireEvent.scroll(trigger.parentElement!);
    expect(trigger.getAttribute("data-state")).toBe("open");
    // The press exemption is scoped to this trigger.
    fireEvent.pointerDown(document.body, { pointerType: "mouse", button: 0 });
    await waitFor(() => expect(trigger.getAttribute("data-state")).toBe("closed"));
  }
});

test.each([true, false])(
  "a disabled entry's explanation consumes Escape before its menu (focused=%s)",
  async (focused) => {
    render(
      <Dropdown trigger={<button type="button">Actions</button>}>
        <NestedItem>First</NestedItem>
        <NestedItem disabled description="Requires Editor access">
          Edit
        </NestedItem>
      </Dropdown>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Actions" }), { detail: 0 });
    const entry = await screen.findByRole("menuitem", { name: "Edit" });
    const focusTarget = focused ? entry : screen.getByRole("menuitem", { name: "First" });
    act(() => focusTarget.focus());
    if (!focused) {
      fireEvent.pointerEnter(entry, { pointerType: "mouse" });
      fireEvent.mouseEnter(entry);
      fireEvent.mouseMove(entry);
    }
    await screen.findByRole("tooltip");
    expect(
      screen.getByRole("menuitem", { name: "Edit", description: "Requires Editor access" }),
    ).toBe(entry);
    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      // A hovered explanation can receive Escape while another entry has focus.
      focusTarget.focus();
      focusTarget.dispatchEvent(escape);
    });
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(isEscapeConsumedByTooltip(escape)).toBe(true);
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(document.activeElement).toBe(focusTarget);
    fireEvent.keyDown(focusTarget, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
);

test("disabled renders the bare child", () => {
  const { container } = render(
    <Tooltip disabled content="Explanation">
      <span>Child</span>
    </Tooltip>,
  );
  expect(container.innerHTML).toBe("<span>Child</span>");
});
