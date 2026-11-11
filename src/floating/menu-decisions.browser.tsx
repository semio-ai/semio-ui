import { useEffect, useState, type ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Result } from "@semio/utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { UiStoreProvider } from "../context/ui-store-provider";
import { useAddToast } from "../hooks/use-add-toast";
import { NestedItem } from "../nested-elements/item";
import { NestedCheckbox } from "../nested-elements/checkbox";
import { NestedCheckboxTree } from "../nested-elements/checkbox-tree";
import { NestedMenu } from "../nested-elements/menu";
import { NestedRadio } from "../nested-elements/radio";
import { NestedSelect } from "../nested-elements/select";
import { ActionMenu } from "./action-menu";
import { ContextMenu } from "./context-menu";
import { Dropdown as DropdownOverlay } from "./dropdown";
import { Dialog as DialogOverlay } from "./dialog";
import { Modal as ModalOverlay } from "./modal";
import { SelectTree } from "./select-tree";
import { ToastManager } from "./toast";
import { TooltipHost } from "./tooltip-3d/tooltip-host";
import { TooltipProvider } from "./tooltip-3d/tooltip-provider";
import { useCanvasContextMenu } from "./tooltip-3d/use-canvas-context-menu";
import { useTooltipStore } from "./tooltip-3d/store";

enum Entry {
  Dropdown = "Dropdown",
  Context = "ContextMenu",
  Canvas = "canvas context menu",
  Click = "canvas click popover",
}

enum Surface {
  Dialog = "Dialog",
  Modal = "Modal",
}

const item = (name: string) => page.getByRole("menuitem", { name, exact: true });
const button = (name: string) => page.getByRole("button", { name, exact: true });
const menus = () => document.querySelectorAll('[role="menu"][data-state="open"]');
const tick = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function CanvasTrigger({ children, click }: { children: ReactNode; click: boolean }) {
  const id = "menu-decisions-canvas";
  const { onContextMenu } = useCanvasContextMenu({ id, items: () => children });
  useEffect(() => {
    if (!click) return;
    useTooltipStore.getState().registerAnchor({
      id,
      content: children,
      mode: "click",
      positioning: {},
      interactive: true,
      screenPosition: { x: 180, y: 150 },
    });
  }, [children, click]);
  return (
    <button
      type="button"
      onClick={() => {
        if (click) useTooltipStore.getState().showTooltip(id, "click");
      }}
      onContextMenu={(event) =>
        onContextMenu({
          nativeEvent: event.nativeEvent,
          point: { x: 1, y: 2, z: 3 },
        } as unknown as ThreeEvent<PointerEvent>)
      }
    >
      Open
    </button>
  );
}

function MenuFixture({
  entry,
  children,
  disabled = false,
}: {
  entry: Entry;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <UiStoreProvider>
      <button type="button">Before</button>
      {entry === Entry.Dropdown ? (
        <DropdownOverlay trigger={<button type="button">Open</button>}>{children}</DropdownOverlay>
      ) : entry === Entry.Context ? (
        <ContextMenu disabled={disabled} content={children}>
          <button type="button">Open</button>
        </ContextMenu>
      ) : (
        <TooltipProvider>
          <TooltipHost>
            <CanvasTrigger click={entry === Entry.Click}>{children}</CanvasTrigger>
          </TooltipHost>
        </TooltipProvider>
      )}
      <button type="button">After</button>
    </UiStoreProvider>
  );
}

async function open(entry: Entry, keyboard = false) {
  if (entry === Entry.Context || entry === Entry.Canvas)
    await button("Open").click({ button: "right" });
  else if (keyboard) {
    button("Open").element().focus();
    await userEvent.keyboard("{Enter}");
  } else await button("Open").click();
  await expect.poll(() => menus().length).toBe(1);
}

async function first(name = "First") {
  const popup = document.querySelector<HTMLElement>('[role="menu"][data-state="open"]')!;
  // A keyboard open already focuses the first enabled entry; a pointer open leaves focus
  // on the popup, from which Home moves to the first entry.
  if (!popup.contains(document.activeElement)) popup.focus();
  await userEvent.keyboard("{Home}");
  await expect.element(item(name)).toHaveFocus();
}

function AddNotification() {
  const add = useAddToast();
  useEffect(
    () => add({ id: "decisions-toast", title: "Decision notification", dismiss: 60000 }),
    [add],
  );
  return null;
}

beforeEach(async () => {
  await page.viewport(1280, 800);
});

for (const entry of Object.values(Entry))
  describe(entry, () => {
    test("1: Dropdown Tab closes and advances; context and canvas Tab retain the entry", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedItem>First</NestedItem>
        </MenuFixture>,
      );
      await open(entry, true);
      await first();
      await userEvent.keyboard("{Tab}");
      if (entry === Entry.Dropdown) {
        await expect.poll(() => menus().length).toBe(0);
        await expect.element(button("After")).toHaveFocus();
      } else {
        expect(menus()).toHaveLength(1);
        await expect.element(item("First")).toHaveFocus();
        await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
        expect(menus()).toHaveLength(1);
        await expect.element(item("First")).toHaveFocus();
      }
    });

    test("2: submenu Escape closes only that level", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedMenu label="More">
            <NestedItem>Child</NestedItem>
          </NestedMenu>
        </MenuFixture>,
      );
      await open(entry, true);
      await first("More");
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(item("Child")).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect.element(item("Child")).not.toBeInTheDocument();
      await expect.element(item("More")).toHaveFocus();
      expect(menus()).toHaveLength(1);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => menus().length).toBe(0);
    });

    test("3: every disabled kind is reachable, aria-disabled and inert", async () => {
      const change = vi.fn();
      await render(
        <MenuFixture entry={entry}>
          <NestedItem disabled onClick={change}>
            Disabled item
          </NestedItem>
          <NestedItem disabled description="Reason" onClick={change}>
            Explained item
          </NestedItem>
          <NestedCheckbox
            disabled
            label="Disabled checkbox"
            value={false}
            closeOnSelect
            onChange={change}
          />
          <NestedRadio
            disabled
            value=""
            onChange={change}
            options={[{ label: "Disabled radio", value: "radio" }]}
          />
          <NestedSelect
            disabled
            values={[]}
            onChange={change}
            options={[{ label: "Disabled select", value: "select", closeOnSelect: true }]}
          />
          <NestedCheckboxTree
            disabled
            values={[]}
            onChange={change}
            options={[
              { label: "Disabled leaf", value: "leaf" },
              {
                label: "Disabled parent",
                value: "parent",
                children: [{ label: "Tree child", value: "child" }],
              },
            ]}
          />
          <NestedMenu disabled label="Disabled submenu">
            <NestedItem>Sub child</NestedItem>
          </NestedMenu>
          <NestedItem>Last</NestedItem>
        </MenuFixture>,
      );
      await open(entry, true);
      await first("Disabled item");
      const labels = [
        "Disabled item",
        "Explained item",
        "Disabled checkbox",
        "Disabled radio",
        "Disabled select",
        "Disabled leaf",
        "Disabled parent",
        "Disabled submenu",
      ];
      for (const label of labels) {
        const focused = document.activeElement as HTMLElement;
        expect(focused.textContent).toContain(label);
        expect(focused.getAttribute("aria-disabled")).toBe("true");
        await userEvent.keyboard("{Enter} ");
        focused.click();
        await tick();
        expect(change).not.toHaveBeenCalled();
        expect(menus()).toHaveLength(1);
        await expect.element(item("Tree child")).not.toBeInTheDocument();
        await expect.element(item("Sub child")).not.toBeInTheDocument();
        await userEvent.keyboard("{ArrowDown}");
      }
      await expect.element(item("Last")).toHaveFocus();
    });

    test("4: background exposure and focus follow the menu kind", async () => {
      const { container } = await render(
        <MenuFixture entry={entry}>
          <NestedItem>First</NestedItem>
        </MenuFixture>,
      );
      const after = button("After").element();
      await open(entry, true);
      await first();
      expect(container.getAttribute("aria-hidden")).toBe(entry === Entry.Context ? "true" : null);
      if (entry === Entry.Context) {
        const popup = document.querySelector('[role="menu"]')!;
        const guard = popup.parentElement!.querySelector<HTMLElement>(
          '[data-type="inside"]:last-child',
        );
        expect(guard).not.toBeNull();
        guard!.focus();
        await expect
          .poll(() => document.querySelector('[role="menu"]')?.contains(document.activeElement))
          .toBe(true);
        expect(container.getAttribute("aria-hidden")).toBe("true");
      } else {
        after.focus();
        await expect.element(after).toHaveFocus();
        await tick();
        expect(menus()).toHaveLength(1);
        expect(container.getAttribute("aria-hidden")).toBeNull();
      }
    });

    test("5: root and submenu focus stop at both ends", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedItem>First</NestedItem>
          <NestedMenu label="Last">
            <NestedItem>Child first</NestedItem>
            <NestedItem>Child last</NestedItem>
          </NestedMenu>
        </MenuFixture>,
      );
      await open(entry, true);
      await first();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(item("First")).toHaveFocus();
      await userEvent.keyboard("{End}{ArrowDown}");
      await expect.element(item("Last")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(item("Child first")).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(item("Child first")).toHaveFocus();
      await userEvent.keyboard("{End}{ArrowDown}");
      await expect.element(item("Child last")).toHaveFocus();
    });

    test("6: scroll locks and the first outside press only dismisses", async () => {
      const clicked = vi.fn();
      await render(
        <>
          <MenuFixture entry={entry}>
            <NestedItem>First</NestedItem>
          </MenuFixture>
          <button
            type="button"
            style={{ position: "fixed", right: 40, bottom: 40 }}
            onClick={clicked}
          >
            Outside
          </button>
        </>,
      );
      const outside = button("Outside").element();
      const original = {
        html: document.documentElement.style.overflowY,
        body: document.body.style.overflowY,
      };
      await open(entry);
      await expect
        .poll(
          () =>
            document.documentElement.style.overflowY === "hidden" ||
            document.body.style.overflowY === "hidden",
        )
        .toBe(true);
      await userEvent.click(outside, { force: true });
      await expect.poll(() => menus().length).toBe(0);
      expect(clicked).toHaveBeenCalledTimes(0);
      await button("Outside").click();
      expect(clicked).toHaveBeenCalledTimes(1);
      await expect
        .poll(() => ({
          html: document.documentElement.style.overflowY,
          body: document.body.style.overflowY,
        }))
        .toEqual(original);
    });

    test("7: notifications are inside dismissal boundaries and yield Escape", async () => {
      await render(
        <ToastManager>
          <AddNotification />
          <MenuFixture entry={entry}>
            <NestedItem>First</NestedItem>
          </MenuFixture>
        </ToastManager>,
      );
      const notification = page.getByText("Decision notification", { exact: true });
      await expect.element(notification).toBeVisible();
      await expect
        .poll(() => getComputedStyle(notification.element().closest("li")!).transform)
        .toBe("none");
      await open(entry, true);
      await first();
      await notification.click();
      expect(menus()).toHaveLength(1);
      document.querySelector<HTMLElement>("[data-notifications-region]")!.focus();
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => menus().length).toBe(0);
      await expect.element(notification).toBeVisible();
    });

    test("8: a press skips trigger focus; keyboard entry and highlight follow focus", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedItem>First</NestedItem>
          <NestedItem>Second</NestedItem>
        </MenuFixture>,
      );
      const trigger = button("Open").element();
      const triggerFocus = vi.fn();
      trigger.addEventListener("focus", triggerFocus);
      button("Before").element().focus();
      await open(entry);
      // A Dropdown press opens without focusing its trigger. A context press focuses a
      // focusable trigger, as the browser's own mousedown does, so Escape returns there.
      if (entry === Entry.Dropdown) {
        expect(triggerFocus).toHaveBeenCalledTimes(0);
      } else if (entry === Entry.Context) {
        expect(triggerFocus).toHaveBeenCalledTimes(1);
      } else {
        expect(document.querySelector('[aria-haspopup="menu"]')).toBeNull();
      }
      await first();
      expect(item("First").element().hasAttribute("data-highlighted")).toBe(true);
      item("Second").element().focus();
      await expect.element(item("Second")).toHaveAttribute("data-highlighted");
      await expect.element(item("First")).not.toHaveAttribute("data-highlighted");
      await userEvent.keyboard("{Escape}");
      if (entry === Entry.Dropdown) {
        triggerFocus.mockClear();
        await open(entry, true);
        await expect.element(item("First")).toHaveFocus();
      }
    });

    for (const surface of Object.values(Surface))
      test(`9: Escape restores the trigger inside ${surface}`, async () => {
        function Fixture() {
          const [visible, setVisible] = useState(true);
          const content = (
            <MenuFixture entry={entry}>
              <NestedItem>First</NestedItem>
            </MenuFixture>
          );
          return surface === Surface.Modal ? (
            <ModalOverlay open={visible} onStateChange={setVisible} title="Surrounding">
              {content}
            </ModalOverlay>
          ) : (
            <DialogOverlay
              open={visible}
              onStateChange={setVisible}
              title="Surrounding"
              onCancel={() => setVisible(false)}
            >
              {content}
            </DialogOverlay>
          );
        }
        await render(<Fixture />);
        const trigger = button("Open").element();
        trigger.focus();
        await open(entry, true);
        await first();
        await userEvent.keyboard("{Escape}");
        await expect.poll(() => menus().length).toBe(0);
        await expect.element(trigger).toHaveFocus();
        await expect
          .element(
            page.getByRole(surface === Surface.Modal ? "dialog" : "alertdialog", {
              name: "Surrounding",
            }),
          )
          .toBeVisible();
      });

    test("11: a reason tooltip consumes its Escape without closing the menu", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedItem disabled description="Access is required">
            First
          </NestedItem>
          <NestedItem>Last</NestedItem>
        </MenuFixture>,
      );
      await open(entry, true);
      await first();
      await expect.element(page.getByRole("tooltip")).toHaveTextContent("Access is required");
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
      expect(menus()).toHaveLength(1);
      await expect.element(item("First")).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => menus().length).toBe(0);
    });

    test("11b: Escape on a disabled entry without a tooltip closes the root", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedItem disabled>First</NestedItem>
          <NestedItem>Last</NestedItem>
        </MenuFixture>,
      );
      await open(entry, true);
      await first();
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => menus().length).toBe(0);
    });

    test("11c: disabled submenu entries consume only the reason tooltip's Escape", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedMenu label="More">
            <NestedItem disabled description="Child reason">
              Child
            </NestedItem>
            <NestedItem>Enabled child</NestedItem>
          </NestedMenu>
        </MenuFixture>,
      );
      await open(entry, true);
      await first("More");
      await userEvent.keyboard("{ArrowRight}");
      // The submenu opens on its first enabled entry; ArrowUp reaches the disabled one.
      await expect.element(item("Enabled child")).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(item("Child")).toHaveFocus();
      await expect.element(page.getByRole("tooltip")).toHaveTextContent("Child reason");
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
      expect(menus()).toHaveLength(2);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => menus().length).toBe(1);
      await expect.element(item("More")).toHaveFocus();
    });

    test("12: selection dismissal follows each kind and its override", async () => {
      const changed = vi.fn();
      await render(
        <MenuFixture entry={entry}>
          <NestedItem>Item closes</NestedItem>
          <NestedItem closeOnSelect={false} onClick={changed}>
            Item stays
          </NestedItem>
          <NestedCheckbox label="Checkbox stays" value={false} onChange={changed} />
          <NestedCheckbox label="Checkbox closes" value={false} closeOnSelect onChange={changed} />
          <NestedRadio
            value=""
            onChange={changed}
            options={[
              { label: "Radio closes", value: "close" },
              { label: "Radio stays", value: "stay", closeOnSelect: false },
            ]}
          />
          <NestedSelect
            values={[]}
            onChange={changed}
            options={[
              { label: "Select stays", value: "stay" },
              { label: "Select closes", value: "close", closeOnSelect: true },
            ]}
          />
          <NestedCheckboxTree
            values={[]}
            onChange={changed}
            options={[{ label: "Leaf stays", value: "leaf" }]}
          />
        </MenuFixture>,
      );
      for (const [role, label, closes] of [
        ["menuitem", "Item stays", false],
        ["menuitem", "Item closes", true],
        ["menuitemcheckbox", "Checkbox stays", false],
        ["menuitemcheckbox", "Checkbox closes", true],
        ["menuitemradio", "Radio stays", false],
        ["menuitemradio", "Radio closes", true],
        ["menuitemcheckbox", "Select stays", false],
        ["menuitemcheckbox", "Select closes", true],
        ["menuitemcheckbox", "Leaf stays", false],
      ] as const) {
        if (!menus().length) await open(entry);
        await page.getByRole(role, { name: label, exact: true }).click();
        await expect.poll(() => menus().length).toBe(closes ? 0 : 1);
      }
      await expect.poll(() => changed.mock.calls.length).toBe(8);
    });

    test("14: trigger, popup, sub-trigger and check states expose exact data-state values", async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedCheckbox label="Checked" value />
          <NestedCheckbox label="Unchecked" value={false} />
          <NestedRadio value="a" options={[{ label: "Radio", value: "a" }]} />
          <NestedMenu label="More">
            <NestedItem>Child</NestedItem>
          </NestedMenu>
          <NestedCheckboxTree
            values={["a"]}
            options={[
              {
                label: "Partial",
                value: "parent",
                children: [
                  { label: "A", value: "a" },
                  { label: "B", value: "b" },
                ],
              },
            ]}
          />
        </MenuFixture>,
      );
      const trigger = button("Open").element();
      if (entry === Entry.Dropdown || entry === Entry.Context)
        expect(trigger.getAttribute("data-state")).toBe("closed");
      await open(entry);
      if (entry === Entry.Dropdown || entry === Entry.Context)
        expect(trigger.getAttribute("data-state")).toBe("open");
      expect(document.querySelector('[role="menu"]')!.getAttribute("data-state")).toBe("open");
      await expect
        .element(page.getByRole("menuitemcheckbox", { name: "Checked", exact: true }))
        .toHaveAttribute("data-state", "checked");
      await expect
        .element(page.getByRole("menuitemcheckbox", { name: "Unchecked", exact: true }))
        .toHaveAttribute("data-state", "unchecked");
      await expect
        .element(page.getByRole("menuitemradio", { name: "Radio", exact: true }))
        .toHaveAttribute("data-state", "checked");
      expect(
        item("Partial").element().querySelector('[role="checkbox"]')!.getAttribute("data-state"),
      ).toBe("indeterminate");
      await expect.element(item("More")).toHaveAttribute("data-state", "closed");
      item("More").element().focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(item("More")).toHaveAttribute("data-state", "open");
      await userEvent.keyboard("{Escape}");
      await expect.element(item("More")).toHaveAttribute("data-state", "closed");
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => menus().length).toBe(0);
      if (entry === Entry.Dropdown || entry === Entry.Context)
        expect(trigger.getAttribute("data-state")).toBe("closed");
    });
  });

test("10: disabling ContextMenu blocks opening but keeps an open menu usable", async () => {
  function Fixture() {
    const [disabled, setDisabled] = useState(false);
    return (
      <MenuFixture entry={Entry.Context} disabled={disabled}>
        <NestedItem closeOnSelect={false} onClick={() => setDisabled(true)}>
          Disable opening
        </NestedItem>
        <NestedItem>Last</NestedItem>
      </MenuFixture>
    );
  }
  await render(<Fixture />);
  await open(Entry.Context);
  await item("Disable opening").click();
  await userEvent.keyboard("{End}");
  await expect.element(item("Last")).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => menus().length).toBe(0);
  await button("Open").click({ button: "right" });
  await tick();
  expect(menus()).toHaveLength(0);
});

test("13: ActionMenu calls onSelect inside the selection event and mounts in the toast host", async () => {
  const onSelect = vi.fn(() => {
    // Read inside the callback: trusted dispatch runs microtasks between listeners,
    // so a capture flag cleared by queueMicrotask does not describe this event.
    expect(window.event?.isTrusted).toBe(true);
    expect(["click", "keydown"]).toContain(window.event?.type);
    return Result.Ok<void, string>(undefined);
  });
  function AddActionNotification() {
    const add = useAddToast();
    useEffect(
      () =>
        add({
          id: "action-decision",
          title: "Action notification",
          dismiss: 60000,
          actionMenu: {
            icon: "search",
            label: "Actions",
            items: [{ id: "copy", label: "Copy", onSelect }],
          },
        }),
      [add],
    );
    return null;
  }
  const { unmount } = await render(
    <ToastManager>
      <AddActionNotification />
    </ToastManager>,
  );
  await expect.element(page.getByText("Action notification", { exact: true })).toBeVisible();
  await button("Actions").click();
  const selected = item("Copy").element();
  const host = selected.closest('li[role="presentation"]');
  expect(host?.closest("[data-notifications-region]")).not.toBeNull();
  await item("Copy").click();
  expect(onSelect).toHaveBeenCalledTimes(1);
  // ActionMenu catches action failures; a caught assertion must still fail this test.
  expect(onSelect).toHaveReturnedTimes(1);
  await expect.poll(() => menus().length).toBe(0);
  await unmount();
  await render(
    <ActionMenu
      menu={{
        icon: "search",
        label: "Direct actions",
        items: [{ id: "copy", label: "Copy", onSelect }],
      }}
    />,
  );
  await button("Direct actions").click();
  await item("Copy").click();
  expect(onSelect).toHaveBeenCalledTimes(2);
  expect(onSelect).toHaveReturnedTimes(2);
});

for (const key of ["{Enter}", "{ArrowDown}", " "]) {
  test(`B: a keyboard Dropdown open (${key}) focuses the first enabled entry`, async () => {
    await render(
      <MenuFixture entry={Entry.Dropdown}>
        <NestedItem disabled>First</NestedItem>
        <NestedItem>Last</NestedItem>
      </MenuFixture>,
    );
    button("Open").element().focus();
    await userEvent.keyboard(key);
    await expect.element(item("Last")).toHaveFocus();
    // The disabled entry before it stays reachable.
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(item("First")).toHaveFocus();
    await expect.element(item("First")).toHaveAttribute("data-highlighted");
  });
}

for (const tree of [false, true])
  for (const key of ["{ArrowRight}", "{Enter}"])
    test(`B: ${tree ? "tree" : "NestedMenu"} ${key} opens on the first enabled child`, async () => {
      await render(
        <MenuFixture entry={Entry.Dropdown}>
          {tree ? (
            <NestedCheckboxTree
              values={[]}
              options={[
                {
                  label: "More",
                  value: "parent",
                  children: [
                    { label: "Disabled child", value: "disabled", disabled: true },
                    { label: "Enabled child", value: "enabled" },
                  ],
                },
              ]}
            />
          ) : (
            <NestedMenu label="More">
              <NestedItem disabled>Disabled child</NestedItem>
              <NestedItem>Enabled child</NestedItem>
            </NestedMenu>
          )}
        </MenuFixture>,
      );
      const child = (name: string) =>
        page.getByRole(tree ? "menuitemcheckbox" : "menuitem", { name, exact: true });
      await open(Entry.Dropdown, true);
      await expect.element(item("More")).toHaveFocus();
      await userEvent.keyboard(key);
      await expect.element(child("Enabled child")).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}");
      await expect.element(child("Disabled child")).toHaveFocus();
    });

for (const relay of [false, true])
  for (const close of ["Escape", "selection", "submenu selection"])
    test(`C: portalled Modal Dropdown returns focus before removal (${relay ? "relay" : "button"}, ${close})`, async () => {
      const closing = vi.fn();
      function Fixture() {
        const [container, setContainer] = useState<HTMLDivElement | null>(null);
        const [visible, setVisible] = useState(true);
        const control = <button type="button">Modal actions</button>;
        return (
          <UiStoreProvider>
            <ModalOverlay open={visible} onStateChange={setVisible} title="Menu modal">
              <div ref={setContainer}>
                <DropdownOverlay
                  trigger={relay ? <span>{control}</span> : control}
                  portalContainer={container}
                  onOpenChange={(next) => {
                    if (!next) {
                      closing(
                        document.activeElement,
                        document.querySelector('[role="menu"]')?.isConnected,
                      );
                    }
                  }}
                >
                  {close === "submenu selection" ? (
                    <NestedMenu label="More">
                      <NestedItem>Choose</NestedItem>
                    </NestedMenu>
                  ) : (
                    <NestedItem>Choose</NestedItem>
                  )}
                </DropdownOverlay>
              </div>
            </ModalOverlay>
          </UiStoreProvider>
        );
      }
      await render(<Fixture />);
      const trigger = button("Modal actions").element();
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      if (close === "submenu selection") {
        await expect.element(item("More")).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
      }
      await expect.element(item("Choose")).toHaveFocus();
      await userEvent.keyboard(close === "Escape" ? "{Escape}" : "{Enter}");
      expect(closing).toHaveBeenCalledWith(trigger, true);
      await expect.poll(() => menus().length).toBe(0);
      await expect.element(trigger).toHaveFocus();
      await expect.element(page.getByRole("dialog", { name: "Menu modal" })).toBeVisible();
    });

test("C: ContextMenu Escape restores the element focused when it opened", async () => {
  // A row that cannot take focus leaves focus where it was when the menu opens.
  await render(
    <UiStoreProvider>
      <button type="button">Before</button>
      <ContextMenu content={<NestedItem>First</NestedItem>}>
        <div style={{ width: 200, height: 40 }}>Row</div>
      </ContextMenu>
    </UiStoreProvider>,
  );
  const previous = button("Before").element();
  previous.focus();
  await page.getByText("Row", { exact: true }).click({ button: "right" });
  await expect.poll(() => menus().length).toBe(1);
  await first();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => menus().length).toBe(0);
  await expect.element(previous).toHaveFocus();
});

test("C: ContextMenu Escape returns to a focusable trigger the press focused", async () => {
  await render(
    <MenuFixture entry={Entry.Context}>
      <NestedItem>First</NestedItem>
    </MenuFixture>,
  );
  button("Before").element().focus();
  await open(Entry.Context);
  await first();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => menus().length).toBe(0);
  await expect.element(button("Open")).toHaveFocus();
});

test("D: ContextMenu opens right/start four pixels right and two pixels below the press", async () => {
  await render(
    <MenuFixture entry={Entry.Context}>
      <NestedItem>First</NestedItem>
    </MenuFixture>,
  );
  let point = { x: 0, y: 0 };
  button("Open")
    .element()
    .addEventListener("contextmenu", (event) => {
      const press = event as MouseEvent;
      point = { x: press.clientX, y: press.clientY };
    });
  await open(Entry.Context);
  const popup = document.querySelector<HTMLElement>('[role="menu"]')!;
  await expect.element(popup).toHaveAttribute("data-side", "right");
  await expect
    .poll(() => {
      const rect = popup.getBoundingClientRect();
      return [Math.round(rect.x - point.x), Math.round(rect.y - point.y)];
    })
    .toEqual([4, 2]);
});

for (const entry of Object.values(Entry))
  test(`E: ${entry} pointer popup and submenu have no focus outline`, async () => {
    await render(
      <MenuFixture entry={entry}>
        <NestedMenu label="More">
          <NestedItem>Child</NestedItem>
        </NestedMenu>
      </MenuFixture>,
    );
    await open(entry);
    const popup = document.querySelector<HTMLElement>('[role="menu"]')!;
    await expect.element(popup).toHaveFocus();
    expect(getComputedStyle(popup).outlineStyle).toBe("none");
    expect(getComputedStyle(popup).outlineWidth).toBe("3px");
    await first("More");
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(item("Child")).toHaveFocus();
    expect(getComputedStyle(item("Child").element().closest('[role="menu"]')!).outlineStyle).toBe(
      "none",
    );
  });

for (const side of ["top", "bottom", "left", "right"] as const)
  test(`F: ${side} Dropdown arrow is centered and its fill stretches to the 12 by 6 box`, async () => {
    await render(
      <div style={{ position: "fixed", left: 450, top: 350 }}>
        <DropdownOverlay side={side} trigger={<button type="button">Open</button>}>
          <NestedItem>First</NestedItem>
        </DropdownOverlay>
      </div>,
    );
    await button("Open").click();
    const popup = document.querySelector<HTMLElement>('[role="menu"]')!;
    await expect.element(popup).toHaveAttribute("data-side", side);
    const arrow = popup.querySelector("svg")!;
    const fill = arrow.querySelector("path")!;
    const vertical = side === "top" || side === "bottom";
    await expect
      .poll(() => {
        const box = arrow.getBoundingClientRect();
        const trigger = button("Open").element().getBoundingClientRect();
        return Math.abs(
          vertical
            ? box.x + box.width / 2 - trigger.x - trigger.width / 2
            : box.y + box.height / 2 - trigger.y - trigger.height / 2,
        );
      })
      // Within a pixel: a trigger whose text width is fractional centres on a half pixel.
      .toBeLessThan(1);
    expect(arrow.getAttribute("preserveAspectRatio")).toBe("none");
    const bounds = fill.getBoundingClientRect();
    expect(vertical ? bounds.height : bounds.width).toBeCloseTo(5.4, 1);
  });

test("H: mobile disclosure uses menuitem semantics, toggles once per activation and retains its hidden panel", async () => {
  await page.viewport(390, 844);
  await render(
    <MenuFixture entry={Entry.Dropdown}>
      <NestedMenu label="More">
        <NestedItem>Child</NestedItem>
      </NestedMenu>
    </MenuFixture>,
  );
  await open(Entry.Dropdown, true);
  const disclosure = item("More").element();
  const panel = document.getElementById(disclosure.getAttribute("aria-controls")!)!;
  expect(panel).not.toBeNull();
  await expect.element(panel).not.toBeVisible();
  await expect.element(disclosure).toHaveAttribute("aria-expanded", "false");
  for (const key of ["{Enter}", " "]) {
    disclosure.focus();
    await userEvent.keyboard(key);
    await expect.element(disclosure).toHaveAttribute("aria-expanded", "true");
    await expect.element(panel).toBeVisible();
    await userEvent.keyboard(key);
    await expect.element(disclosure).toHaveAttribute("aria-expanded", "false");
    await expect.element(panel).not.toBeVisible();
    expect(panel.isConnected).toBe(true);
  }
  await item("More").click();
  await expect.element(disclosure).toHaveAttribute("aria-expanded", "true");
  await item("More").click();
  await expect.element(disclosure).toHaveAttribute("aria-expanded", "false");
  expect(document.getElementById(disclosure.getAttribute("aria-controls")!)).toBe(panel);
});

test("I: tree parent row Space checks; row Enter/Right open; scripted checkbox Space/Enter only check", async () => {
  function Fixture() {
    const [values, setValues] = useState<string[]>(["e"]);
    return (
      <MenuFixture entry={Entry.Dropdown}>
        <NestedCheckboxTree
          values={values}
          onChange={setValues}
          options={[
            {
              label: "Parent",
              value: "parent",
              children: [
                { label: "Leaf E", value: "e" },
                { label: "Leaf F", value: "f" },
              ],
            },
          ]}
        />
      </MenuFixture>
    );
  }
  await render(<Fixture />);
  await open(Entry.Dropdown);
  const row = item("Parent").element();
  const checkbox = row.querySelector<HTMLElement>('[role="checkbox"]')!;
  expect(checkbox.tabIndex).toBe(-1);
  await expect.element(document.querySelector<HTMLElement>('[role="menu"]')!).toHaveFocus();
  row.focus();
  await userEvent.keyboard(" ");
  await expect.element(checkbox).toHaveAttribute("aria-checked", "true");
  await expect.element(row).toHaveFocus();
  expect(menus()).toHaveLength(1);
  for (const key of ["{Enter}", "{ArrowRight}"]) {
    await userEvent.keyboard(key);
    await expect
      .element(page.getByRole("menuitemcheckbox", { name: "Leaf E", exact: true }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(row).toHaveFocus();
  }
  checkbox.focus();
  await tick();
  await expect.element(checkbox).toHaveFocus();
  await userEvent.keyboard(" ");
  await expect.element(checkbox).toHaveAttribute("aria-checked", "false");
  await expect.element(checkbox).toHaveFocus();
  expect(menus()).toHaveLength(1);
  await userEvent.keyboard("{Enter}");
  await expect.element(checkbox).toHaveAttribute("aria-checked", "true");
  await expect.element(checkbox).toHaveFocus();
  expect(menus()).toHaveLength(1);
  await page.getByRole("checkbox").click();
  await expect.element(checkbox).toHaveAttribute("aria-checked", "false");
  expect(menus()).toHaveLength(1);
});

test("a Dropdown its consumer unmounts as it closes still runs the selected action", async () => {
  const action = vi.fn();
  function Unmounting() {
    const [shown, setShown] = useState(true);
    return (
      <UiStoreProvider>
        {shown && (
          <DropdownOverlay
            trigger={<button type="button">Open</button>}
            onOpenChange={(next) => {
              if (!next) setShown(false);
            }}
          >
            <NestedItem onClick={action}>First</NestedItem>
          </DropdownOverlay>
        )}
      </UiStoreProvider>
    );
  }
  await render(<Unmounting />);
  await open(Entry.Dropdown, true);
  await first();
  await userEvent.keyboard("{Enter}");
  await expect.element(button("Open")).not.toBeInTheDocument();
  await expect.poll(() => action.mock.calls.length).toBe(1);
});

test("a controlled Dropdown its parent closes returns focus to the trigger", async () => {
  function Controlled() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
      <UiStoreProvider>
        <DropdownOverlay
          trigger={<button type="button">Open</button>}
          open={menuOpen}
          onOpenChange={setMenuOpen}
        >
          <NestedItem closeOnSelect={false} onClick={() => setMenuOpen(false)}>
            First
          </NestedItem>
        </DropdownOverlay>
      </UiStoreProvider>
    );
  }
  await render(<Controlled />);
  await open(Entry.Dropdown, true);
  await first();
  // The item stays open itself; the parent closes the menu through `open`.
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => menus().length).toBe(0);
  await expect.element(button("Open")).toHaveFocus();
});

test("Shift+Tab in a Dropdown submenu closes the whole menu and returns to the trigger", async () => {
  await render(
    <MenuFixture entry={Entry.Dropdown}>
      <NestedItem>First</NestedItem>
      <NestedMenu label="More">
        <NestedItem>Child</NestedItem>
      </NestedMenu>
    </MenuFixture>,
  );
  await open(Entry.Dropdown, true);
  await first("First");
  await userEvent.keyboard("{End}");
  await expect.element(item("More")).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(item("Child")).toHaveFocus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await expect.poll(() => document.querySelectorAll('[role="menu"]').length).toBe(0);
  await expect.element(button("Open")).toHaveFocus();
});

for (const entry of [Entry.Context, Entry.Canvas])
  for (const key of ["{Tab}", "{Shift>}{Tab}{/Shift}"])
    test(`${entry}: ${key} in a submenu keeps focus on the submenu entry`, async () => {
      await render(
        <MenuFixture entry={entry}>
          <NestedItem>First</NestedItem>
          <NestedMenu label="More">
            <NestedItem>Child</NestedItem>
          </NestedMenu>
        </MenuFixture>,
      );
      await open(entry);
      await first("First");
      await userEvent.keyboard("{End}");
      await expect.element(item("More")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(item("Child")).toHaveFocus();
      await userEvent.keyboard(key);
      await tick();
      await expect.element(item("Child")).toHaveFocus();
      expect(menus()).toHaveLength(2);
    });

test("SelectTree's trigger is a tab stop with a button role, and Escape returns focus to it", async () => {
  await render(
    <UiStoreProvider>
      <button type="button">Before</button>
      <SelectTree
        value={[]}
        onChange={() => undefined}
        options={[{ label: "Leaf", value: "leaf" }]}
      />
    </UiStoreProvider>,
  );
  button("Before").element().focus();
  await userEvent.keyboard("{Tab}");
  const trigger = document.activeElement as HTMLElement;
  expect(trigger.getAttribute("role")).toBe("button");
  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => menus().length).toBe(1);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => menus().length).toBe(0);
  await expect.element(trigger).toHaveFocus();
});

test("a canvas overlay its own selection re-invokes opens again", async () => {
  const reinvoke = () => useTooltipStore.getState().showTooltip("menu-decisions-canvas", "click");
  await render(
    <MenuFixture entry={Entry.Click}>
      <NestedItem onClick={reinvoke}>Again</NestedItem>
    </MenuFixture>,
  );
  await open(Entry.Click);
  await item("Again").click();
  // The closing popup unmounts and the re-invocation renders a fresh, open one.
  await expect.poll(() => menus().length).toBe(1);
  await expect.element(item("Again")).toBeVisible();
  expect(useTooltipStore.getState().visibility.get("menu-decisions-canvas")?.visible).toBe(true);
});

test("a canvas overlay whose selected action throws is still dismissed in the store", async () => {
  const swallow = (event: ErrorEvent) => {
    if (event.message.includes("selection failed")) event.preventDefault();
  };
  window.addEventListener("error", swallow);
  try {
    await render(
      <MenuFixture entry={Entry.Canvas}>
        <NestedItem
          onClick={() => {
            throw new Error("selection failed");
          }}
        >
          Fails
        </NestedItem>
      </MenuFixture>,
    );
    await open(Entry.Canvas);
    await item("Fails").click();
    await expect.poll(() => menus().length).toBe(0);
    await expect
      .poll(() => useTooltipStore.getState().visibility.get("menu-decisions-canvas")?.visible)
      .toBe(false);
  } finally {
    window.removeEventListener("error", swallow);
  }
});

for (const entry of [Entry.Dropdown, Entry.Context])
  test(`${entry}: a pointer open focuses the popup, not its scrolling viewport`, async () => {
    // A short viewport makes the menu's content overflow and scroll.
    await page.viewport(800, 240);
    await render(
      <MenuFixture entry={entry}>
        {Array.from({ length: 20 }, (_, index) => (
          <NestedItem key={index}>{`Entry ${String(index + 1)}`}</NestedItem>
        ))}
      </MenuFixture>,
    );
    await open(entry);
    const popup = document.querySelector<HTMLElement>('[role="menu"]')!;
    const viewport = popup.querySelector<HTMLElement>("[data-scroll-area-viewport]")!;
    await expect.poll(() => viewport.scrollHeight > viewport.clientHeight).toBe(true);
    await expect.element(popup).toHaveFocus();
    expect(viewport.getAttribute("tabindex")).toBe("-1");
    expect(getComputedStyle(popup).outlineStyle).toBe("none");
  });
