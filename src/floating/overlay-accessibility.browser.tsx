import { StrictMode } from "react";
import { beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import {
  DialogSurface,
  OverlayAccessibilityFixture,
  OverlayEntry,
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

async function openMenu(entry: OverlayEntry, select = true) {
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  if (entry === OverlayEntry.ContextMenu || entry === OverlayEntry.ContextSubmenu) {
    await trigger.click({ button: "right" });
  } else {
    await trigger.click();
  }
  if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
    const submenu = page.getByRole("menuitem", { name: "Create", exact: true });
    await submenu.hover();
    await expect.element(submenu).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(submenu).toHaveAttribute("aria-expanded", "true");
  }
  const role = entry === OverlayEntry.Popover ? "button" : "menuitem";
  const item = page.getByRole(role, { name: "New entity", exact: true });
  await expect.element(item).toBeVisible();
  if (select) await item.click();
  return item;
}

async function showDialogContents(surface: DialogSurface) {
  await expect.element(page.getByRole("dialog", { name: "Add Entity" })).toBeVisible();
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
  await expect.element(page.getByRole("dialog", { name: "Add Entity" })).toBeVisible();
  await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect.poll(() => container.getAttribute("aria-hidden")).toBeNull();
  await expect.element(page.getByRole("button", { name: "Scene row" })).toBeVisible();
  await page.getByRole("button", { name: "Scene row" }).click();
  await expect.element(page.getByRole("button", { name: "Scene row" })).toHaveFocus();
}

for (const surface of Object.values(DialogSurface)) {
  test.each(Object.values(OverlayEntry))(
    `%s → ${surface} restores the accessible app`,
    async (entry) => {
      const { container } = await render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} />
        </StrictMode>,
      );
      await openMenu(entry);
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

  test.each(Object.values(OverlayEntry))(
    `${surface} → %s → inner modal restores each dialog's background after closing`,
    async (entry) => {
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
            .getByRole("dialog", { name: "Add Entity" })
            .element()
            .contains(document.activeElement),
        )
        .toBe(true);
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
      await expect.element(page.getByRole("button", { name: "Outer dialog action" })).toBeVisible();
      const item = await openMenu(entry, false);
      await expect.element(page.getByRole("button", { name: "Outer dialog action" })).toBeVisible();
      await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      await item.click();
      await expect
        .element(page.getByRole("dialog", { name: "New Entity", exact: true }))
        .toBeVisible();
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Outer dialog action" }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole("dialog", { name: "Add Entity", exact: true }))
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
        .element(page.getByRole("dialog", { name: "Add Entity", exact: true }))
        .toBeVisible();
      await expect.element(page.getByRole("button", { name: "Outer dialog action" })).toBeVisible();
      await expect.poll(() => container.getAttribute("aria-hidden")).toBe("true");
      await expect.element(page.getByRole("button", { name: "Scene row" })).not.toBeInTheDocument();
      await pickModelAndClose(container, surface);
    },
  );
}

test.each([OverlayEntry.Dropdown, OverlayEntry.ContextMenu, OverlayEntry.CanvasMenu])(
  "%s dismisses and runs the background action on the first outside click",
  async (entry) => {
    await render(<OverlayAccessibilityFixture entry={entry} />);
    await openMenu(entry, false);
    await expect.element(page.getByRole("menu")).toBeVisible();
    await expect
      .element(page.getByRole("status", { name: "Scene actions" }))
      .toHaveTextContent("0");
    const row = page.getByRole("button", { name: "Scene row", exact: true });
    await expect
      .poll(() => {
        const element = row.element();
        const rect = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2),
        );
      })
      .toBe(true);
    await row.click();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    await expect
      .element(page.getByRole("status", { name: "Scene actions" }))
      .toHaveTextContent("1");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  },
);

test("dropdown keyboard navigation, Escape dismissal and focus restoration", async () => {
  await render(<OverlayAccessibilityFixture />);
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  await trigger.click();
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveFocus();
  await userEvent.keyboard("{Enter}{ArrowDown}");
  await expect.element(page.getByRole("menuitem", { name: "New entity" })).toHaveFocus();
  await expect.element(page.getByRole("button", { name: "Scene row" })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
});
