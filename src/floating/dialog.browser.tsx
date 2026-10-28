import { useState } from "react";
import { flushSync } from "react-dom";
import { beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Result } from "@semio/utils";
import "../test-stylesheet";
import { ActionMenu } from "./action-menu";
import { Dialog, type DialogProps } from "./dialog";
import { Modal } from "./modal";
import { SidebarModal } from "./sidebar-modal";

function Fixture(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open confirmation
      </button>
      <Dialog
        title="Confirm action"
        description="Review the action."
        onCancel={() => {}}
        onSubmit={() => {}}
        {...props}
        open={open}
        onStateChange={(next) => {
          props.onStateChange?.(next);
          setOpen(next);
        }}
      >
        {props.children ?? <p>Confirmation body</p>}
      </Dialog>
    </>
  );
}

const popup = () => page.getByRole("alertdialog", { name: "Confirm action", exact: true });
const button = (name: string) => page.getByRole("button", { name, exact: true });

async function openDialog(props: Partial<DialogProps> = {}) {
  const view = await render(<Fixture {...props} />);
  await button("Open confirmation").click();
  await expect.element(popup()).toBeVisible();
  return view;
}

async function settle() {
  document.getAnimations().forEach((animation) => animation.finish());
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

async function pressDimmedArea() {
  // The full-screen viewport receives the click above the painted backdrop.
  const viewport = popup().element().parentElement!;
  await userEvent.click(viewport, { position: { x: 8, y: 8 } });
}

beforeEach(async () => {
  await page.viewport(1280, 800);
});

test("alertdialog is labelled by its title and described by its description", async () => {
  await openDialog();
  const element = popup().element();
  const title = page.getByRole("heading", { name: "Confirm action", exact: true }).element();
  expect(element.getAttribute("aria-labelledby")).toBe(title.id);
  expect(document.getElementById(element.getAttribute("aria-describedby")!)?.textContent).toBe(
    "Review the action.",
  );
});

test("initial focus belongs to the closing footer Cancel", async () => {
  await openDialog();
  await expect.element(button("Cancel")).toHaveFocus();
});

test("initial focus belongs to X without a footer Cancel", async () => {
  await openDialog({ onCancel: undefined });
  await expect.element(button("Close")).toHaveFocus();
});

test("initial focus belongs to X when footer Cancel stays open", async () => {
  await openDialog({ closeOnCancelClick: false });
  await expect.element(button("Close")).toHaveFocus();
});

test("a custom footer replaces standard actions, keeps the dialog open and focuses X", async () => {
  const cancel = vi.fn();
  const submit = vi.fn();
  const action = vi.fn();
  const change = vi.fn();
  await openDialog({
    onCancel: cancel,
    onSubmit: submit,
    onStateChange: change,
    footer: (
      <button type="button" onClick={action}>
        Copy report
      </button>
    ),
  });
  await expect.element(button("Copy report")).toBeVisible();
  await expect.element(button("Cancel")).not.toBeInTheDocument();
  await expect.element(button("Submit")).not.toBeInTheDocument();
  await expect.element(button("Close")).toHaveFocus();
  await button("Copy report").click();
  expect(action).toHaveBeenCalledOnce();
  expect(cancel).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
  await expect.element(popup()).toBeVisible();
});

test.each([1280, 480])(
  "medium size at viewport width %s caps the popup and scrolls only the body",
  async (width) => {
    await page.viewport(width, 800);
    await openDialog({
      size: "medium",
      children: <div style={{ height: "200vh" }}>Tall confirmation body</div>,
    });
    await settle();
    const surface = popup().element();
    const rect = surface.getBoundingClientRect();
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    expect(rect.width).toBeCloseTo(Math.min(36 * rem, innerWidth - rem), 0);
    expect(rect.height).toBeLessThanOrEqual(innerHeight - rem + 1);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(innerWidth);
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.bottom).toBeLessThanOrEqual(innerHeight);

    const body = page.getByText("Tall confirmation body", { exact: true }).element().parentElement!;
    const header = surface.firstElementChild!;
    const footer = surface.lastElementChild!;
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    expect(getComputedStyle(body).overflowY).toBe("auto");
    const headerRect = header.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    for (const section of [headerRect, footerRect]) {
      expect(section.height).toBeGreaterThan(0);
      expect(section.top).toBeGreaterThanOrEqual(rect.top);
      expect(section.bottom).toBeLessThanOrEqual(rect.bottom);
      expect(section.left).toBeGreaterThanOrEqual(rect.left);
      expect(section.right).toBeLessThanOrEqual(rect.right);
    }
    await expect.element(button("Close")).toBeVisible();
    await expect.element(button("Cancel")).toBeVisible();
    await expect.element(button("Submit")).toBeVisible();
    body.scrollTop = body.scrollHeight;
    await settle();
    expect(body.scrollTop).toBeGreaterThan(0);
    expect(header.getBoundingClientRect().top).toBe(headerRect.top);
    expect(footer.getBoundingClientRect().bottom).toBe(footerRect.bottom);
  },
);

test("default content size keeps a short dialog narrower than 36rem", async () => {
  await openDialog();
  await settle();
  const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const width = popup().element().getBoundingClientRect().width;
  expect(width).toBeGreaterThan(0);
  expect(width).toBeLessThan(36 * rem);
});

test("a footer ActionMenu supports pointer opening, keyboard reach, selection and isolated Escape", async () => {
  const select = vi.fn(() => Result.Ok<string, string>("Report copied"));
  const otherSelect = vi.fn(() => Result.Ok<void, string>(undefined));
  const feedback = vi.fn();
  const change = vi.fn();
  await openDialog({
    onCancel: undefined,
    onSubmit: undefined,
    onStateChange: change,
    footer: (
      <ActionMenu
        menu={{
          icon: "copy",
          label: "Report actions",
          items: [
            { id: "copy", label: "Copy report", onSelect: select },
            { id: "download", label: "Download report", onSelect: otherSelect },
          ],
        }}
        side="top"
        onFeedback={feedback}
      />
    ),
  });
  const surface = popup().element();
  const copy = page.getByRole("menuitem", { name: "Copy report", exact: true });
  const download = page.getByRole("menuitem", { name: "Download report", exact: true });
  const expectDialogOpen = async () => {
    // A modal Radix menu can hide the dialog from accessibility queries while open.
    await expect.element(surface).toBeVisible();
    expect(surface.getAttribute("data-state")).toBe("open");
    expect(change).not.toHaveBeenCalled();
  };

  await button("Report actions").click();
  await expect.element(copy).toBeVisible();
  await expect.element(download).toBeVisible();
  expect(document.body.contains(copy.element())).toBe(true);
  expect(surface.contains(copy.element())).toBe(false);
  await expectDialogOpen();
  await userEvent.keyboard("{Home}");
  await expect.element(copy).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(download).toHaveFocus();
  await expectDialogOpen();
  await copy.click();
  await expect.element(copy).not.toBeInTheDocument();
  await expect.poll(() => feedback.mock.calls.at(-1)?.[0]).toEqual({
    message: "Report copied",
    failed: false,
  });
  expect(select).toHaveBeenCalledOnce();
  expect(otherSelect).not.toHaveBeenCalled();
  await expectDialogOpen();

  await button("Report actions").click();
  await expect.element(copy).toBeVisible();
  await userEvent.keyboard("{Home}");
  await expect.element(copy).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(copy).not.toBeInTheDocument();
  await expect.element(download).not.toBeInTheDocument();
  await expect.element(button("Report actions")).toHaveFocus();
  await expect.element(popup()).toBeVisible();
  await expectDialogOpen();
  expect(select).toHaveBeenCalledOnce();
});

test("closing returns focus to the previously focused opener", async () => {
  await openDialog();
  await button("Cancel").click();
  await expect.element(popup()).not.toBeInTheDocument();
  await expect.element(button("Open confirmation")).toHaveFocus();
});

test("Escape requests one close", async () => {
  const change = vi.fn();
  await openDialog({ onStateChange: change });
  await userEvent.keyboard("{Escape}");
  await expect.element(popup()).not.toBeInTheDocument();
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
});

test("dismissDisabled vetoes Escape", async () => {
  const change = vi.fn();
  await openDialog({ onStateChange: change, dismissDisabled: true });
  await userEvent.keyboard("{Escape}");
  await expect.element(popup()).toBeVisible();
  expect(change).not.toHaveBeenCalled();
});

test("X closes without invoking onCancel", async () => {
  const cancel = vi.fn();
  const change = vi.fn();
  await openDialog({ onCancel: cancel, onStateChange: change });
  await button("Close").click();
  await expect.element(popup()).not.toBeInTheDocument();
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
  expect(cancel).not.toHaveBeenCalled();
});

test("dismissDisabled disables X", async () => {
  await openDialog({ dismissDisabled: true });
  await expect.element(button("Close")).toBeDisabled();
});

enum Action {
  Cancel = "Cancel",
  Submit = "Submit",
}

for (const action of Object.values(Action)) {
  const handlerProp = action === Action.Cancel ? "onCancel" : "onSubmit";
  const closeProp = action === Action.Cancel ? "closeOnCancelClick" : "closeOnSubmitClick";
  const disabledProp = action === Action.Cancel ? "cancelDisabled" : "submitDisabled";

  test.each([undefined, true, false])(
    `${action}: ${closeProp}=%s controls closing`,
    async (close) => {
      const handler = vi.fn();
      const change = vi.fn();
      await openDialog({ [handlerProp]: handler, [closeProp]: close, onStateChange: change });
      await button(action).click();
      expect(handler).toHaveBeenCalledOnce();
      expect(change.mock.calls).toEqual(close === false ? [] : [[false]]);
      if (close === false) await expect.element(popup()).toBeVisible();
      else await expect.element(popup()).not.toBeInTheDocument();
    },
  );

  test(`${action}: dismissDisabled permits the action and vetoes closing`, async () => {
    const handler = vi.fn();
    const change = vi.fn();
    await openDialog({ [handlerProp]: handler, dismissDisabled: true, onStateChange: change });
    await button(action).click();
    expect(handler).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    await expect.element(popup()).toBeVisible();
  });

  test(`${action}: its disabled prop disables the footer action`, async () => {
    await openDialog({ [disabledProp]: true });
    await expect.element(button(action)).toBeDisabled();
  });
}

test("overlay dismissal defaults to disabled", async () => {
  const change = vi.fn();
  await openDialog({ onStateChange: change });
  await pressDimmedArea();
  await expect.element(popup()).toBeVisible();
  expect(change).not.toHaveBeenCalled();
});

test("opted-in overlay click requests one close", async () => {
  const change = vi.fn();
  await openDialog({ closeOnOverlayClick: true, onStateChange: change });
  await pressDimmedArea();
  await expect.element(popup()).not.toBeInTheDocument();
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
});

test("clicking inside the surface does not request overlay dismissal", async () => {
  const change = vi.fn();
  await openDialog({ closeOnOverlayClick: true, onStateChange: change });
  await page.getByText("Confirmation body", { exact: true }).click();
  await expect.element(popup()).toBeVisible();
  expect(change).not.toHaveBeenCalled();
});

test("dismissDisabled vetoes opted-in overlay dismissal", async () => {
  const change = vi.fn();
  await openDialog({ closeOnOverlayClick: true, dismissDisabled: true, onStateChange: change });
  await pressDimmedArea();
  await expect.element(popup()).toBeVisible();
  expect(change).not.toHaveBeenCalled();
});

test("portalContainer contains the dialog surface", async () => {
  const container = document.createElement("section");
  document.body.append(container);
  const view = await openDialog({ portalContainer: container });
  try {
    expect(container.contains(popup().element())).toBe(true);
  } finally {
    await view.unmount();
    container.remove();
  }
});

test("popup data-state selects the 300ms entrance animation", async () => {
  await openDialog();
  const surface = popup().element();
  expect(surface.getAttribute("data-state")).toBe("open");
  expect(getComputedStyle(surface).animationName).toBe("slideUpAndFade");
  expect(getComputedStyle(surface).animationDuration).toBe("0.3s");
});

test("closing unmounts the surface immediately without an exit animation", async () => {
  await openDialog();
  await settle();
  const surface = popup().element();
  expect(surface.isConnected).toBe(true);
  // Flush the controlled update so this assertion cannot wait through an exit animation.
  flushSync(() => (button("Close").element() as HTMLButtonElement).click());
  expect(surface.isConnected).toBe(false);
});

function DialogInModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setModalOpen(true)}>
        Open settings
      </button>
      <Modal open={modalOpen} onStateChange={setModalOpen} title="Settings">
        <button type="button" onClick={() => setDialogOpen(true)}>
          Delete item
        </button>
        <Dialog
          open={dialogOpen}
          onStateChange={setDialogOpen}
          title="Confirm action"
          description="Review the action."
          onCancel={() => {}}
          onSubmit={() => {}}
        />
      </Modal>
    </>
  );
}

/** Full-viewport, filled, fixed layers: what dims the page behind open dialogs. */
function dimmingLayers() {
  return Array.from(document.querySelectorAll("body *")).filter((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.position === "fixed" &&
      rect.width === innerWidth &&
      rect.height === innerHeight &&
      style.backgroundColor !== "rgba(0, 0, 0, 0)"
    );
  });
}

async function openDialogInModal() {
  await render(<DialogInModal />);
  await button("Open settings").click();
  await expect.element(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  await button("Delete item").click();
  await expect.element(popup()).toBeVisible();
  await settle();
}

test("a Dialog opened from a Modal dims the Modal with its own backdrop", async () => {
  await openDialogInModal();
  // One layer for the Modal, one for the Dialog above it.
  expect(dimmingLayers()).toHaveLength(2);
});

test("Escape in a Dialog opened from a Modal closes only the Dialog", async () => {
  await openDialogInModal();
  await userEvent.keyboard("{Escape}");
  await expect.element(popup()).not.toBeInTheDocument();
  await expect.element(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  await expect.element(button("Delete item")).toHaveFocus();
});

enum Inner {
  PlainModal = "Modal",
  Sidebar = "SidebarModal",
}

/** A `Modal` or `SidebarModal` opened from inside a `Dialog`'s body. */
function ModalInDialog({ inner }: { inner: Inner }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setDialogOpen(true)}>
        Open confirmation
      </button>
      <Dialog
        open={dialogOpen}
        onStateChange={setDialogOpen}
        title="Confirm action"
        description="Review the action."
        onCancel={() => {}}
      >
        <button type="button" onClick={() => setInnerOpen(true)}>
          Edit details
        </button>
        {inner === Inner.PlainModal ? (
          <Modal open={innerOpen} onStateChange={setInnerOpen} title="Details">
            <p>Details body</p>
          </Modal>
        ) : (
          <SidebarModal
            open={innerOpen}
            onStateChange={setInnerOpen}
            title="Details"
            tabs={[{ key: "general", title: "General", content: <p>Details body</p> }]}
          />
        )}
      </Dialog>
    </>
  );
}

function ModalInModal() {
  const [outerOpen, setOuterOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOuterOpen(true)}>
        Open settings
      </button>
      <Modal open={outerOpen} onStateChange={setOuterOpen} title="Settings">
        <button type="button" onClick={() => setInnerOpen(true)}>
          Edit details
        </button>
        <Modal open={innerOpen} onStateChange={setInnerOpen} title="Details">
          <p>Details body</p>
        </Modal>
      </Modal>
    </>
  );
}

/** Every dimming layer is painted at full strength once its entrance has finished. */
function expectDimming(count: number) {
  const layers = dimmingLayers();
  expect(layers).toHaveLength(count);
  for (const layer of layers) expect(getComputedStyle(layer).opacity).toBe("1");
}

test.each(Object.values(Inner))(
  "a %s opened from a Dialog dims the Dialog with its own backdrop",
  async (inner) => {
    await render(<ModalInDialog inner={inner} />);
    await button("Open confirmation").click();
    await expect.element(popup()).toBeVisible();
    await settle();
    expectDimming(1);
    await button("Edit details").click();
    await expect.element(page.getByText("Details body", { exact: true })).toBeVisible();
    await settle();
    // One layer for the Dialog, one for the modal above it.
    expectDimming(2);
  },
);

test("a Modal opened from a Modal adds no second backdrop", async () => {
  await render(<ModalInModal />);
  await button("Open settings").click();
  await expect.element(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  await button("Edit details").click();
  await expect.element(page.getByRole("dialog", { name: "Details", exact: true })).toBeVisible();
  await settle();
  // Base UI draws one backdrop for nested modals, and so does this package.
  expectDimming(1);
});

test("a Modal opened from a Modal inside a Dialog adds no third backdrop", async () => {
  function Triple() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [outerOpen, setOuterOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setDialogOpen(true)}>
          Open confirmation
        </button>
        <Dialog
          open={dialogOpen}
          onStateChange={setDialogOpen}
          title="Confirm action"
          onCancel={() => {}}
        >
          <button type="button" onClick={() => setOuterOpen(true)}>
            Open settings
          </button>
          <Modal open={outerOpen} onStateChange={setOuterOpen} title="Settings">
            <button type="button" onClick={() => setInnerOpen(true)}>
              Edit details
            </button>
            <Modal open={innerOpen} onStateChange={setInnerOpen} title="Details">
              <p>Details body</p>
            </Modal>
          </Modal>
        </Dialog>
      </>
    );
  }
  await render(<Triple />);
  await button("Open confirmation").click();
  await expect.element(popup()).toBeVisible();
  await button("Open settings").click();
  await expect.element(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  await button("Edit details").click();
  await expect.element(page.getByRole("dialog", { name: "Details", exact: true })).toBeVisible();
  await settle();
  // The Dialog's and the outer Modal's; the inner Modal shares the outer one's.
  expectDimming(2);
});
