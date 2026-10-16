import { useEffect } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { UiStoreProvider } from "../../context/ui-store-provider";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { PaneRegion } from "../../types";
import { LayoutRoot } from "./root";
import "../../test-stylesheet";

afterEach(async () => {
  await cleanup();
});

function Actions({ run, blocked = false }: { run: () => void; blocked?: boolean }) {
  const { setActionItems, setPanes } = useLayoutActions();
  useEffect(() => {
    setActionItems(
      [
        { id: "direct", label: "Account action", left: "user", onClick: run, disabled: blocked },
        {
          id: "settings",
          label: "Preferences",
          left: "action-placeholder",
          children: [{ id: "setting", type: "item", children: "A setting" }],
        },
      ],
      true,
    );
    setPanes(
      [
        {
          id: "home",
          name: "Home",
          icon: "home",
          clickFn: () => {
            run();
            return Promise.resolve(false);
          },
        },
        {
          id: "scene",
          name: "Scene",
          icon: "home",
          region: PaneRegion.Left,
          size: "240px",
          content: <p>Current scene tools</p>,
        },
      ],
      true,
    );
  }, [setActionItems, setPanes, run, blocked]);
  return null;
}
async function show(run: () => void, blocked = false) {
  await render(
    <UiStoreProvider>
      <Actions run={run} blocked={blocked} />
      <LayoutRoot homeText="Workspace" />
    </UiStoreProvider>,
  );
}

test("desktop footer direct actions precede menus and execute without a dropdown", async () => {
  await page.viewport(1280, 800);
  const run = vi.fn();
  await show(run);
  const direct = page.getByRole("button", { name: "Account action", exact: true });
  const settings = page.getByRole("button", { name: "Preferences", exact: true });
  expect(direct.element().getBoundingClientRect().top).toBeLessThan(
    settings.element().getBoundingClientRect().top,
  );
  await direct.click();
  expect(run).toHaveBeenCalledOnce();
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await settings.click();
  await expect
    .element(page.getByRole("menuitem", { name: "A setting", exact: true }))
    .toBeVisible();
});

test("disabled desktop footer actions are native disabled controls", async () => {
  await page.viewport(1280, 800);
  await show(vi.fn(), true);
  await expect
    .element(page.getByRole("button", { name: "Account action", exact: true }))
    .toBeDisabled();
});

test("mobile exposes the direct action in its menu without an extra submenu", async () => {
  await page.viewport(390, 800);
  const run = vi.fn();
  await show(run);
  await page.getByRole("button", { name: "Toggle Menu", exact: true }).click();
  await page.getByRole("menuitem", { name: "Account action", exact: true }).click();
  expect(run).toHaveBeenCalledOnce();
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
});

test("a navigation callback returning false keeps the current pane open", async () => {
  await page.viewport(1280, 800);
  const run = vi.fn();
  await show(run);
  await expect.element(page.getByText("Current scene tools", { exact: true })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Home", exact: true })
    .click();
  expect(run).toHaveBeenCalledOnce();
  await expect.element(page.getByText("Current scene tools", { exact: true })).toBeVisible();
});

test("context-menu navigation also preserves the current pane when its callback returns false", async () => {
  await page.viewport(1280, 800);
  const run = vi.fn();
  await show(run);
  await page.getByRole("navigation", { name: "Main navigation" }).click({ button: "right" });
  await page.getByRole("menuitemradio", { name: "Home", exact: true }).click();
  expect(run).toHaveBeenCalledOnce();
  await expect.element(page.getByText("Current scene tools", { exact: true })).toBeVisible();
});
