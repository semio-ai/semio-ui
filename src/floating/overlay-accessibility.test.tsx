// @vitest-environment jsdom
import { StrictMode, type MouseEvent } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { NestedItem } from "../nested-elements/item";
import { NestedRadio } from "../nested-elements/radio";
import { NestedCheckbox } from "../nested-elements/checkbox";
import { NestedSelect } from "../nested-elements/select";
import { Dropdown } from "./dropdown";
import {
  DialogSurface,
  OverlayAccessibilityFixture,
  OverlayEntry,
  MENU_ENTRIES,
  POPOVER_ENTRIES,
  OVERLAY_SELECTION_CASES,
  MenuSurroundings,
  MenuUsabilityFixture,
} from "./overlay-accessibility.fixture";

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

async function openMenu(
  entry: OverlayEntry,
  select: boolean | "keyboard" = true,
  afterOpen?: () => Promise<void>,
) {
  const trigger = screen.getByRole("button", { name: "Open menu" });
  if (entry === OverlayEntry.ContextMenu || entry === OverlayEntry.ContextSubmenu) {
    fireEvent.contextMenu(trigger, { clientX: 80, clientY: 80 });
  } else if (entry === OverlayEntry.Dropdown || entry === OverlayEntry.DropdownSubmenu) {
    fireEvent.click(trigger, { detail: 0 });
  } else {
    fireEvent.click(trigger);
  }
  if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
    const submenu = await screen.findByRole("menuitem", { name: "Create" });
    fireEvent.keyDown(submenu, { key: "ArrowRight" });
  }
  const role = POPOVER_ENTRIES.includes(entry) ? "button" : "menuitem";
  const item = await screen.findByRole(role, { name: "New entity" });
  if (!POPOVER_ENTRIES.includes(entry)) await waitForMenuFocus(entry);
  await afterOpen?.();
  if (select === "keyboard") {
    act(() => item.focus());
    fireEvent.keyDown(item, { key: "Enter" });
    if (POPOVER_ENTRIES.includes(entry)) fireEvent.click(item, { detail: 0 });
  } else if (select) fireEvent.click(item);
  return item;
}

function menuHasFocus(entry: OverlayEntry) {
  const submenu = entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu;
  const menu = screen.getByRole("menu", submenu ? { name: "Create" } : undefined);
  return menu.contains(document.activeElement);
}

async function waitForMenuFocus(entry: OverlayEntry) {
  await waitFor(() => expect(menuHasFocus(entry)).toBe(true));
}

test.each(Object.values(OverlayEntry))(
  "%s uses its intended background-hiding policy while open",
  async (entry) => {
    const { container } = render(
      <StrictMode>
        <OverlayAccessibilityFixture entry={entry} />
      </StrictMode>,
    );
    await openMenu(entry, false);
    expect(container.getAttribute("aria-hidden")).toBe(
      entry === OverlayEntry.ContextMenu || entry === OverlayEntry.ContextSubmenu ? "true" : null,
    );
  },
);

async function pickModelAndClose(container: HTMLElement, surface: DialogSurface) {
  await waitFor(() =>
    expect(
      screen.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
        name: "Add Entity",
      }),
    ).toBeTruthy(),
  );
  expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
  // Exercise the child popup before checking the final accessible tree.
  fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
  await waitFor(() => expect(screen.getByRole("option", { name: "Model" })).toBeTruthy());
  expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
  fireEvent.click(screen.getByRole("option", { name: "Model" }));
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /^Add$/ }));
  await waitFor(() =>
    expect(
      screen.queryByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog"),
    ).toBeNull(),
  );
  await waitFor(() => expect(container.getAttribute("aria-hidden")).toBeNull());
  expect(container.closest("[inert]")).toBeNull();
  expect(screen.getByRole("button", { name: "Scene row" })).toBeTruthy();
}

for (const surface of Object.values(DialogSurface)) {
  test.each(OVERLAY_SELECTION_CASES)(
    `%s (%s) → ${surface} restores the accessible app after using its combobox`,
    async (entry, method) => {
      const { container } = render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} />
        </StrictMode>,
      );
      await openMenu(entry, method === "keyboard" ? "keyboard" : true);
      await pickModelAndClose(container, surface);
    },
  );

  test(`direct ${surface} restores the accessible app after using its combobox`, async () => {
    const { container } = render(
      <StrictMode>
        <OverlayAccessibilityFixture surface={surface} />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Direct dialog" }));
    await pickModelAndClose(container, surface);
  });

  test.each(OVERLAY_SELECTION_CASES)(
    `${surface} → %s (%s) → inner modal restores each dialog's background after closing`,
    async (entry, method) => {
      const { container } = render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} inside />
        </StrictMode>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Direct dialog" }));
      await waitFor(() => {
        const dialog = screen.getByRole(
          surface === DialogSurface.Dialog ? "alertdialog" : "dialog",
          { name: "Add Entity" },
        );
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
      expect(container.getAttribute("aria-hidden")).toBe("true");
      expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
      expect(screen.getByRole("button", { name: "Outer dialog action" })).toBeTruthy();
      const item = await openMenu(entry, false);
      expect(screen.queryByRole("button", { name: "Outer dialog action" })).toBe(
        entry !== OverlayEntry.ContextMenu && entry !== OverlayEntry.ContextSubmenu
          ? screen.getByRole("button", { name: "Outer dialog action" })
          : null,
      );
      expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
      expect(container.getAttribute("aria-hidden")).toBe("true");
      if (method === "keyboard") {
        act(() => item.focus());
        fireEvent.keyDown(item, { key: "Enter" });
        if (POPOVER_ENTRIES.includes(entry)) fireEvent.click(item, { detail: 0 });
      } else fireEvent.click(item);
      await waitFor(() => expect(screen.getByRole("dialog", { name: "New Entity" })).toBeTruthy());
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      expect(screen.queryByRole("button", { name: "Outer dialog action" })).toBeNull();
      expect(
        screen.queryByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
          name: "Add Entity",
        }),
      ).toBeNull();
      expect(container.getAttribute("aria-hidden")).toBe("true");
      fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
      fireEvent.click(await screen.findByRole("option", { name: "Model" }));
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
      fireEvent.click(screen.getByRole("button", { name: "Create" }));
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "New Entity" })).toBeNull());
      await waitFor(() =>
        expect(
          screen.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
            name: "Add Entity",
          }),
        ).toBeTruthy(),
      );
      expect(screen.getByRole("button", { name: "Outer dialog action" })).toBeTruthy();
      expect(container.getAttribute("aria-hidden")).toBe("true");
      expect(screen.queryByRole("button", { name: "Scene row" })).toBeNull();
      await pickModelAndClose(container, surface);
    },
  );
}

for (const surroundings of Object.values(MenuSurroundings)) {
  test.each(MENU_ENTRIES)(
    `${surroundings}: %s survives focus moves, selects by click and keyboard, and dismisses deliberately`,
    async (entry) => {
      render(
        <StrictMode>
          <MenuUsabilityFixture entry={entry} surroundings={surroundings} />
        </StrictMode>,
      );
      if (surroundings === MenuSurroundings.Sidebar)
        fireEvent.click(await screen.findByRole("tab", { name: "Menu tab" }));
      const outside = await screen.findByRole("button", { name: "Outside menu" });
      const focusTarget =
        surroundings === MenuSurroundings.Listing
          ? screen.getByRole("option", { name: "Second row" })
          : outside;
      if (surroundings === MenuSurroundings.Listing) {
        const first = screen.getByRole("option", { name: "First row" });
        first.focus();
        fireEvent.keyDown(first, { key: "ArrowDown" });
        await waitFor(() => expect(document.activeElement).toBe(focusTarget));
      }
      let item = await openMenu(entry, false, async () => {
        await act(async () => {
          if (surroundings === MenuSurroundings.Listing) {
            // Exercise the list's own queued roving-focus move while the menu is open.
            fireEvent.keyDown(focusTarget, { key: "ArrowUp" });
          } else focusTarget.focus();
          await Promise.resolve();
        });
        if (surroundings === MenuSurroundings.Listing) {
          expect(screen.getAllByRole("menu").length).toBeGreaterThan(0);
          await waitForMenuFocus(entry);
        } else {
          // Scripted focus can leave a menu; refocus the entry for navigation checks.
          expect(document.activeElement).toBe(focusTarget);
          if (!screen.queryByRole("menuitem", { name: "New entity" })) await openMenu(entry, false);
          screen.getByRole("menuitem", { name: "New entity" }).focus();
        }
      });
      expect(item.isConnected).toBe(true);
      if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
        fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
        const parent = screen.getByRole("menuitem", { name: "Create" });
        await waitFor(() => expect(document.activeElement).toBe(parent));
        fireEvent.keyDown(parent, { key: "ArrowRight" });
        item = await screen.findByRole("menuitem", { name: "New entity" });
      }
      fireEvent.click(screen.getByRole("menuitem", { name: "Keep menu open" }));
      expect(screen.getByRole("menuitem", { name: "New entity" })).toBeTruthy();
      fireEvent.click(item);
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      await waitFor(() =>
        expect(screen.getByRole("status", { name: "Selections" }).textContent).toBe("1"),
      );
      expect(screen.getByRole("status", { name: "Kept open" }).textContent).toBe("1");

      item = await openMenu(entry, false);
      item.focus();
      const keepItem = screen.getByRole("menuitem", { name: "Keep menu open" });
      fireEvent.keyDown(item, { key: "ArrowDown" });
      await waitFor(() => expect(document.activeElement).toBe(keepItem));
      fireEvent.keyDown(keepItem, { key: "ArrowUp" });
      await waitFor(() => expect(document.activeElement).toBe(item));
      // Menu item keyboard activation dispatches a DOM click.
      fireEvent.keyDown(item, { key: "Enter" });
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      await waitFor(() =>
        expect(screen.getByRole("status", { name: "Selections" }).textContent).toBe("2"),
      );

      await openMenu(entry, false);
      fireEvent.click(screen.getByRole("menuitemradio", { name: "Admin" }));
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      await waitFor(() =>
        expect(screen.getByRole("status", { name: "Chosen role" }).textContent).toBe("admin"),
      );

      item = await openMenu(entry, false);
      item.focus();
      fireEvent.keyDown(item, { key: "Escape" });
      if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
        const parentTrigger = screen.getByRole("menuitem", { name: "Create" });
        await waitFor(() => expect(document.activeElement).toBe(parentTrigger));
        fireEvent.keyDown(parentTrigger, { key: "Escape" });
      }
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      if (entry === OverlayEntry.Dropdown || entry === OverlayEntry.DropdownSubmenu) {
        await waitFor(() =>
          expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open menu" })),
        );
      }
      if (surroundings !== MenuSurroundings.Listing)
        expect(screen.getByRole("dialog", { name: "Menu dialog" })).toBeTruthy();

      await openMenu(entry, false);
      // Wait for the menu's document dismissal listeners to register.
      await new Promise((resolve) => setTimeout(resolve, 0));
      fireEvent.pointerDown(outside, { pointerType: "mouse", button: 0 });
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      await waitFor(() =>
        expect(screen.getByRole("status", { name: "Selections" }).textContent).toBe("2"),
      );
    },
  );
}

test.each(["item", "radio", "checkbox", "select"] as const)(
  "%s closing action sees a cleaned-up menu and accessible background",
  async (kind) => {
    let selectedElement: EventTarget | null = null;
    const action = vi.fn((event?: MouseEvent) => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(container.getAttribute("aria-hidden")).toBeNull();
      if (event) expect(event.currentTarget).toBe(selectedElement);
    });
    const options = [{ label: "Choose", value: "chosen", closeOnSelect: true }];
    const content =
      kind === "item" ? (
        <NestedItem onClick={action}>Choose</NestedItem>
      ) : kind === "radio" ? (
        <NestedRadio value="" options={options} onChange={() => action()} />
      ) : kind === "checkbox" ? (
        <NestedCheckbox label="Choose" value={false} closeOnSelect onChange={() => action()} />
      ) : (
        <NestedSelect values={[]} options={options} onChange={() => action()} />
      );
    const { container } = render(
      <StrictMode>
        <Dropdown trigger={<button type="button">Open menu</button>}>{content}</Dropdown>
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }), { detail: 0 });
    const role =
      kind === "item" ? "menuitem" : kind === "radio" ? "menuitemradio" : "menuitemcheckbox";
    const item = await screen.findByRole(role, { name: "Choose" });
    selectedElement = item;
    expect(container.getAttribute("aria-hidden")).toBeNull();
    fireEvent.click(item);
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  },
);

test("a rapid close and reopen delivers both selections after their own teardown", async () => {
  const action = vi.fn();
  render(
    <Dropdown trigger={<button type="button">Open menu</button>}>
      <NestedItem onClick={action}>Choose</NestedItem>
    </Dropdown>,
  );
  const trigger = screen.getByRole("button", { name: "Open menu" });
  // Both selections occur in one task, before the completion handoffs run.
  fireEvent.click(trigger, { detail: 0 });
  fireEvent.click(screen.getByRole("menuitem", { name: "Choose" }));
  fireEvent.click(trigger, { detail: 0 });
  fireEvent.click(screen.getByRole("menuitem", { name: "Choose" }));
  await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
});

for (const surroundings of Object.values(MenuSurroundings)) {
  test.each([OverlayEntry.DropdownSubmenu, OverlayEntry.ContextSubmenu])(
    `${surroundings}: %s focuses the opened submenu before ArrowLeft returns to its trigger`,
    async (entry) => {
      render(<MenuUsabilityFixture entry={entry} surroundings={surroundings} />);
      if (surroundings === MenuSurroundings.Sidebar)
        fireEvent.click(await screen.findByRole("tab", { name: "Menu tab" }));
      await openMenu(entry, false);
      const trigger = screen.getByRole("menuitem", { name: "Create" });
      await waitForMenuFocus(entry);
      fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    },
  );
}

for (const surroundings of Object.values(MenuSurroundings)) {
  test.each(POPOVER_ENTRIES)(
    `${surroundings}: %s accepts button actions and dismisses on Escape and outside press`,
    async (entry) => {
      render(<MenuUsabilityFixture entry={entry} surroundings={surroundings} />);
      if (surroundings === MenuSurroundings.Sidebar)
        fireEvent.click(await screen.findByRole("tab", { name: "Menu tab" }));
      const item = await openMenu(entry, false);
      const popup = item.closest('[role="dialog"]')!;
      expect(screen.queryByRole("menu")).toBeNull();
      expect(screen.queryByRole("menuitem")).toBeNull();
      fireEvent.click(item);
      fireEvent.click(screen.getByRole("button", { name: "Keep popover open" }));
      const admin = screen.getByRole("button", { name: "Choose Admin" });
      act(() => admin.focus());
      fireEvent.keyDown(admin, { key: "Enter" });
      fireEvent.click(admin, { detail: 0 });
      expect(screen.getByRole("status", { name: "Selections" }).textContent).toBe("1");
      expect(screen.getByRole("status", { name: "Kept open" }).textContent).toBe("1");
      expect(screen.getByRole("status", { name: "Chosen role" }).textContent).toBe("admin");
      expect(popup.isConnected).toBe(true);
      const outside = screen.getByRole("button", { name: "Outside menu" });
      fireEvent.keyDown(admin, { key: "Escape" });
      await waitFor(() => expect(popup.isConnected).toBe(false));

      const reopened = await openMenu(entry, false);
      fireEvent.keyDown(reopened, { key: "Escape" });
      await waitFor(() => expect(reopened.isConnected).toBe(false));
      if (surroundings !== MenuSurroundings.Listing)
        expect(screen.getByRole("dialog", { name: "Menu dialog" })).toBeTruthy();

      const last = await openMenu(entry, false);
      fireEvent.pointerDown(outside, { pointerType: "mouse", button: 0 });
      fireEvent.click(outside);
      await waitFor(() => expect(last.isConnected).toBe(false));
      expect(screen.getByRole("status", { name: "Outside presses" }).textContent).toBe("1");
    },
  );
}
