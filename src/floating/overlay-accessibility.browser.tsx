import { StrictMode } from "react";
import { beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import {
  DialogSurface,
  OverlayAccessibilityFixture,
  OverlayEntry,
  MENU_ENTRIES,
  OVERLAY_SELECTION_CASES,
  MenuSurroundings,
  MenuUsabilityFixture,
} from "./overlay-accessibility.fixture";

beforeEach(async () => {
  // Sidebar panels and Radix submenus render only in the desktop layout.
  await page.viewport(1280, 800);
  await expect
    .poll(() => {
      const breakpoint = getComputedStyle(document.documentElement)
        .getPropertyValue("--breakpoint-md")
        .trim();
      return window.matchMedia(`(min-width: ${breakpoint || "48rem"})`).matches;
    })
    .toBe(true);
});

async function openMenu(
  entry: OverlayEntry,
  select: boolean | "keyboard" = true,
  afterOpen?: () => Promise<void>,
) {
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  if (entry === OverlayEntry.ContextMenu || entry === OverlayEntry.ContextSubmenu) {
    await trigger.click({ button: "right" });
  } else {
    await trigger.click();
  }
  if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
    const submenu = page.getByRole("menuitem", { name: "Create", exact: true });
    await expect.element(submenu).toBeVisible();
    await submenu.hover();
    await expect.element(submenu).toHaveFocus();
    // Finish the pointer-open timer before keyboard navigation can close the submenu.
    await expect.element(submenu).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowRight}");
  }
  const role = entry === OverlayEntry.Popover ? "button" : "menuitem";
  const item = page.getByRole(role, { name: "New entity", exact: true });
  await expect.element(item).toBeVisible();
  await afterOpen?.();
  if (select === "keyboard") {
    await item.hover();
    await expect.element(item).toHaveFocus();
    await userEvent.keyboard("{Enter}");
  } else if (select) await item.click();
  return item;
}

async function showDialogContents(surface: DialogSurface) {
  await expect
    .element(
      page.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
        name: "Add Entity",
      }),
    )
    .toBeVisible();
  if (surface === DialogSurface.Sidebar) {
    await page.getByRole("tab", { name: "Assets", exact: true }).click();
    const panel = page.getByRole("tabpanel", { name: "Assets", exact: true });
    await expect.element(panel).toBeVisible();
    await expect.element(panel).not.toHaveAttribute("inert");
  }
}

async function pickModelAndClose(container: HTMLElement, surface: DialogSurface) {
  await showDialogContents(surface);
  await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
  await page.getByRole("button", { name: "Toggle options", exact: true }).click();
  await page.getByRole("option", { name: "Model", exact: true }).click();
  await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
  await expect
    .element(
      page.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
        name: "Add Entity",
      }),
    )
    .toBeVisible();
  await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect
    .element(page.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog"))
    .not.toBeInTheDocument();
  await expect.poll(() => container.getAttribute("aria-hidden")).toBeNull();
  await expect.poll(() => container.closest("[inert]")).toBeNull();
  await expect.element(page.getByRole("button", { name: "Scene row" })).toBeVisible();
  await page.getByRole("button", { name: "Scene row" }).click();
  await expect.element(page.getByRole("button", { name: "Scene row" })).toHaveFocus();
}

for (const surface of Object.values(DialogSurface)) {
  test.each(OVERLAY_SELECTION_CASES)(
    `%s (%s) → ${surface} restores the accessible app`,
    async (entry, method) => {
      const { container } = await render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} />
        </StrictMode>,
      );
      await openMenu(entry, method === "keyboard" ? "keyboard" : true);
      await pickModelAndClose(container, surface);
    },
  );

  test(`direct ${surface} restores the accessible app`, async () => {
    const { container } = await render(
      <StrictMode>
        <OverlayAccessibilityFixture surface={surface} />
      </StrictMode>,
    );
    await page.getByRole("button", { name: "Direct dialog" }).click();
    await pickModelAndClose(container, surface);
  });

  test.each(OVERLAY_SELECTION_CASES)(
    `${surface} → %s (%s) → inner modal restores each dialog's background after closing`,
    async (entry, method) => {
      const { container } = await render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} inside />
        </StrictMode>,
      );
      await page.getByRole("button", { name: "Direct dialog" }).click();
      await showDialogContents(surface);
      await expect
        .poll(() =>
          page
            .getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
              name: "Add Entity",
              exact: true,
            })
            .element()
            .contains(document.activeElement),
        )
        .toBe(true);
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
      await expect.element(page.getByRole("button", { name: "Outer dialog action" })).toBeVisible();
      const item = await openMenu(entry, false);
      if (entry === OverlayEntry.Popover) {
        await expect
          .element(page.getByRole("button", { name: "Outer dialog action" }))
          .toBeVisible();
      } else {
        await expect
          .element(page.getByRole("button", { name: "Outer dialog action" }))
          .not.toBeInTheDocument();
      }
      await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      if (method === "keyboard") {
        await item.hover();
        await expect.element(item).toHaveFocus();
        await userEvent.keyboard("{Enter}");
      } else await item.click();
      await expect
        .element(page.getByRole("dialog", { name: "New Entity", exact: true }))
        .toBeVisible();
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Outer dialog action" }))
        .not.toBeInTheDocument();
      await expect
        .element(
          page.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
            name: "Add Entity",
            exact: true,
          }),
        )
        .not.toBeInTheDocument();
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      await page.getByRole("button", { name: "Toggle options", exact: true }).click();
      await page.getByRole("option", { name: "Model", exact: true }).click();
      await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
      await page.getByRole("button", { name: "Create", exact: true }).click();
      await expect
        .element(page.getByRole("dialog", { name: "New Entity", exact: true }))
        .not.toBeInTheDocument();
      await expect
        .element(
          page.getByRole(surface === DialogSurface.Dialog ? "alertdialog" : "dialog", {
            name: "Add Entity",
            exact: true,
          }),
        )
        .toBeVisible();
      await expect.element(page.getByRole("button", { name: "Outer dialog action" })).toBeVisible();
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
      await pickModelAndClose(container, surface);
    },
  );
}

for (const surroundings of Object.values(MenuSurroundings)) {
  test.each(MENU_ENTRIES)(
    `${surroundings}: %s stays usable through focus moves, click, keyboard, Escape and outside press`,
    async (entry) => {
      await render(
        <StrictMode>
          <MenuUsabilityFixture entry={entry} surroundings={surroundings} />
        </StrictMode>,
      );
      if (surroundings === MenuSurroundings.Sidebar)
        await page.getByRole("tab", { name: "Menu tab", exact: true }).click();
      const outside = page.getByRole("button", { name: "Outside menu", exact: true });
      await expect.element(outside).toBeVisible();
      const outsideElement = outside.element();
      const focusTarget =
        surroundings === MenuSurroundings.Listing
          ? page.getByRole("option", { name: "Second row", exact: true }).element()
          : outside.element();
      if (surroundings === MenuSurroundings.Listing) {
        await page.getByRole("option", { name: "First row", exact: true }).click();
        await userEvent.keyboard("{ArrowDown}");
        await expect.element(focusTarget).toHaveFocus();
      }
      let item = await openMenu(entry, false, async () => {
        if (surroundings === MenuSurroundings.Listing) {
          // A queued list navigation handler may deliver focus after a menu opens.
          focusTarget.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }),
          );
        } else focusTarget.focus();
        const submenu =
          entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu;
        const menu = page.getByRole("menu", submenu ? { name: "Create", exact: true } : undefined);
        // ArrowLeft closes a submenu only when focus has reached that submenu.
        await expect.poll(() => menu.element().contains(document.activeElement)).toBe(true);
      });
      await expect.element(item).toBeVisible();
      if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
        // The focus trap must restore the submenu before its closing key is dispatched.
        await expect.element(item).toHaveFocus();
        await userEvent.keyboard("{ArrowLeft}");
        await expect
          .element(page.getByRole("menuitem", { name: "Create", exact: true }))
          .toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        item = page.getByRole("menuitem", { name: "New entity", exact: true });
        await expect.element(item).toBeVisible();
      }
      await page.getByRole("menuitem", { name: "Keep menu open", exact: true }).click();
      await expect.element(item).toBeVisible();
      await item.click();
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      await expect.element(page.getByRole("status", { name: "Selections" })).toHaveTextContent("1");
      await expect.element(page.getByRole("status", { name: "Kept open" })).toHaveTextContent("1");

      item = await openMenu(entry, false);
      await item.hover();
      await expect.element(item).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      await expect
        .element(page.getByRole("menuitem", { name: "Keep menu open", exact: true }))
        .toHaveFocus();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(item).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      await expect.element(page.getByRole("status", { name: "Selections" })).toHaveTextContent("2");

      await openMenu(entry, false);
      await page.getByRole("menuitemradio", { name: "Admin", exact: true }).click();
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("status", { name: "Chosen role" }))
        .toHaveTextContent("admin");

      item = await openMenu(entry, false);
      await item.hover();
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      if (entry === OverlayEntry.Dropdown || entry === OverlayEntry.DropdownSubmenu) {
        await expect
          .element(page.getByRole("button", { name: "Open menu", exact: true }))
          .toHaveFocus();
      }
      if (surroundings !== MenuSurroundings.Listing)
        await expect.element(page.getByRole("dialog", { name: "Menu dialog" })).toBeVisible();

      await openMenu(entry, false);
      const rect = outsideElement.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      expect(hit).not.toBeNull();
      expect(hit?.closest('[role="menu"]')).toBeNull();
      // Skip Playwright's receives-events check for the pointer-locked button;
      // Chromium still hit-tests its centre and sends the native pointerdown outside.
      await userEvent.click(outsideElement, { force: true });
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    },
  );
}
