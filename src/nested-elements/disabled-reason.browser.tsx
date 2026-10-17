import { useState } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
// The real compiled stylesheet: one test here asserts colours, and without it every row
// measures the default black and the assertion could only agree with itself.
import "../test-stylesheet";
import { Dropdown } from "../floating/dropdown";
import { ContextMenu } from "../floating/context-menu";
import { Select } from "../floating/select";
import { NestedItem } from "./item";

/**
 * A disabled menu entry that carries a reason is reachable by keyboard and states its
 * reason to assistive technology, while staying inert.
 *
 * The reason used to be reachable only by hovering: Radix drops a `disabled` item from
 * its roving focus order, so arrow keys skipped it and its tooltip never opened. Each
 * case below pairs the reachable entry with an UNEXPLAINED disabled entry, which must
 * still be skipped; that control is what tells a working rule apart from one that made
 * every disabled entry focusable.
 */

const REASON = "View only: ask its owner for Editor access";

const settle = async (frames = 4) => {
  for (let i = 0; i < frames; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

const focusedText = () => (document.activeElement as HTMLElement | null)?.textContent?.trim();

/** Walks the open menu with ArrowDown and records which entries took focus. */
async function walk(steps: number) {
  const seen = [focusedText()];
  for (let i = 0; i < steps; i++) {
    await userEvent.keyboard("{ArrowDown}");
    await settle();
    seen.push(focusedText());
  }
  return seen;
}

function ItemMenuContent({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <NestedItem left="search" onClick={() => undefined}>
        Open
      </NestedItem>
      <NestedItem left="search" disabled description={REASON} onClick={onEdit}>
        Edit
      </NestedItem>
      <NestedItem disabled onClick={onDelete}>
        Delete
      </NestedItem>
      <NestedItem onClick={() => undefined}>Duplicate</NestedItem>
    </>
  );
}

async function expectReachableAndInert(onEdit: ReturnType<typeof vi.fn>) {
  const seen = await walk(2);
  // The described entry takes focus; the undescribed one is skipped.
  expect(seen).toEqual(["Open", "Edit", "Duplicate"]);

  await userEvent.keyboard("{ArrowUp}");
  await settle();
  const edit = page.getByRole("menuitem", { name: "Edit" });
  await expect.element(edit).toHaveFocus();
  await expect.element(edit).toHaveAttribute("aria-disabled", "true");
  await expect.element(edit).toHaveAccessibleDescription(REASON);
  // The name stays the label: the reason is a description, not part of the name.
  await expect.element(edit).toHaveAccessibleName("Edit");

  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  await settle();
  expect(onEdit).not.toHaveBeenCalled();
  await expect.element(page.getByRole("menu")).toBeVisible();

  await edit.click({ force: true });
  await settle();
  expect(onEdit).not.toHaveBeenCalled();
  await expect.element(page.getByRole("menu")).toBeVisible();
}

test("Dropdown: a disabled item with a reason is reachable, described and inert", async () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  await render(
    <Dropdown trigger={<button type="button">Actions</button>}>
      <ItemMenuContent onEdit={onEdit} onDelete={onDelete} />
    </Dropdown>,
  );
  (page.getByRole("button", { name: "Actions" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("menuitem", { name: "Open" })).toHaveFocus();
  await expectReachableAndInert(onEdit);
  expect(onDelete).not.toHaveBeenCalled();
});

test("ContextMenu: a disabled item with a reason is reachable, described and inert", async () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  await render(
    <ContextMenu content={<ItemMenuContent onEdit={onEdit} onDelete={onDelete} />}>
      <div style={{ width: 200, height: 60 }}>Row</div>
    </ContextMenu>,
  );
  await page.getByText("Row").click({ button: "right" });
  await expect.element(page.getByRole("menuitem", { name: "Open" })).toBeVisible();
  await userEvent.keyboard("{ArrowDown}");
  await settle();
  await expect.element(page.getByRole("menuitem", { name: "Open" })).toHaveFocus();
  await expectReachableAndInert(onEdit);
});

test("the reason's tooltip opens when keyboard focus reaches the entry", async () => {
  await render(
    <Dropdown trigger={<button type="button">Actions</button>}>
      <ItemMenuContent onEdit={() => undefined} onDelete={() => undefined} />
    </Dropdown>,
  );
  (page.getByRole("button", { name: "Actions" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("menuitem", { name: "Open" })).toHaveFocus();
  expect(page.getByRole("tooltip").elements()).toHaveLength(0);
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
  await expect.element(page.getByRole("tooltip")).toHaveTextContent(REASON);
});

const ROLES = [
  { value: "admin", label: "Admin", disabled: true, description: "Only an owner can grant Admin." },
  { value: "editor", label: "Editor" },
  { value: "commenter", label: "Commenter", disabled: true },
  { value: "viewer", label: "Viewer" },
];

function SingleSelect({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("editor");
  return (
    <Select
      label="Role"
      value={value}
      options={ROLES}
      onChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

test("single Select: a disabled option with a reason is reachable but cannot be chosen", async () => {
  const onChange = vi.fn();
  await render(<SingleSelect onChange={onChange} />);
  (page.getByRole("button", { name: "Role: Editor" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("menuitemradio", { name: "Admin" })).toBeVisible();
  // Radix focuses the first focusable option. Before this change that was Editor.
  await settle();
  expect(focusedText()).toBe("Admin");
  const admin = page.getByRole("menuitemradio", { name: "Admin" });
  await expect.element(admin).toHaveAttribute("aria-disabled", "true");
  await expect.element(admin).toHaveAccessibleDescription("Only an owner can grant Admin.");

  await userEvent.keyboard("{Enter}");
  await settle();
  expect(onChange).not.toHaveBeenCalled();
  await expect.element(page.getByRole("menu")).toBeVisible();

  await admin.click({ force: true });
  await settle();
  expect(onChange).not.toHaveBeenCalled();
  await expect
    .element(page.getByRole("menuitemradio", { name: "Editor" }))
    .toHaveAttribute("aria-checked", "true");

  // Editor, then Viewer: the undescribed disabled Commenter is skipped.
  expect(await walk(2)).toEqual(["Admin", "Editor", "Viewer"]);

  // An enabled option still selects and closes.
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => onChange.mock.calls).toEqual([["viewer"]]);
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
});

function MultiSelect({ onChange }: { onChange: (value: string[]) => void }) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <Select
      label="Roles"
      value={values}
      options={ROLES}
      onChange={(next) => {
        onChange(next);
        setValues(next);
      }}
    />
  );
}

test("multi Select: a disabled option with a reason is reachable but cannot be toggled", async () => {
  const onChange = vi.fn();
  await render(<MultiSelect onChange={onChange} />);
  (page.getByRole("button", { name: "Roles" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("menuitemcheckbox", { name: "Admin" })).toBeVisible();
  await settle();
  expect(focusedText()).toBe("Admin");
  const admin = page.getByRole("menuitemcheckbox", { name: "Admin" });
  await expect.element(admin).toHaveAttribute("aria-disabled", "true");
  await expect.element(admin).toHaveAccessibleDescription("Only an owner can grant Admin.");

  await userEvent.keyboard(" ");
  await userEvent.keyboard("{Enter}");
  await admin.click({ force: true });
  await settle();
  expect(onChange).not.toHaveBeenCalled();
  await expect.element(admin).toHaveAttribute("aria-checked", "false");
  await expect.element(page.getByRole("menu")).toBeVisible();

  expect(await walk(2)).toEqual(["Admin", "Editor", "Viewer"]);
  await userEvent.keyboard(" ");
  await expect.poll(() => onChange.mock.calls).toEqual([[["viewer"]]]);
});

test("a described disabled option still shows its reason on hover", async () => {
  await render(<SingleSelect onChange={() => undefined} />);
  await page.getByRole("button", { name: "Role: Editor" }).click();
  await page.getByRole("menuitemradio", { name: "Admin" }).hover();
  await expect
    .element(page.getByRole("tooltip"))
    .toHaveTextContent("Only an owner can grant Admin.");
});

/** The computed paint of the menu item labelled `label`, and of its leading icon. */
function paint(label: string) {
  const item = page.getByRole("menuitem", { name: label }).element();
  const style = getComputedStyle(item);
  const icon = getComputedStyle(item.querySelector(".list-item-extra")!);
  return { color: style.color, background: style.backgroundColor, icon: icon.color };
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: a focused disabled item reads as disabled, not as an available choice`, async () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      await render(
        <Dropdown trigger={<button type="button">Actions</button>}>
          <ItemMenuContent onEdit={() => undefined} onDelete={() => undefined} />
        </Dropdown>,
      );
      (page.getByRole("button", { name: "Actions" }).element() as HTMLElement).focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("menuitem", { name: "Open" })).toHaveFocus();
      // The highlight transitions its colours; let each state settle before reading it.
      await new Promise((resolve) => setTimeout(resolve, 200));
      const enabledFocused = paint("Open");
      const disabledAtRest = paint("Edit");

      await userEvent.keyboard("{ArrowDown}");
      await expect.element(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
      await new Promise((resolve) => setTimeout(resolve, 200));
      const disabledFocused = paint("Edit");

      // Focus is visible on the disabled entry...
      expect(disabledFocused.background).not.toBe(disabledAtRest.background);
      // ...without painting it as an available choice: a lighter fill than an enabled
      // row's, and the label and icon keep their disabled colours.
      expect(disabledFocused.background).not.toBe(enabledFocused.background);
      expect(disabledFocused.color).toBe(disabledAtRest.color);
      expect(disabledFocused.color).not.toBe(enabledFocused.color);
      expect(disabledFocused.icon).toBe(disabledAtRest.icon);
      expect(disabledFocused.icon).not.toBe(enabledFocused.icon);
    } finally {
      document.documentElement.classList.remove("dark");
    }
  });
}

/** The computed colour of the option indicator in the radio item labelled `label`. */
function indicator(label: string) {
  const item = page.getByRole("menuitemradio", { name: label }).element();
  return getComputedStyle(item.querySelector(".check-indicator")!).color;
}

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: a focused disabled option keeps its disabled indicator`, async () => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      await render(<SingleSelect onChange={() => undefined} />);
      (page.getByRole("button", { name: "Role: Editor" }).element() as HTMLElement).focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("menuitemradio", { name: "Admin" })).toHaveFocus();
      await walk(2);
      await expect.element(page.getByRole("menuitemradio", { name: "Viewer" })).toHaveFocus();
      await new Promise((resolve) => setTimeout(resolve, 200));
      const enabledFocused = indicator("Viewer");
      const disabledAtRest = indicator("Admin");
      await userEvent.keyboard("{ArrowUp}");
      await settle();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(page.getByRole("menuitemradio", { name: "Admin" })).toHaveFocus();
      await new Promise((resolve) => setTimeout(resolve, 200));
      const disabledFocused = indicator("Admin");
      expect(disabledFocused).toBe(disabledAtRest);
      expect(disabledFocused).not.toBe(enabledFocused);
    } finally {
      document.documentElement.classList.remove("dark");
    }
  });
}
