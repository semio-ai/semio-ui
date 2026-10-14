// @vitest-environment jsdom
import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  DialogSurface,
  OverlayAccessibilityFixture,
  OverlayEntry,
} from "./overlay-accessibility.fixture";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value() {},
  });
  Object.defineProperty(HTMLElement.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
});

async function openMenu(entry: OverlayEntry, select = true) {
  const trigger = screen.getByRole("button", { name: "Open menu" });
  if (entry === OverlayEntry.ContextMenu || entry === OverlayEntry.ContextSubmenu) {
    fireEvent.contextMenu(trigger, { clientX: 80, clientY: 80 });
  } else if (entry === OverlayEntry.Dropdown || entry === OverlayEntry.DropdownSubmenu) {
    fireEvent.keyDown(trigger, { key: "Enter" });
  } else {
    fireEvent.click(trigger);
  }
  if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
    const submenu = await screen.findByRole("menuitem", { name: "Create" });
    fireEvent.keyDown(submenu, { key: "ArrowRight" });
  }
  const role = entry === OverlayEntry.Popover ? "button" : "menuitem";
  await waitFor(() => expect(screen.getByRole(role, { name: "New entity" })).toBeTruthy());
  if (select) fireEvent.click(screen.getByRole(role, { name: "New entity" }));
}

test.each(Object.values(OverlayEntry))(
  "%s leaves the background accessible until a dialog opens",
  async (entry) => {
    const { container } = render(
      <StrictMode>
        <OverlayAccessibilityFixture entry={entry} />
      </StrictMode>,
    );
    await openMenu(entry, false);
    expect(container.getAttribute("aria-hidden")).toBeNull();
    expect(screen.getByRole("button", { name: "Scene row" })).toBeTruthy();
  },
);

async function pickModelAndClose(container: HTMLElement) {
  await waitFor(() => expect(screen.getByRole("dialog", { name: "Add Entity" })).toBeTruthy());
  // Exercise the child popup before checking the final accessible tree.
  fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
  await waitFor(() => expect(screen.getByRole("option", { name: "Model" })).toBeTruthy());
  expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
  fireEvent.click(screen.getByRole("option", { name: "Model" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /^Add$/ }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(container.getAttribute("aria-hidden")).toBeNull());
  expect(screen.getByRole("button", { name: "Scene row" })).toBeTruthy();
}

for (const surface of Object.values(DialogSurface)) {
  test.each(Object.values(OverlayEntry))(
    `%s → ${surface} restores the accessible app after using its combobox`,
    async (entry) => {
      const { container } = render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} />
        </StrictMode>,
      );
      await openMenu(entry);
      await pickModelAndClose(container);
    },
  );

  test(`direct ${surface} restores the accessible app after using its combobox`, async () => {
    const { container } = render(
      <StrictMode>
        <OverlayAccessibilityFixture surface={surface} />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Direct dialog" }));
    await pickModelAndClose(container);
  });

  test.each(Object.values(OverlayEntry))(
    `${surface} → %s keeps modal isolation and restores the accessible app`,
    async (entry) => {
      const { container } = render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} inside />
        </StrictMode>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Direct dialog" }));
      await waitFor(() => {
        const dialog = screen.getByRole("dialog", { name: "Add Entity" });
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
      await openMenu(entry);
      await pickModelAndClose(container);
    },
  );
}
