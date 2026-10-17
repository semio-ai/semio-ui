import { useState } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
// The real compiled stylesheet: some tests here assert colours and cursors, and without
// it every row measures the defaults and the assertion could only agree with itself.
import "../test-stylesheet";
import { Dropdown } from "../floating/dropdown";
import { ContextMenu } from "../floating/context-menu";
import { Select } from "../floating/select";
import { NestedItem } from "./item";
import { NestedRadio } from "./radio";
import { NestedSelect } from "./select";

/**
 * A disabled menu entry that carries a reason is reachable by keyboard and states its
 * reason to assistive technology, while staying inert.
 *
 * Radix drops a `disabled` item from its roving focus order, so without this an arrow
 * key skips the entry and its reason is reachable only by hovering. Each case pairs the
 * reachable entry with a disabled entry that has NO reason, which must still be
 * skipped; that control is what tells a working rule apart from one that makes every
 * disabled entry focusable.
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

/** Presses Escape until no menu is left open: the first one may close a tooltip. */
async function dismissMenu() {
  for (let i = 0; i < 3 && document.querySelector('[role="menu"]'); i++) {
    await userEvent.keyboard("{Escape}");
    await settle();
  }
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await settle(8);
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

const tooltip = () => page.getByRole("tooltip");

async function expectReachableAndInert(
  onEdit: ReturnType<typeof vi.fn>,
  onDelete: ReturnType<typeof vi.fn>,
) {
  const edit = page.getByRole("menuitem", { name: "Edit" });

  // The reason is the entry's own description, present before any tooltip opens: a
  // tooltip describes its trigger only while it is open.
  expect(tooltip().elements()).toHaveLength(0);
  await expect.element(edit).toHaveAccessibleDescription(REASON);
  // The description adds no text to the page: with the tooltip closed the reason is
  // nowhere in it, so once the tooltip shows it, a text query finds exactly one copy.
  expect(page.getByText(REASON).elements()).toHaveLength(0);
  await expect.element(edit).toHaveAccessibleName("Edit");

  const seen = await walk(2);
  // The entry with a reason takes focus; the one without is skipped.
  expect(seen).toEqual(["Open", "Edit", "Duplicate"]);

  await userEvent.keyboard("{ArrowUp}");
  await settle();
  await expect.element(edit).toHaveFocus();
  await expect.element(edit).toHaveAttribute("aria-disabled", "true");
  await expect.element(tooltip()).toHaveTextContent(REASON);
  await expect.element(page.getByText(REASON)).toBeVisible();

  // Acting on the entry does nothing, keeps the menu open, and keeps the reason showing.
  for (const act of [
    () => userEvent.keyboard("{Enter}"),
    () => userEvent.keyboard(" "),
    () => edit.click({ force: true }),
  ]) {
    await act();
    await settle();
    expect(onEdit).not.toHaveBeenCalled();
    await expect.element(page.getByRole("menu")).toBeVisible();
    await expect.element(tooltip()).toHaveTextContent(REASON);
  }

  // A disabled entry without a reason is inert even to a programmatic click, which
  // pointer-events and the focus order cannot stop.
  (page.getByRole("menuitem", { name: "Delete" }).element() as HTMLElement).click();
  await settle();

  // A closing selection runs when the menu closes, so the check has to outlast it.
  await dismissMenu();
  expect(onEdit).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
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
  await expectReachableAndInert(onEdit, onDelete);
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
  await expectReachableAndInert(onEdit, onDelete);
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
  expect(tooltip().elements()).toHaveLength(0);
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
  await expect.element(tooltip()).toHaveTextContent(REASON);
});

const ADMIN_MEANING = "Can edit and manage access.";
const ADMIN_REASON = "Only an owner can grant Admin.";

/**
 * Admin is disabled with a reason AND a description; Commenter is disabled with only a
 * description. A description says what choosing an option means, never why it is off,
 * so only Admin is reachable, and it announces its reason.
 */
const ROLES = [
  {
    value: "admin",
    label: "Admin",
    disabled: true,
    description: ADMIN_MEANING,
    disabledReason: ADMIN_REASON,
  },
  { value: "editor", label: "Editor" },
  { value: "commenter", label: "Commenter", disabled: true, description: "Can comment." },
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
  // Radix focuses the first focusable option on a keyboard open, which is Admin.
  await settle();
  expect(focusedText()).toBe("Admin");
  const admin = page.getByRole("menuitemradio", { name: "Admin" });
  await expect.element(admin).toHaveAttribute("aria-disabled", "true");
  await expect.element(admin).toHaveAccessibleDescription(ADMIN_REASON);
  // While disabled, its tooltip is the reason, not what choosing it would mean.
  await expect.element(tooltip()).toHaveTextContent(ADMIN_REASON);

  for (const act of [
    () => userEvent.keyboard("{Enter}"),
    () => userEvent.keyboard(" "),
    () => admin.click({ force: true }),
  ]) {
    await act();
    await settle();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(page.getByRole("menu")).toBeVisible();
    await expect.element(tooltip()).toHaveTextContent(ADMIN_REASON);
  }
  await expect
    .element(page.getByRole("menuitemradio", { name: "Editor" }))
    .toHaveAttribute("aria-checked", "true");

  // A closing selection runs when the menu closes, so the check has to outlast it.
  await dismissMenu();
  expect(onChange).not.toHaveBeenCalled();
  await expect.element(page.getByRole("button", { name: "Role: Editor" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("menuitemradio", { name: "Admin" })).toHaveFocus();

  // Editor, then Viewer: Commenter, disabled with only a description, is skipped.
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
  await expect.element(admin).toHaveAccessibleDescription(ADMIN_REASON);

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

test("a disabled option with a reason that would close on select keeps the menu open", async () => {
  // `NestedSelect` stays open by default, which would hide a missing prevention; an
  // option that opts in to closing is the case that needs it.
  const onChange = vi.fn();
  await render(
    <Dropdown trigger={<button type="button">Filters</button>}>
      <NestedSelect
        values={[]}
        onChange={onChange}
        options={[
          {
            value: "pinned",
            label: "Pinned",
            disabled: true,
            disabledReason: "Pinning needs Editor access.",
            closeOnSelect: true,
          },
          { value: "recent", label: "Recent", closeOnSelect: true },
        ]}
      />
    </Dropdown>,
  );
  (page.getByRole("button", { name: "Filters" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  const pinned = page.getByRole("menuitemcheckbox", { name: "Pinned" });
  await expect.element(pinned).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await settle();
  await expect.element(page.getByRole("menu")).toBeVisible();
  await pinned.click({ force: true });
  await settle();
  await expect.element(page.getByRole("menu")).toBeVisible();
  expect(onChange).not.toHaveBeenCalled();
});

test("a disabled group skips its options unless an option has its own reason", async () => {
  await render(
    <Dropdown trigger={<button type="button">Rung</button>}>
      <NestedItem onClick={() => undefined}>First</NestedItem>
      <NestedRadio
        disabled
        value="viewer"
        onChange={() => undefined}
        options={[
          { value: "editor", label: "Editor", description: "Can edit, but not share." },
          { value: "admin", label: "Admin", disabledReason: ADMIN_REASON },
          { value: "viewer", label: "Viewer" },
        ]}
      />
      <NestedItem onClick={() => undefined}>Last</NestedItem>
    </Dropdown>,
  );
  (page.getByRole("button", { name: "Rung" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("menuitem", { name: "First" })).toHaveFocus();
  expect(await walk(2)).toEqual(["First", "Admin", "Last"]);
  await expect
    .element(page.getByRole("menuitemradio", { name: "Editor" }))
    .not.toHaveAttribute("aria-describedby");
});

test("a disabled option with a reason shows it on hover", async () => {
  await render(<SingleSelect onChange={() => undefined} />);
  await page.getByRole("button", { name: "Role: Editor" }).click();
  await page.getByRole("menuitemradio", { name: "Admin" }).hover();
  await expect.element(tooltip()).toHaveTextContent(ADMIN_REASON);
});

/** The computed cursor of whatever paints at the centre of `element`. */
function cursorAt(element: Element) {
  const rect = element.getBoundingClientRect();
  const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)!;
  return getComputedStyle(hit).cursor;
}

test("a disabled item with a reason shows the default cursor, not the pointer", async () => {
  await render(
    <Dropdown trigger={<button type="button">Actions</button>}>
      <ItemMenuContent onEdit={() => undefined} onDelete={() => undefined} />
    </Dropdown>,
  );
  await page.getByRole("button", { name: "Actions" }).click();
  const open = page.getByRole("menuitem", { name: "Open" }).element();
  const edit = page.getByRole("menuitem", { name: "Edit" }).element();
  // The label and the leading icon slot, which carries the item's highlight class too.
  expect(cursorAt(open)).toBe("pointer");
  expect(cursorAt(open.querySelector(".list-item-extra")!)).toBe("pointer");
  expect(cursorAt(edit)).toBe("default");
  expect(cursorAt(edit.querySelector(".list-item-extra")!)).toBe("default");
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
