import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { UiStoreProvider } from "../context/ui-store-provider";
import { useAddToast } from "../hooks/use-add-toast";
import { ToggleGroup } from "../inputs/toggle-group";
import { NestedItem } from "../nested-elements/item";
import { Dialog as DialogOverlay } from "./dialog";
import { Dropdown as DropdownOverlay } from "./dropdown";
import { Modal as ModalOverlay } from "./modal";
import { Popover as PopoverOverlay } from "./popover";
import { SidebarModal } from "./sidebar-modal";
import { ToastManager } from "./toast";
import { Tooltip } from "./tooltip";
import { TooltipHost } from "./tooltip-3d/tooltip-host";
import { TooltipProvider } from "./tooltip-3d/tooltip-provider";
import { useTooltipStore } from "./tooltip-3d/store";

enum Surface {
  Modal = "Modal",
  Dialog = "Dialog",
  Sidebar = "SidebarModal",
  Popover = "Popover",
  Canvas = "canvas popover",
}

const button = (name: string) => page.getByRole("button", { name, exact: true });
const tooltip = () => document.querySelector('.tooltip-content[data-state="open"]');
const surface = () =>
  document
    .querySelector("[data-surface-content]")
    ?.closest(
      '[data-state="open"], [role="alertdialog"]:not([data-closed]), [role="dialog"]:not([data-closed]):not([data-state="closed"])',
    ) ?? null;
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const settle = async () => {
  for (let i = 0; i < 4; i++)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

function CanvasSurface({ children }: { children: ReactNode }) {
  useEffect(() => {
    const store = useTooltipStore.getState();
    store.registerAnchor({
      id: "surface-canvas",
      content: children,
      mode: "click",
      interactive: true,
      positioning: {},
      screenPosition: { x: 200, y: 220 },
    });
    return () => store.unregisterAnchor("surface-canvas");
  }, [children]);
  return (
    <TooltipProvider>
      <TooltipHost>
        <button
          type="button"
          onClick={() => useTooltipStore.getState().showTooltip("surface-canvas", "click")}
        >
          Open surface
        </button>
      </TooltipHost>
    </TooltipProvider>
  );
}

function SurfaceFixture({ kind, children }: { kind: Surface; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const content = <div data-surface-content="">{children}</div>;
  const trigger = (
    <button type="button" onClick={() => setOpen(true)}>
      Open surface
    </button>
  );
  if (kind === Surface.Canvas) return <CanvasSurface>{content}</CanvasSurface>;
  if (kind === Surface.Popover)
    return (
      <PopoverOverlay trigger={<button type="button">Open surface</button>}>
        {content}
      </PopoverOverlay>
    );
  return (
    <>
      {trigger}
      {kind === Surface.Modal ? (
        <ModalOverlay open={open} onStateChange={setOpen} title="Sample surface">
          {content}
        </ModalOverlay>
      ) : kind === Surface.Dialog ? (
        <DialogOverlay
          open={open}
          onStateChange={setOpen}
          title="Sample surface"
          onCancel={() => setOpen(false)}
        >
          {content}
        </DialogOverlay>
      ) : (
        <SidebarModal
          open={open}
          onStateChange={setOpen}
          title="Sample surface"
          tabs={[{ key: "main", title: "Main", content }]}
        />
      )}
    </>
  );
}

async function openSurface() {
  await button("Open surface").click();
  await expect.poll(surface).not.toBeNull();
  await settle();
}

beforeEach(async () => {
  await page.viewport(1280, 900);
});

afterEach(() => vi.restoreAllMocks());

test("opening a hovered tooltip closes the keyboard-opened tooltip", async () => {
  await render(
    <>
      <Tooltip content="Explanation A">
        <button type="button">A</button>
      </Tooltip>
      <Tooltip content="Explanation B">
        <button type="button">B</button>
      </Tooltip>
    </>,
  );
  await userEvent.keyboard("{Tab}");
  await expect.element(button("A")).toHaveFocus();
  await expect.poll(() => tooltip()?.textContent).toBe("Explanation A");
  await userEvent.hover(button("B"));
  await delay(1200);
  expect(
    Array.from(
      document.querySelectorAll('.tooltip-content[data-state="open"]'),
      (node) => node.textContent,
    ),
  ).toEqual(["Explanation B"]);
});

test("Escape on an unrelated input closes a hover tooltip and reaches the input once", async () => {
  const keydown = vi.fn();
  await render(
    <>
      <input aria-label="Editor" onKeyDown={keydown} />
      <Tooltip content="Hover explanation">
        <button type="button">Hint</button>
      </Tooltip>
    </>,
  );
  await userEvent.click(page.getByRole("textbox", { name: "Editor" }));
  await userEvent.hover(button("Hint"));
  await expect.poll(tooltip).not.toBeNull();
  keydown.mockClear();
  await userEvent.keyboard("{Escape}");
  await expect.poll(tooltip).toBeNull();
  expect(keydown).toHaveBeenCalledTimes(1);
  expect(keydown.mock.calls[0][0].defaultPrevented).toBe(true);
  await expect.element(page.getByRole("textbox", { name: "Editor" })).toHaveFocus();
});

for (const kind of Object.values(Surface))
  test(`a tooltip's Escape preserves its ${kind}; the next Escape closes it`, async () => {
    await render(
      <UiStoreProvider>
        <SurfaceFixture kind={kind}>
          <button type="button">Before hint</button>
          <Tooltip content="Inner explanation">
            <button type="button">Inner hint</button>
          </Tooltip>
        </SurfaceFixture>
      </UiStoreProvider>,
    );
    await openSurface();
    // Enter by an actual Tab so the browser gives the hint focus-visible state.
    button("Before hint").element().focus();
    await userEvent.keyboard("{Tab}");
    await expect.element(button("Inner hint")).toHaveFocus();
    await expect.poll(tooltip).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(tooltip).toBeNull();
    expect(surface()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(surface).toBeNull();
  });

function Roving({ value = "a" }: { value?: string }) {
  return (
    <ToggleGroup
      visuals="labels"
      value={value}
      onChange={() => {}}
      options={[
        { label: "Alpha", value: "a" },
        { label: "Beta", value: "b" },
        { label: "Gamma", value: "c" },
      ]}
    />
  );
}

test("Tab past a roving last control closes the canvas popover", async () => {
  await render(
    <SurfaceFixture kind={Surface.Canvas}>
      <button type="button">First</button>
      <Roving />
    </SurfaceFixture>,
  );
  await openSurface();
  await expect.element(button("First")).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("radio", { name: "Alpha" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.poll(surface).toBeNull();
  await expect.element(button("Open surface")).toHaveFocus();
});

test("Shift+Tab before a roving first control closes the canvas popover", async () => {
  await render(
    <SurfaceFixture kind={Surface.Canvas}>
      <Roving value="b" />
      <button type="button">Last</button>
    </SurfaceFixture>,
  );
  await openSurface();
  await expect.element(page.getByRole("radio", { name: "Beta" })).toHaveFocus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await expect.poll(surface).toBeNull();
  await expect.element(button("Open surface")).toHaveFocus();
});

test("Tab past a native radio group's checked radio closes the canvas popover", async () => {
  // A named radio group is one Tab stop, its checked radio, so the unchecked radio after it
  // is in the DOM but is not the popover's last stop.
  await render(
    <SurfaceFixture kind={Surface.Canvas}>
      <button type="button">First</button>
      <input type="radio" name="speed" aria-label="Slow" defaultChecked />
      <input type="radio" name="speed" aria-label="Fast" />
    </SurfaceFixture>,
  );
  await openSurface();
  await expect.element(button("First")).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("radio", { name: "Slow" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.poll(surface).toBeNull();
  await expect.element(button("Open surface")).toHaveFocus();
});

function AddNotification() {
  const add = useAddToast();
  useEffect(
    () =>
      add({
        id: "surface-toast",
        title: "Sample notification",
        clipboardContent: "Details",
        dismiss: 60000,
      }),
    [add],
  );
  return null;
}

for (const kind of [Surface.Popover, Surface.Canvas]) {
  async function notificationsFixture() {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await render(
      <UiStoreProvider>
        <ToastManager>
          <AddNotification />
          <SurfaceFixture kind={kind}>
            <button type="button">First</button>
          </SurfaceFixture>
        </ToastManager>
      </UiStoreProvider>,
    );
    await expect.element(page.getByText("Sample notification", { exact: true })).toBeVisible();
    await expect
      .poll(() => getComputedStyle(button("Copy details").element().closest("li")!).transform)
      .toBe("none");
    await openSurface();
    await expect.element(button("First")).toHaveFocus();
  }

  test(`${kind}: a real toast button click keeps the popup open after focus moves out`, async () => {
    await notificationsFixture();
    const focused = vi.fn();
    button("Copy details").element().addEventListener("focus", focused, { once: true });
    await button("Copy details").click();
    // Copy can temporarily disable its button while the clipboard promise settles.
    // Observe the real focus move that precedes activation rather than its final focus.
    expect(focused).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledExactlyOnceWith("Details");
    await settle();
    expect(surface()).not.toBeNull();
  });

  test(`${kind}: focus into notifications keeps the popup open, and Escape closes only the popup`, async () => {
    await notificationsFixture();
    button("Copy details").element().focus();
    await settle();
    await expect.element(button("Copy details")).toHaveFocus();
    expect(surface()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(surface).toBeNull();
    // Past the toast's exit animation, so a toast that the same Escape dismissed is gone.
    await new Promise((resolve) => setTimeout(resolve, 800));
    await expect.element(page.getByText("Sample notification", { exact: true })).toBeVisible();
    // A second Escape reaches the toast, showing the first was intercepted for the popup.
    button("Copy details").element().focus();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(page.getByText("Sample notification", { exact: true }))
      .not.toBeInTheDocument();
  });
}

test("Popover accepts nativeButton=false for a custom div trigger", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  function DivTrigger(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} role="button" tabIndex={0} />;
  }
  try {
    await render(
      <PopoverOverlay nativeButton={false} trigger={<DivTrigger>Custom trigger</DivTrigger>}>
        <button type="button">Action</button>
      </PopoverOverlay>,
    );
    await button("Custom trigger").click();
    await expect.element(button("Action")).toBeVisible();
    expect(error).not.toHaveBeenCalled();
  } finally {
    error.mockRestore();
  }
});

test("canvas popover navigation keys stay out of TooltipHost ancestors", async () => {
  const ancestor = vi.fn();
  await render(
    <div role="grid" tabIndex={-1} onKeyDown={ancestor}>
      <SurfaceFixture kind={Surface.Canvas}>
        <button type="button">First</button>
      </SurfaceFixture>
    </div>,
  );
  await openSurface();
  await expect.element(button("First")).toHaveFocus();
  ancestor.mockClear();
  await userEvent.keyboard(
    "{ArrowUp}{ArrowDown}{ArrowLeft}{ArrowRight}{Home}{End}{PageUp}{PageDown}",
  );
  expect(ancestor).not.toHaveBeenCalled();
  // The control: an ordinary key still reaches the ancestor, so the silence above is
  // the navigation keys being kept in the popup, not the listener being unreachable.
  await userEvent.keyboard("x");
  expect(ancestor.mock.calls.map(([event]) => (event as KeyboardEvent).key)).toContain("x");
});

test("a tooltip held open keeps its Escape after a newer tooltip closes", async () => {
  await render(
    <UiStoreProvider>
      <SurfaceFixture kind={Surface.Modal}>
        {/* Held open the way Snippet holds "Copied!": its close requests are refused. */}
        <Tooltip content="Copied!" controlledState={[true, () => {}]}>
          <button type="button">Held hint</button>
        </Tooltip>
        <button type="button">Before hint</button>
        <Tooltip content="Newer explanation">
          <button type="button">Newer hint</button>
        </Tooltip>
        <button type="button">After hint</button>
      </SurfaceFixture>
    </UiStoreProvider>,
  );
  await openSurface();
  const openTexts = () =>
    [...document.querySelectorAll('.tooltip-content[data-state="open"]')].map(
      (element) => element.textContent,
    );
  await expect.poll(openTexts).toEqual(["Copied!"]);
  button("Before hint").element().focus();
  await userEvent.keyboard("{Tab}");
  await expect.poll(openTexts).toContain("Newer explanation");
  await userEvent.keyboard("{Tab}");
  await expect.poll(openTexts).toEqual(["Copied!"]);
  // The held tooltip is still the topmost layer, so it takes the Escape and the Modal stays.
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(surface()).not.toBeNull();
});

test("Escape from a toast closes only the topmost of nested overlays", async () => {
  vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  const menu = () => document.querySelector('[role="menu"][data-state="open"]');
  await render(
    <UiStoreProvider>
      <ToastManager>
        <AddNotification />
        <SurfaceFixture kind={Surface.Popover}>
          <DropdownOverlay trigger={<button type="button">Open menu</button>}>
            <NestedItem>Entry</NestedItem>
          </DropdownOverlay>
        </SurfaceFixture>
      </ToastManager>
    </UiStoreProvider>,
  );
  await expect.element(page.getByText("Sample notification", { exact: true })).toBeVisible();
  await expect
    .poll(() => getComputedStyle(button("Copy details").element().closest("li")!).transform)
    .toBe("none");
  await openSurface();
  await button("Open menu").click();
  await expect.poll(menu).not.toBeNull();
  button("Copy details").element().focus();
  await settle();
  expect(menu()).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  await expect.poll(menu).toBeNull();
  // The Popover beneath the menu, and the toast, are untouched by that Escape.
  await delay(800);
  expect(surface()).not.toBeNull();
  await expect.element(page.getByText("Sample notification", { exact: true })).toBeVisible();
});

test("Tab reaches a contenteditable editor in the canvas popover before leaving it", async () => {
  await render(
    <SurfaceFixture kind={Surface.Canvas}>
      <button type="button">First</button>
      <div
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Notes"
        style={{ minHeight: 20, minWidth: 80 }}
      />
    </SurfaceFixture>,
  );
  await openSurface();
  await expect.element(button("First")).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("textbox", { name: "Notes" })).toHaveFocus();
  expect(surface()).not.toBeNull();
  await userEvent.keyboard("{Tab}");
  await expect.poll(surface).toBeNull();
  await expect.element(button("Open surface")).toHaveFocus();
});
