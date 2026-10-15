import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { IconProvider } from "../icons/registry/icon-provider";
import { Text, TextRole } from "../text";
import { TextField } from "../inputs/text-field";
import { Size } from "../types";
import { Button } from "../buttons/button";
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
      label: "Switch Project",
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
            label: "Switch Section",
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
  await page.getByRole("button", { name: "Switch Section menu", exact: true }).click();
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
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  const search = page.getByRole("combobox", { name: "Search switch project", exact: true });
  await search.fill("Project B");
  await expect
    .element(page.getByRole("option", { name: options[0].label, exact: true }))
    .not.toBeInTheDocument();
  await search.click();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect.poll(() => select.mock.calls).toEqual([["b"]]);
  await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
});

test("double-click renames; Enter commits once and Escape cancels", async () => {
  const rename = vi.fn();
  await render(<BreadcrumbTrail items={[item({ onRename: rename })]} />);
  await userEvent.dblClick(page.getByRole("combobox", { name: /^Switch Project:/ }));
  const field = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  await field.fill("New project name");
  await userEvent.keyboard("{Enter}");
  expect(rename).toHaveBeenCalledExactlyOnceWith("New project name");
  await userEvent.dblClick(page.getByRole("combobox", { name: /^Switch Project:/ }));
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
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  await page.getByRole("button", { name: "Rename", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  await field.fill("  New name  ");
  await page.getByRole("button", { name: "Outside", exact: true }).click();
  expect(rename).toHaveBeenCalledExactlyOnceWith("New name");
});

test("read-only crumbs offer no Rename; loading and empty search stay distinct", async () => {
  const current = item();
  current.switcher!.loading = true;
  const view = await render(<BreadcrumbTrail items={[current]} />);
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  await expect.element(page.getByRole("status")).toHaveTextContent("Loading…");
  await expect
    .element(page.getByRole("button", { name: "Rename", exact: true }))
    .not.toBeInTheDocument();
  current.switcher!.loading = false;
  await view.rerender(<BreadcrumbTrail items={[current]} />);
  await page.getByRole("combobox", { name: "Search switch project" }).fill("missing project");
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
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  const menu = page
    .getByRole("listbox")
    .element()
    .closest(".dropdown-content")!
    .getBoundingClientRect();
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
              label: "Switch Section",
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
    .element(page.getByRole("button", { name: "Switch Section menu", exact: true }))
    .toBeVisible();
  await expect.element(page.getByRole("combobox", { name: /^Switch Project:/ })).toBeVisible();
});

test("breadcrumb controls retain the toolbar button foreground treatment in dark mode", async () => {
  document.documentElement.classList.add("dark");
  try {
    await render(
      <>
        <Button visuals="inverted">Reference foreground</Button>
        <BreadcrumbTrail items={[item()]} />
      </>,
    );
    const rgba = (element: Element) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = getComputedStyle(element).color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    expect(rgba(page.getByRole("combobox", { name: /^Switch Project:/ }).element())).toEqual(
      rgba(page.getByText("Reference foreground", { exact: true }).element()),
    );
  } finally {
    document.documentElement.classList.remove("dark");
  }
});

test("grouped controls keep square shared corners and a stable rename footprint", async () => {
  await render(
    <BreadcrumbTrail
      items={[
        {
          id: "section",
          label: "Projects",
          href: "/projects",
          switcher: {
            label: "Switch Section",
            value: "projects",
            options: [],
            onSelect: vi.fn(),
          },
        },
        item({ onRename: vi.fn() }),
      ]}
    />,
  );
  const field = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  const display = page.getByRole("combobox", { name: /^Switch Project:/ });
  const before = display.element().getBoundingClientRect();
  const labelRange = document.createRange();
  labelRange.selectNodeContents(display.element().querySelector("span")!);
  const textLeft = labelRange.getBoundingClientRect().left;
  expect(
    page.getByRole("link", { name: "Projects", exact: true }).element().getBoundingClientRect()
      .height,
  ).toBe(before.height);
  expect(
    page
      .getByRole("button", { name: "Switch Section menu", exact: true })
      .element()
      .getBoundingClientRect().height,
  ).toBe(before.height);
  const sectionArrow = page
    .getByRole("button", { name: "Switch Section menu", exact: true })
    .element();
  const sectionRect = sectionArrow.getBoundingClientRect();
  const linkRect = page
    .getByRole("link", { name: "Projects", exact: true })
    .element()
    .getBoundingClientRect();
  expect(sectionRect.left - linkRect.right).toBe(2);
  expect(getComputedStyle(sectionArrow).borderTopLeftRadius).toBe("0px");
  expect(parseFloat(getComputedStyle(sectionArrow).borderTopRightRadius)).toBeGreaterThan(0);
  const iconRect = sectionArrow.querySelector("svg")!.getBoundingClientRect();
  expect(
    Math.abs(iconRect.left + iconRect.width / 2 - sectionRect.left - sectionRect.width / 2),
  ).toBeLessThan(0.5);
  expect(
    Math.abs(iconRect.top + iconRect.height / 2 - sectionRect.top - sectionRect.height / 2),
  ).toBeLessThan(0.5);
  const nav = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
  const trailBefore = nav.element().getBoundingClientRect();
  const arrow = page.getByRole("combobox", { name: /^Switch Project:/ });
  expect(arrow.element().getBoundingClientRect().height).toBe(before.height);

  await userEvent.dblClick(arrow);
  const after = field.element().getBoundingClientRect();
  const inputStyle = getComputedStyle(field.element());
  const editingTextLeft =
    after.left + parseFloat(inputStyle.paddingLeft) + parseFloat(inputStyle.borderLeftWidth);
  expect(Math.abs(editingTextLeft - textLeft)).toBeLessThan(0.5);
  expect(after.width).toBeLessThan(before.width);
  expect(after.height).toBe(before.height);
  expect(nav.element().getBoundingClientRect().width).toBe(trailBefore.width);
  expect(nav.element().getBoundingClientRect().height).toBe(trailBefore.height);
  await field.fill("A much longer name typed while editing");
  expect(field.element().getBoundingClientRect().width).toBe(after.width);
  await userEvent.keyboard("{Escape}");
});

test("sibling and action icons resolve through the consumer's registry", async () => {
  const current = item({ onRename: vi.fn(), renameIcon: "project" });
  current.switcher!.options = [{ value: "a", label: "Project A", icon: "project" }];
  current.switcher!.browse = { label: "All projects", icon: "project", onSelect: vi.fn() };
  await render(
    <IconProvider
      registry={{
        project: () => (
          <svg data-testid="consumer-project-icon" viewBox="0 0 24 24">
            <path d="M2 2h20v20H2z" />
          </svg>
        ),
      }}
    >
      <BreadcrumbTrail items={[current]} />
    </IconProvider>,
  );
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  expect(page.getByRole("separator").elements()).toHaveLength(2);
  for (const row of [
    page.getByRole("option", { name: "Project A", exact: true }),
    page.getByRole("button", { name: "Rename", exact: true }),
    page.getByRole("button", { name: "All projects", exact: true }),
  ]) {
    expect(row.element().querySelector('[data-testid="consumer-project-icon"]')).not.toBeNull();
  }
});

test("reserved section labels keep the same split-control width on listings and details", async () => {
  const section = (label: string): BreadcrumbTrailItem => ({
    id: "section",
    label,
    labelWidth: 112,
    href: "/projects",
    switcher: { label: "Switch Section", value: label, options: [], onSelect: vi.fn() },
  });
  const view = await render(<BreadcrumbTrail items={[section("Home")]} />);
  for (const name of ["Home", "Projects", "Assets", "Devices", "Organizations"]) {
    await view.rerender(<BreadcrumbTrail items={[section(name)]} />);
    const label = page
      .getByRole("button", { name: `Switch Section: ${name}`, exact: true })
      .element()
      .getBoundingClientRect();
    const arrow = page
      .getByRole("button", { name: "Switch Section menu", exact: true })
      .element()
      .getBoundingClientRect();
    expect(label.width).toBe(112);
    expect(arrow.left - label.right).toBe(2);
    expect(arrow.width).toBe(28);
  }
  await view.rerender(
    <BreadcrumbTrail items={[section("Projects"), item({ onRename: vi.fn() })]} />,
  );
  expect(
    page.getByRole("link", { name: "Projects", exact: true }).element().getBoundingClientRect()
      .width,
  ).toBe(112);
});

test("consumers can hide Rename while retaining double-click editing", async () => {
  const rename = vi.fn();
  await render(<BreadcrumbTrail items={[item({ onRename: rename, showRenameAction: false })]} />);
  const trigger = page.getByRole("combobox", { name: /^Switch Project:/ });
  await trigger.click();
  await expect
    .element(page.getByRole("button", { name: "Rename", exact: true }))
    .not.toBeInTheDocument();
  const search = page.getByRole("combobox", { name: "Search switch project" }).element();
  const separator = document.querySelector('[role="separator"]')!;
  const label = page.getByText("Switch Project", { exact: true }).element();
  const gapAbove = search.getBoundingClientRect().top - label.getBoundingClientRect().bottom;
  const gapBelow = separator.getBoundingClientRect().top - search.getBoundingClientRect().bottom;
  expect(Math.abs(gapAbove - 8)).toBeLessThan(0.5);
  expect(Math.abs(gapBelow - 8)).toBeLessThan(0.5);
  await userEvent.keyboard("{Escape}");
  await userEvent.dblClick(trigger);
  await page.getByRole("textbox", { name: "Rename Project A", exact: true }).fill("Project C");
  await userEvent.keyboard("{Enter}");
  expect(rename).toHaveBeenCalledExactlyOnceWith("Project C");
});

test.each([false, true])(
  "toolbar segments preserve exposed ends with an extra wrapper: %s",
  async (wrapped) => {
    const controls = (
      <div className="toolbar-segments flex">
        <Button altText="First facet">First</Button>
        <Button altText="Last facet">Last</Button>
      </div>
    );
    await render(
      <div className="toolbar-segments flex">
        <div>
          <input aria-label="Toolbar search" className="rounded-xs" />
        </div>
        {wrapped ? <div>{controls}</div> : controls}
      </div>,
    );
    const input = page.getByRole("textbox", { name: "Toolbar search" }).element();
    const first = page.getByRole("button", { name: "First facet" }).element();
    const last = page.getByRole("button", { name: "Last facet" }).element();
    expect(getComputedStyle(input).borderTopLeftRadius).not.toBe("0px");
    expect(getComputedStyle(input).borderTopRightRadius).toBe("0px");
    expect(getComputedStyle(first).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(first).borderTopRightRadius).toBe("0px");
    expect(getComputedStyle(last).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(last).borderTopRightRadius).not.toBe("0px");
    expect(first.getBoundingClientRect().left - input.getBoundingClientRect().right).toBe(2);
    expect(last.getBoundingClientRect().left - first.getBoundingClientRect().right).toBe(2);
  },
);

test("project choices have equal spacing between their surrounding dividers", async () => {
  const current = item();
  current.switcher!.browse = { label: "View All Projects", onSelect: vi.fn() };
  await render(<BreadcrumbTrail items={[current]} />);
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  const separators = Array.from(document.querySelectorAll('[role="separator"]'));
  const rows = page.getByRole("option").elements();
  const above = rows[0].getBoundingClientRect().top - separators[0].getBoundingClientRect().bottom;
  const below =
    separators[1].getBoundingClientRect().top -
    rows[rows.length - 1].getBoundingClientRect().bottom;
  expect(Math.abs(above - 5)).toBeLessThan(0.5);
  expect(Math.abs(below - above)).toBeLessThan(0.5);
});

test("pointer movement keeps typing focus in project search", async () => {
  await render(<BreadcrumbTrail items={[item()]} />);
  await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
  const input = page.getByRole("combobox", { name: "Search switch project" });
  await input.fill("Project");
  await page.getByRole("option", { name: "Project B · @team", exact: true }).hover();
  await expect.element(input).toHaveFocus();
  await userEvent.keyboard(" B");
  await expect.element(input).toHaveValue("Project B");
  await expect
    .element(page.getByRole("option", { name: "Project A · You", exact: true }))
    .not.toBeInTheDocument();
});

test("F2 exposes renaming from a semantic trigger without a dormant text input", async () => {
  const rename = vi.fn();
  await render(<BreadcrumbTrail items={[item({ onRename: rename, showRenameAction: false })]} />);
  await expect
    .element(page.getByRole("textbox", { name: "Rename Project A", exact: true }))
    .not.toBeInTheDocument();
  const trigger = page.getByRole("combobox", { name: /^Switch Project:/ });
  trigger.element().focus();
  await userEvent.keyboard("{F2}");
  const input = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  await input.fill("Keyboard rename");
  await userEvent.keyboard("{Enter}");
  expect(rename).toHaveBeenCalledExactlyOnceWith("Keyboard rename");
});

test("project picker uses themed text, a compact search and highlighted footer actions", async () => {
  document.documentElement.classList.add("dark");
  try {
    const current = item();
    current.switcher!.browse = { label: "View All Projects", onSelect: vi.fn() };
    await render(
      <>
        <Text role={TextRole.Value}>Reference title</Text>
        <TextField size={Size.Sm} aria-label="Reference input" />
        <BreadcrumbTrail items={[current]} />
      </>,
    );
    await page.getByRole("combobox", { name: /^Switch Project:/ }).click();
    const title = page.getByText("Switch Project", { exact: true }).element();
    expect(getComputedStyle(title).color).toBe(
      getComputedStyle(page.getByText("Reference title").element()).color,
    );
    const search = page.getByRole("combobox", { name: "Search switch project" }).element();
    await expect
      .poll(() => Math.round(search.getBoundingClientRect().height))
      .toBe(
        Math.round(
          page.getByRole("textbox", { name: "Reference input" }).element().getBoundingClientRect()
            .height,
        ),
      );
    const browse = page.getByRole("button", { name: "View All Projects" });
    const list = page.getByRole("listbox", { name: "Switch Project" }).element();
    await expect
      .poll(() =>
        Math.abs(
          browse.element().getBoundingClientRect().width - list.getBoundingClientRect().width,
        ),
      )
      .toBeLessThan(1);
    const popup = browse.element().closest(".dropdown-content")!;
    expect(getComputedStyle(popup).animationName).toBe("slideUpAndFade");
    expect(getComputedStyle(popup).animationDuration).toBe("0.3s");
    const rest = getComputedStyle(browse.element()).backgroundColor;
    await browse.hover();
    await expect.poll(() => getComputedStyle(browse.element()).backgroundColor).not.toBe(rest);
    browse.element().focus();
    await expect.element(browse).toHaveAttribute("data-highlighted");
  } finally {
    document.documentElement.classList.remove("dark");
  }
});

test("editable sibling controls can switch and rename without search enabled", async () => {
  const rename = vi.fn();
  const select = vi.fn();
  const current = item({ onRename: rename });
  current.switcher!.searchable = false;
  current.switcher!.onSelect = select;
  await render(<BreadcrumbTrail items={[current]} />);
  const trigger = page.getByRole("combobox", { name: /^Switch Project:/ });
  await trigger.click();
  await expect.element(page.getByRole("listbox")).toBeVisible();
  await expect
    .element(page.getByRole("combobox", { name: "Search switch project" }))
    .not.toBeInTheDocument();
  await page.getByRole("option", { name: "Project B · @team", exact: true }).click();
  await expect.poll(() => select.mock.calls).toEqual([["b"]]);
  await userEvent.dblClick(trigger);
  const input = page.getByRole("textbox", { name: "Rename Project A", exact: true });
  await expect.element(input).toBeVisible();
  await input.fill("Renamed without search");
  await userEvent.keyboard("{Enter}");
  expect(rename).toHaveBeenCalledExactlyOnceWith("Renamed without search");
});
