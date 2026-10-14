import { StrictMode } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import {
  DialogSurface,
  OverlayAccessibilityFixture,
  OverlayEntry,
} from "./overlay-accessibility.fixture";

async function openMenu(entry: OverlayEntry) {
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  if (entry === OverlayEntry.ContextMenu || entry === OverlayEntry.ContextSubmenu) {
    await trigger.click({ button: "right" });
  } else {
    await trigger.click();
  }
  if (entry === OverlayEntry.DropdownSubmenu || entry === OverlayEntry.ContextSubmenu) {
    await page.getByRole("menuitem", { name: "Create", exact: true }).hover();
  }
  const role = entry === OverlayEntry.Popover ? "button" : "menuitem";
  await page.getByRole(role, { name: "New entity", exact: true }).click();
}

async function pickModelAndClose(container: HTMLElement) {
  await expect.element(page.getByRole("dialog", { name: "Add Entity" })).toBeVisible();
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
      await pickModelAndClose(container);
    },
  );

  test(`direct ${surface} restores the accessible app`, async () => {
    const { container } = await render(
      <StrictMode>
        <OverlayAccessibilityFixture surface={surface} />
      </StrictMode>,
    );
    await page.getByRole("button", { name: "Direct dialog" }).click();
    await pickModelAndClose(container);
  });

  test.each(Object.values(OverlayEntry))(
    `${surface} → %s retains dialog isolation`,
    async (entry) => {
      const { container } = await render(
        <StrictMode>
          <OverlayAccessibilityFixture entry={entry} surface={surface} inside />
        </StrictMode>,
      );
      await page.getByRole("button", { name: "Direct dialog" }).click();
      await expect
        .poll(() =>
          page
            .getByRole("dialog", { name: "Add Entity" })
            .element()
            .contains(document.activeElement),
        )
        .toBe(true);
      await openMenu(entry);
      await pickModelAndClose(container);
    },
  );
}

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
