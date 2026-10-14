import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { Breadcrumbs } from "./breadcrumbs";
import { BreadcrumbTrail, type BreadcrumbTrailItem } from "./breadcrumb-trail";
import "../test-stylesheet";

beforeEach(async () => {
  await page.viewport(1280, 800);
});
afterEach(cleanup);
const options = [
  { value: "a", label: "Project A · You" },
  { value: "b", label: "Project B · @team" },
];
function item(overrides: Partial<BreadcrumbTrailItem> = {}): BreadcrumbTrailItem {
  return {
    id: "project",
    label: "Project A",
    switcher: {
      label: "Switch project",
      value: "a",
      options,
      onSelect: vi.fn(),
      searchable: true,
    },
    ...overrides,
  };
}

test("ancestor navigation and sibling switching have separate controls", async () => {
  const navigate = vi.fn();
  const select = vi.fn();
  await render(
    <BreadcrumbTrail
      items={[
        {
          id: "section",
          label: "Projects",
          href: "/projects",
          onNavigate: navigate,
          switcher: {
            label: "Switch section",
            value: "/projects",
            onSelect: select,
            options: [
              { value: "/projects", label: "Projects" },
              { value: "/assets", label: "Assets" },
            ],
          },
        },
        item(),
      ]}
    />,
  );
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  expect(navigate).toHaveBeenCalledOnce();
  await page.getByRole("button", { name: "Switch section menu", exact: true }).click();
  await expect
    .element(page.getByRole("menuitemradio", { name: "Projects", exact: true }))
    .toHaveAttribute("aria-checked", "true");
  await page.getByRole("menuitemradio", { name: "Assets", exact: true }).click();
  expect(select).toHaveBeenCalledWith("/assets");
  expect(navigate).toHaveBeenCalledOnce();
});

test("project switcher searches and selects with the keyboard", async () => {
  const select = vi.fn();
  const current = item();
  current.switcher!.onSelect = select;
  await render(<BreadcrumbTrail items={[current]} />);
  await page.getByRole("button", { name: /^Switch project:/ }).click();
  const search = page.getByRole("textbox", { name: "Search switch project", exact: true });
  await search.fill("Project B");
  await expect
    .element(page.getByRole("menuitemradio", { name: options[0].label, exact: true }))
    .not.toBeInTheDocument();
  await search.click();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(select).toHaveBeenCalledWith("b");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
});

test("double-click renames; Enter commits once and Escape cancels", async () => {
  const rename = vi.fn();
  await render(<BreadcrumbTrail items={[item({ onRename: rename })]} />);
  await userEvent.dblClick(page.getByRole("button", { name: /^Switch project:/ }));
  const field = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  await field.fill("New project name");
  await userEvent.keyboard("{Enter}");
  expect(rename).toHaveBeenCalledExactlyOnceWith("New project name");
  await userEvent.dblClick(page.getByRole("button", { name: /^Switch project:/ }));
  await field.fill("Discard this");
  await userEvent.keyboard("{Escape}");
  expect(rename).toHaveBeenCalledOnce();
});

test("Rename menu action supports touch and blur commits", async () => {
  const rename = vi.fn();
  await render(
    <>
      <BreadcrumbTrail items={[item({ onRename: rename })]} />
      <button type="button">Outside</button>
    </>,
  );
  await page.getByRole("button", { name: /^Switch project:/ }).click();
  await page.getByRole("menuitem", { name: "Rename", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  await field.fill("  New name  ");
  await page.getByRole("button", { name: "Outside", exact: true }).click();
  expect(rename).toHaveBeenCalledExactlyOnceWith("New name");
});

test("read-only crumbs offer no Rename; loading and empty search stay distinct", async () => {
  const current = item();
  current.switcher!.loading = true;
  const view = await render(<BreadcrumbTrail items={[current]} />);
  await page.getByRole("button", { name: /^Switch project:/ }).click();
  await expect.element(page.getByRole("status")).toHaveTextContent("Loading…");
  await expect
    .element(page.getByRole("menuitem", { name: "Rename", exact: true }))
    .not.toBeInTheDocument();
  current.switcher!.loading = false;
  await view.rerender(<BreadcrumbTrail items={[current]} />);
  await page.getByRole("textbox").fill("missing project");
  await expect.element(page.getByRole("status")).toHaveTextContent("No matches");
});

test("a long breadcrumb fits a mobile viewport", async () => {
  await page.viewport(360, 740);
  await render(
    <div style={{ width: 328 }}>
      <BreadcrumbTrail
        items={[
          { id: "projects", label: "Projects", href: "/projects" },
          item({ label: "An exceptionally long project name that must fit a narrow phone" }),
        ]}
      />
    </div>,
  );
  const nav = page.getByRole("navigation", { name: "Breadcrumb", exact: true }).element();
  expect(nav.getBoundingClientRect().width).toBeLessThanOrEqual(328);
  expect(nav.scrollWidth).toBeLessThanOrEqual(328);
  await page.getByRole("button", { name: /^Switch project:/ }).click();
  const menu = page.getByRole("menu").element().getBoundingClientRect();
  expect(menu.left).toBeGreaterThanOrEqual(0);
  expect(menu.right).toBeLessThanOrEqual(360);
});

test("mobile collapses an ancestor menu and keeps the current label available", async () => {
  await page.viewport(360, 740);
  await render(
    <div style={{ width: 328 }}>
      <BreadcrumbTrail
        items={[
          {
            id: "section",
            label: "Projects",
            href: "/projects",
            switcher: {
              label: "Switch section",
              value: "projects",
              options: [{ value: "projects", label: "Projects" }],
              onSelect: vi.fn(),
            },
          },
          item(),
        ]}
      />
    </div>,
  );
  await expect
    .element(page.getByRole("link", { name: "Projects", exact: true }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole("button", { name: "Switch section menu", exact: true }))
    .toBeVisible();
  await expect.element(page.getByRole("button", { name: /^Switch project:/ })).toBeVisible();
});

test("breadcrumb labels retain the shared foreground treatment in dark mode", async () => {
  document.documentElement.classList.add("dark");
  try {
    await render(
      <>
        <Breadcrumbs
          values={{ reference: "shown" }}
          elements={[
            { id: "reference", type: "static", render: () => <span>Reference foreground</span> },
          ]}
        />
        <BreadcrumbTrail items={[item()]} />
      </>,
    );
    const reference = getComputedStyle(
      page.getByText("Reference foreground", { exact: true }).element(),
    ).color;
    expect(
      getComputedStyle(page.getByRole("button", { name: /^Switch project:/ }).element()).color,
    ).toBe(reference);
  } finally {
    document.documentElement.classList.remove("dark");
  }
});
