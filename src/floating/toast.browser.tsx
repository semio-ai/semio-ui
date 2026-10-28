import { Result } from "@semio/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Toast } from "@base-ui/react/toast";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import type {} from "@vitest/browser-playwright";
import "../test-stylesheet";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastContext, ToastManager, type ToastData, type ToastState } from "./toast";
import { __getToastRetainedMetadataForTests } from "./toast-retained-state";
import { Dialog } from "./dialog";
import { Modal } from "./modal";

afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
});

function AddToast({ data }: { data: ToastData }) {
  const add = useAddToast();
  useEffect(() => add(data), [add, data]);
  return null;
}

async function mountToast(dismiss = 60000, overlay?: React.ReactNode) {
  await render(
    <ToastManager>
      <button type="button">Outside notifications</button>
      <AddToast data={{ id: "gesture", title: "Saved notification", dismiss }} />
      {overlay}
    </ToastManager>,
  );
  const toast = () => document.querySelector<HTMLElement>("li.card-overlay");
  await expect.poll(() => toast()).not.toBeNull();
  await expect.poll(() => getComputedStyle(toast()!).transform).toBe("none");
  return toast;
}

test("swiping a toast right past the threshold follows the pointer and dismisses it", async () => {
  const toast = await mountToast();
  const element = toast()!;
  const initialX = element.getBoundingClientRect().x;
  let travel = 0;
  let trackingError = 0;
  const aliases = new Set<string>();
  const observer = new MutationObserver(() => {
    for (const phase of ["move", "end"]) {
      for (const axis of ["x", "y"]) {
        const name = `--radix-toast-swipe-${phase}-${axis}`;
        if (getComputedStyle(element).getPropertyValue(name).trim() !== "") aliases.add(name);
      }
    }
    if (element.dataset.swipe === "move") {
      const displacement = element.getBoundingClientRect().x - initialX;
      travel = Math.max(travel, displacement);
      const expected = parseFloat(
        getComputedStyle(element).getPropertyValue("--toast-swipe-movement-x"),
      );
      trackingError = Math.max(trackingError, Math.abs(displacement - expected));
    }
  });
  observer.observe(element, { attributes: true });
  try {
    await userEvent.dragAndDrop(element, element, {
      sourcePosition: { x: 40, y: 20 },
      targetPosition: { x: 160, y: 20 },
      steps: 10,
    });
    expect(travel).toBeGreaterThan(50);
    expect(trackingError).toBeLessThan(1);
    await expect.poll(toast).toBeNull();
    expect([...aliases].sort()).toEqual([
      "--radix-toast-swipe-end-x",
      "--radix-toast-swipe-end-y",
      "--radix-toast-swipe-move-x",
      "--radix-toast-swipe-move-y",
    ]);
  } finally {
    observer.disconnect();
  }
});

test("a short right swipe returns the toast to its resting position", async () => {
  const toast = await mountToast();
  const element = toast()!;
  const initialX = element.getBoundingClientRect().x;
  await userEvent.dragAndDrop(element, element, {
    sourcePosition: { x: 40, y: 20 },
    targetPosition: { x: 60, y: 20 },
    steps: 5,
  });
  expect(toast()).toBe(element);
  expect(element.dataset.swipe).toBe("cancel");
  await expect.poll(() => element.getBoundingClientRect().x).toBeCloseTo(initialX, 0);
});

test("F8 focuses the notifications viewport", async () => {
  const toast = await mountToast();
  await userEvent.click(page.getByRole("button", { name: "Outside notifications" }));
  await userEvent.keyboard("{F8}");
  expect(document.activeElement).toBe(toast()!.parentElement);
  expect(toast()!.closest('[role="region"]')?.getAttribute("aria-label")).toBe(
    "Notifications (F8)",
  );
});

test.each([false, true])(
  "F6 preserves outside focus and the browser default (shift=%s)",
  async (shift) => {
    await mountToast();
    const outside = page.getByRole("button", { name: "Outside notifications", exact: true });
    await userEvent.click(outside);
    const events: KeyboardEvent[] = [];
    const record = (event: KeyboardEvent) => {
      if (event.key === "F6") events.push(event);
    };
    // A later listener on the same window still records a stopped capture event.
    window.addEventListener("keydown", record, true);
    try {
      await userEvent.keyboard(shift ? "{Shift>}{F6}{/Shift}" : "{F6}");
      expect(events).toHaveLength(1);
      expect(events[0].shiftKey).toBe(shift);
      expect(events[0].defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(outside.element());
    } finally {
      window.removeEventListener("keydown", record, true);
    }
  },
);

test("the toast keydown capture listener exists only while a toast is managed or mounted", async () => {
  function Controls() {
    const add = useAddToast();
    return (
      <button
        type="button"
        onClick={() => add({ id: "listener", title: "Listener notification", dismiss: 60000 })}
      >
        Add notification
      </button>
    );
  }
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  const captures = () =>
    add.mock.calls.filter(
      ([type, , options]) =>
        type === "keydown" &&
        (options === true || (typeof options === "object" && options.capture)),
    );
  try {
    await render(
      <ToastManager>
        <Controls />
      </ToastManager>,
    );
    await expect
      .element(page.getByRole("button", { name: "Add notification", exact: true }))
      .toBeVisible();
    expect(captures()).toHaveLength(0);

    await userEvent.click(page.getByRole("button", { name: "Add notification", exact: true }));
    await expect.element(page.getByText("Listener notification", { exact: true })).toBeVisible();
    await expect.poll(() => captures().length).toBe(1);
    const [, handler, options] = captures()[0];
    expect(
      remove.mock.calls.some(([type, listener]) => type === "keydown" && listener === handler),
    ).toBe(false);

    await userEvent.click(page.getByRole("button", { name: "dismiss", exact: true }));
    await expect.poll(() => document.querySelector("li.card-overlay")).toBeNull();
    await expect
      .poll(() =>
        remove.mock.calls.some(
          ([type, listener, capture]) =>
            type === "keydown" && listener === handler && capture === options,
        ),
      )
      .toBe(true);
    expect(captures()).toHaveLength(1);
  } finally {
    add.mockRestore();
    remove.mockRestore();
  }
});

test("hover pauses the timeout ring and leaving resumes dismissal", async () => {
  const toast = await mountToast(1000);
  await userEvent.hover(toast()!);
  const circle = toast()!.querySelectorAll("circle")[1];
  const paused = circle.style.strokeDashoffset;
  await new Promise((resolve) => setTimeout(resolve, 1100));
  expect(toast()).not.toBeNull();
  expect(circle.style.strokeDashoffset).toBe(paused);
  await userEvent.hover(page.getByRole("button", { name: "Outside notifications" }));
  await expect.poll(toast, { timeout: 2000 }).toBeNull();
});

test("keyboard focus pauses the timeout ring until focus leaves the viewport", async () => {
  const toast = await mountToast(1000);
  await userEvent.hover(page.getByRole("button", { name: "Outside notifications" }));
  await userEvent.keyboard("{F8}");
  const circle = toast()!.querySelectorAll("circle")[1];
  const paused = circle.style.strokeDashoffset;
  await new Promise((resolve) => setTimeout(resolve, 1100));
  expect(toast()).not.toBeNull();
  expect(circle.style.strokeDashoffset).toBe(paused);
  await userEvent.click(page.getByRole("button", { name: "Outside notifications" }));
  await expect.poll(toast, { timeout: 2000 }).toBeNull();
});

test("toast close stays clickable above a Dialog", async () => {
  const toast = await mountToast(
    60000,
    <Dialog open title="Confirmation" onStateChange={() => {}} />,
  );
  await userEvent.click(page.getByRole("button", { name: "dismiss", exact: true }));
  await expect.poll(toast).toBeNull();
  await expect.element(page.getByRole("alertdialog")).toBeVisible();
});

test("toast close stays clickable above a Modal", async () => {
  const toast = await mountToast(
    60000,
    <Modal open title="Editor" onStateChange={() => {}}>
      <p>Editor content</p>
    </Modal>,
  );
  await userEvent.click(page.getByRole("button", { name: "dismiss", exact: true }));
  await expect.poll(toast).toBeNull();
  await expect.element(page.getByRole("dialog")).toBeVisible();
});

test("toast parts keep list elements and accessible native button contracts", async () => {
  const toast = await mountToast();
  const element = toast()!;
  expect(element.tagName).toBe("LI");
  expect(element.dataset.state).toBe("open");
  for (const attribute of [
    "role",
    "aria-modal",
    "aria-labelledby",
    "aria-describedby",
    "aria-hidden",
  ]) {
    expect(element.getAttribute(attribute)).toBeNull();
  }
  const viewport = element.parentElement!;
  expect(viewport.tagName).toBe("OL");
  expect(viewport.getAttribute("role")).toBeNull();
  expect(viewport.getAttribute("aria-live")).toBeNull();
  expect(viewport.getAttribute("aria-label")).toBeNull();
  const title = page.getByText("Saved notification", { exact: true }).element();
  expect(title.parentElement!.tagName).toBe("DIV");
  expect(element.querySelector("p")!.parentElement!.tagName).toBe("DIV");
  const close = page.getByRole("button", { name: "dismiss", exact: true }).element();
  expect(close.tagName).toBe("BUTTON");
  expect(close.getAttribute("type")).toBe("button");
  expect(close.getAttribute("tabindex")).toBeNull();
  expect(close.getAttribute("aria-hidden")).toBeNull();
});

test("window blur pauses the toast glyph and focus resumes it", async () => {
  // A pointer left over the toast area by an earlier test would pause it on hover.
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  const toast = await mountToast();
  const glyph = () => toast()!.querySelector("svg + div svg")?.outerHTML;
  const running = glyph();
  expect(running).toBeUndefined();
  window.dispatchEvent(new FocusEvent("blur"));
  await expect.poll(glyph).toBeTruthy();
  window.dispatchEvent(new FocusEvent("focus"));
  await expect.poll(glyph).toBe(running);
});

/** The next animation frame, by which a frame callback has run. */
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

test("an expired toast asks once to be removed, so its exit re-renders no toast consumer", async () => {
  let renders = 0;
  let rendersAtRemoval: number | null = null;
  let listed = false;
  function Consumer() {
    const { toasts } = useContext(ToastContext);
    renders += 1;
    if (toasts.length > 0) listed = true;
    else if (listed && rendersAtRemoval === null) rendersAtRemoval = renders;
    return null;
  }
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <>
        <Consumer />
        <AddToast data={{ id: "expiring", title: "Saved", dismiss: 50 }} />
      </>
    </ToastManager>,
  );
  await expect.element(page.getByText("Saved", { exact: true })).toBeVisible();
  // Gone from the list, then gone from the page once its exit animation ends.
  await expect.poll(() => rendersAtRemoval, { timeout: 5000 }).not.toBeNull();
  await expect.element(page.getByText("Saved", { exact: true })).not.toBeInTheDocument();
  await nextFrame();
  expect(renders - rendersAtRemoval!).toBe(0);
});

test("removing a toast that is already gone leaves its consumers alone", async () => {
  let renders = 0;
  let removeToast: ((id: string) => void) | undefined;
  function Consumer() {
    removeToast = useContext(ToastContext).removeToast;
    renders += 1;
    return null;
  }
  await render(
    <ToastManager>
      <Consumer />
    </ToastManager>,
  );
  await nextFrame();
  const before = renders;
  removeToast!("absent");
  await nextFrame();
  await nextFrame();
  expect(renders).toBe(before);
});

test("a toast added again while it is leaving gets a fresh interval and still expires", async () => {
  const first = 1000;
  const second = 1500;
  let readdedAt: number | null = null;
  let removedAgainAt: number | null = null;
  function AddAgainOnRemoval() {
    const { toasts, addToast } = useContext(ToastContext);
    const [listed, setListed] = useState(false);
    useEffect(() => {
      if (toasts.length > 0) {
        setListed(true);
      } else if (listed && readdedAt === null) {
        // While the first one is still playing its exit animation.
        readdedAt = performance.now();
        addToast({ id: "repeated", title: "Saved", dismiss: second });
      } else if (readdedAt !== null && removedAgainAt === null) {
        removedAgainAt = performance.now();
      }
    }, [toasts, listed, addToast]);
    return null;
  }
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <>
        <AddAgainOnRemoval />
        <AddToast data={{ id: "repeated", title: "Saved", dismiss: first }} />
      </>
    </ToastManager>,
  );
  await expect.poll(() => readdedAt, { timeout: 5000 }).not.toBeNull();
  await expect.element(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect.poll(() => removedAgainAt, { timeout: 5000 }).not.toBeNull();
  // Listed for its own interval, not for what the first notification's clock left of
  // it (`second - first`). The bound sits halfway between the two.
  expect(removedAgainAt! - readdedAt!).toBeGreaterThan(second - first / 2);
  await expect.element(page.getByText("Saved", { exact: true })).not.toBeInTheDocument();
});

test("removing a toast that is already closing leaves the toast store alone", async () => {
  let seen: { id: string; transitionStatus?: string }[] = [];
  let api: ToastState | undefined;
  function StoreWatcher() {
    seen = Toast.useToastManager().toasts;
    return null;
  }
  function Api() {
    api = useContext(ToastContext);
    return null;
  }
  await render(
    <ToastManager>
      <StoreWatcher />
      <Api />
      <AddToast data={{ id: "closing", title: "Closing", dismiss: 60000 }} />
    </ToastManager>,
  );
  await expect.element(page.getByText("Closing", { exact: true })).toBeVisible();
  // Synchronously throughout, so the exit's own progress cannot change the store in
  // between: the toast is in the store, leaving, when it is removed again.
  flushSync(() => api!.removeToast("closing"));
  expect(seen.find((toast) => toast.id === "closing")?.transitionStatus).toBe("ending");
  const before = seen;
  flushSync(() => api!.removeToast("closing"));
  expect(seen).toBe(before);
});

test("a toast closed and added again in one event gets a fresh interval", async () => {
  const first = 1000;
  const second = 1500;
  let api: ToastState | undefined;
  function Api() {
    api = useContext(ToastContext);
    return null;
  }
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <Api />
      <AddToast data={{ id: "batched", title: "Batched", dismiss: first }} />
    </ToastManager>,
  );
  await expect.element(page.getByText("Batched", { exact: true })).toBeVisible();
  await new Promise((resolve) => setTimeout(resolve, first * 0.6));
  // One synchronous handler: no render sees the first notification leaving.
  const readdedAt = performance.now();
  api!.removeToast("batched");
  api!.addToast({ id: "batched", title: "Batched", dismiss: second });
  await expect.poll(() => api!.toasts.length, { timeout: 5000 }).toBe(0);
  // Its own interval, not what the first notification's clock left (`second - 0.6 *
  // first`). The bound sits between the two.
  expect(performance.now() - readdedAt).toBeGreaterThan(second - first * 0.3);
});

test("an expired toast's exit changes the toast store only a few times", async () => {
  let storeRenders = 0;
  let listed = false;
  let storeRendersAtRemoval: number | null = null;
  function StoreWatcher() {
    Toast.useToastManager();
    storeRenders += 1;
    return null;
  }
  function Consumer() {
    const { toasts } = useContext(ToastContext);
    if (toasts.length > 0) listed = true;
    else if (listed && storeRendersAtRemoval === null) storeRendersAtRemoval = storeRenders;
    return null;
  }
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <StoreWatcher />
      <Consumer />
      <AddToast data={{ id: "expiring-store", title: "Stored", dismiss: 50 }} />
    </ToastManager>,
  );
  await expect.poll(() => storeRendersAtRemoval, { timeout: 5000 }).not.toBeNull();
  await expect.element(page.getByText("Stored", { exact: true })).not.toBeInTheDocument();
  await nextFrame();
  // Marked ending, measured, released: a handful of changes, not one per frame of a
  // 200 ms exit.
  expect(storeRenders - storeRendersAtRemoval!).toBeLessThan(6);
});

test("pressing a leaving toast's close button again leaves the toast store alone", async () => {
  let seen: { id: string; transitionStatus?: string }[] = [];
  function StoreWatcher() {
    seen = Toast.useToastManager().toasts;
    return null;
  }
  await render(
    <ToastManager>
      <StoreWatcher />
      <AddToast data={{ id: "pressed", title: "Pressed", dismiss: 60000 }} />
    </ToastManager>,
  );
  const close = page.getByRole("button", { name: "dismiss", exact: true });
  await expect.element(close).toBeVisible();
  const button = close.element() as HTMLButtonElement;
  flushSync(() => button.click());
  expect(seen.find((toast) => toast.id === "pressed")?.transitionStatus).toBe("ending");
  const before = seen;
  flushSync(() => button.click());
  expect(seen).toBe(before);
});

async function showToast(data: Partial<ToastData> = {}) {
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <AddToast data={{ id: "test", title: "Save failed", dismiss: 60000, ...data }} />
      <button type="button">Outside toast</button>
    </ToastManager>,
  );
}

test("copies the exact optional payload without dismissing or displaying it", async () => {
  const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
  const payload = 'Error: save failed\n{"code":"unavailable","session":"anonymous"}';
  await showToast({ clipboardContent: payload });
  const copy = page.getByRole("button", { name: "Copy details", exact: true });
  await expect.element(copy).toBeVisible();
  const copyButton = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Copy details"]',
  )!;
  const closeButton = document.querySelector<HTMLButtonElement>('button[aria-label="dismiss"]')!;
  expect(copyButton.textContent).toBe("");
  expect(copyButton.getBoundingClientRect().right).toBeLessThan(
    closeButton.getBoundingClientRect().left,
  );
  expect(copyButton.getBoundingClientRect().top).toBe(closeButton.getBoundingClientRect().top);
  await page.getByRole("button", { name: "Copy details", exact: true }).click();
  expect(writeText).toHaveBeenCalledExactlyOnceWith(payload);
  await expect
    .element(page.getByText("Details copied to clipboard.", { exact: true }))
    .toBeInTheDocument();
  await expect
    .element(page.getByRole("button", { name: "Copy details", exact: true }))
    .toBeVisible();
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  expect(document.body.textContent).not.toContain(payload);
});

test("shows a retryable failure when clipboard access is refused", async () => {
  const writeText = vi
    .spyOn(navigator.clipboard, "writeText")
    .mockRejectedValueOnce(new Error("Clipboard denied"))
    .mockResolvedValueOnce();
  await showToast({ clipboardContent: "report" });
  await page.getByRole("button", { name: "Copy details", exact: true }).click();
  await expect.element(page.getByText("Could not copy. Try again.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Copy details", exact: true }).click();
  await expect
    .element(page.getByRole("button", { name: "Copy details", exact: true }))
    .toBeVisible();
  expect(writeText).toHaveBeenCalledTimes(2);
});

test("omits copying when no payload was supplied and invokes a labeled action", async () => {
  const onClick = vi.fn();
  await showToast({ dismiss: { label: "Retry", onClick } });
  await expect
    .element(page.getByRole("button", { name: "Copy details", exact: true }))
    .not.toBeInTheDocument();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  expect(onClick).toHaveBeenCalledOnce();
  await expect.element(page.getByText("Save failed", { exact: true })).not.toBeInTheDocument();
});

test("a caller-defined menu overrides the copy shortcut and keeps the toast alive while open or pending", async () => {
  let finish!: (value: Result<string, string>) => void;
  const run = vi.fn(
    () =>
      new Promise<Result<string, string>>((resolve) => {
        finish = resolve;
      }),
  );
  await showToast({
    dismiss: 3000,
    clipboardContent: "unused",
    actionMenu: {
      label: "Export actions",
      icon: "menu2",
      items: [{ id: "export", label: "Export data", onSelect: run }],
    },
  });
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await expect
    .element(page.getByRole("button", { name: "Copy details", exact: true }))
    .not.toBeInTheDocument();
  await new Promise((resolve) => setTimeout(resolve, 3200));
  await expect
    .element(page.getByRole("menuitem", { name: "Export data", exact: true }))
    .toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect
    .element(page.getByRole("menuitem", { name: "Export data", exact: true }))
    .not.toBeInTheDocument();
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export data", exact: true }).click();
  await expect
    .element(page.getByRole("button", { name: "Export actions", exact: true }))
    .toHaveFocus();
  await new Promise((resolve) => setTimeout(resolve, 3200));
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  finish(Result.Ok("Data exported"));
  await expect.element(page.getByText("Data exported", { exact: true })).toBeVisible();
  expect(run).toHaveBeenCalledOnce();
}, 15000);

test("a held toast does not expire on the wall clock while its menu is open or its action runs", async () => {
  const interval = 1000;
  const pastTheInterval = () => new Promise((resolve) => setTimeout(resolve, interval * 1.5));
  let finish!: (value: Result<string, string>) => void;
  await showToast({
    dismiss: interval,
    actionMenu: {
      label: "Export actions",
      icon: "menu2",
      items: [
        {
          id: "export",
          label: "Export data",
          onSelect: () =>
            new Promise<Result<string, string>>((resolve) => {
              finish = resolve;
            }),
        },
      ],
    },
  });
  const title = page.getByText("Save failed", { exact: true });
  const item = page.getByRole("menuitem", { name: "Export data", exact: true });

  // Focus is in the menu's region-local portal, outside the viewport. Moving
  // the pointer outside releases the viewport pause, so only the menu hold stops
  // the clocks. Regaining window focus must preserve that hold.
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await expect.element(item).toBeVisible();
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  window.dispatchEvent(new Event("blur"));
  window.dispatchEvent(new Event("focus"));
  await pastTheInterval();
  await expect.element(item).toBeVisible();
  await expect.element(title).toBeVisible();

  // Focus leaving the toasts resumes them while the action runs.
  await item.click();
  await page.getByRole("button", { name: "Outside toast", exact: true }).click();
  await pastTheInterval();
  await expect.element(title).toBeVisible();

  // Released, the toast shows the action's feedback and expires again.
  finish(Result.Ok("Data exported"));
  await expect.element(page.getByText("Data exported", { exact: true })).toBeVisible();
  await expect.element(title, { timeout: interval * 3 }).not.toBeInTheDocument();
}, 15000);

test("a toast ends on wall time while frames lag", async () => {
  const interval = 1000;
  let shownAt: number | null = null;
  let removedAt: number | null = null;
  function Consumer() {
    const { toasts } = useContext(ToastContext);
    useEffect(() => {
      if (toasts.length > 0) shownAt ??= performance.now();
      else if (shownAt !== null) removedAt ??= performance.now();
    }, [toasts]);
    return null;
  }
  // Each frame takes 250 ms, and Motion counts at most 40 ms of it, so the frame
  // clock runs at about a sixth of wall time and alone would end the toast after
  // some six seconds.
  let lagging = true;
  const lag = () => {
    if (!lagging) return;
    const until = performance.now() + 250;
    while (performance.now() < until);
    requestAnimationFrame(lag);
  };
  requestAnimationFrame(lag);
  try {
    await render(
      <ToastManager>
        <>
          <Consumer />
          <AddToast data={{ id: "lagging", title: "Saved", dismiss: interval }} />
        </>
      </ToastManager>,
    );
    await expect.poll(() => removedAt, { timeout: 5000 }).not.toBeNull();
    expect(removedAt! - shownAt!).toBeLessThan(interval * 2.5);
  } finally {
    lagging = false;
  }
}, 15000);

test("a toast whose interval is infinite stays until it is dismissed", async () => {
  await showToast({ dismiss: Infinity });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "dismiss", exact: true }).click();
  await expect.element(page.getByText("Save failed", { exact: true })).not.toBeInTheDocument();
});

test("a toast that arrives while the page is hidden waits for the page to be shown", async () => {
  const interval = 500;
  const setHidden = (hidden: boolean) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    document.dispatchEvent(new Event("visibilitychange"));
  };
  setHidden(true);
  try {
    await showToast({ dismiss: interval });
    await new Promise((resolve) => setTimeout(resolve, interval * 3));
    await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
    setHidden(false);
    await expect
      .element(page.getByText("Save failed", { exact: true }), { timeout: interval * 6 })
      .not.toBeInTheDocument();
  } finally {
    // The instance property shadows `Document.prototype.hidden`; removing it restores the real one.
    delete (document as { hidden?: boolean }).hidden;
  }
});

test("a generic menu displays Result failures and clears them after a successful retry", async () => {
  const run = vi
    .fn(() => Result.Err<void, string>("Export failed. Try again."))
    .mockReturnValueOnce(Result.Err<void, string>("Export failed. Try again."))
    .mockReturnValueOnce(Result.Ok<void, string>(undefined));
  await showToast({
    actionMenu: {
      label: "Export actions",
      icon: "menu2",
      items: [{ id: "export", label: "Export data", onSelect: run }],
    },
  });
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export data", exact: true }).click();
  await expect.element(page.getByText("Export failed. Try again.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export data", exact: true }).click();
  expect(run).toHaveBeenCalledTimes(2);
  await expect
    .element(page.getByText("Export failed. Try again.", { exact: true }))
    .not.toBeInTheDocument();
});

test("an ordinary toast still expires after its configured interval", async () => {
  await showToast({ dismiss: 3000 });
  await page.getByRole("button", { name: "Outside toast", exact: true }).click();
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  await expect.element(page.getByText("Save failed", { exact: true })).not.toBeInTheDocument();
});

test("unexpected action exceptions produce retryable feedback", async () => {
  await showToast({
    actionMenu: {
      label: "Export actions",
      icon: "menu2",
      items: [
        {
          id: "export",
          label: "Export data",
          onSelect: () => {
            throw new Error("Unexpected");
          },
        },
      ],
    },
  });
  const liveRegion = document.querySelector('li.card-overlay [role="status"]')!;
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export data", exact: true }).click();
  await expect
    .element(page.getByText("Could not complete this action. Try again.", { exact: true }))
    .toBeVisible();
  expect(liveRegion.isConnected).toBe(true);
  expect(liveRegion.textContent).toBe("Could not complete this action. Try again.");
});

test("provider sibling state survives adding and removing notifications", async () => {
  const mounted = vi.fn();
  function Child({ label }: { label: string }) {
    const addToast = useAddToast();
    const [count, setCount] = useState(0);
    useEffect(() => {
      mounted(label);
    }, [label]);
    return (
      <button
        type="button"
        onClick={() => {
          setCount((value) => value + 1);
          addToast({ id: label, title: label, dismiss: 60000 });
        }}
      >
        {label}: {count}
      </button>
    );
  }
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <Child label="First" />
      <Child label="Second" />
    </ToastManager>,
  );
  await page.getByRole("button", { name: "First: 0", exact: true }).click();
  await page.getByRole("button", { name: "Second: 0", exact: true }).click();
  await page.getByRole("button", { name: "dismiss", exact: true }).first().click();
  await expect.element(page.getByRole("button", { name: "First: 1", exact: true })).toBeVisible();
  await expect.element(page.getByRole("button", { name: "Second: 1", exact: true })).toBeVisible();
  expect(mounted.mock.calls.map(([label]) => label)).toEqual(["First", "Second"]);
});

test("a toast removed through the context and added again under its id lives its own interval", async () => {
  const interval = 1000;
  const removeAfter = 500;
  let readdedAt: number | null = null;
  let removedAgainAt: number | null = null;
  function RemoveThenAddAgain() {
    const { toasts, addToast, removeToast } = useContext(ToastContext);
    const listed = useRef(false);
    useEffect(() => {
      if (toasts.length > 0 && !listed.current) {
        listed.current = true;
        // Removed by a caller before its interval runs out, as a consumer that
        // dismisses its own notification does.
        const timer = setTimeout(() => removeToast("repeated"), removeAfter);
        return () => clearTimeout(timer);
      }
      if (toasts.length === 0 && listed.current && readdedAt === null) {
        // Added again, with the same interval, while the first one is leaving.
        readdedAt = performance.now();
        addToast({ id: "repeated", title: "Saved", dismiss: interval });
      } else if (toasts.length === 0 && readdedAt !== null && removedAgainAt === null) {
        removedAgainAt = performance.now();
      }
    }, [toasts, addToast, removeToast]);
    return null;
  }
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await render(
    <ToastManager>
      <>
        <RemoveThenAddAgain />
        <AddToast data={{ id: "repeated", title: "Saved", dismiss: interval }} />
      </>
    </ToastManager>,
  );
  await expect.poll(() => readdedAt, { timeout: 5000 }).not.toBeNull();
  await expect.element(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect.poll(() => removedAgainAt, { timeout: 5000 }).not.toBeNull();
  // Its own interval, not what the first notification's deadline left of it
  // (`interval - removeAfter`): the toast's clocks restart with its presence.
  // The bound sits halfway between the two.
  expect(removedAgainAt! - readdedAt!).toBeGreaterThan(interval - removeAfter / 2);
  await expect.element(page.getByText("Saved", { exact: true })).not.toBeInTheDocument();
});

test.each([false, true])(
  "a re-added toast announces a new notification while leaving=%s",
  async (leaving) => {
    let api!: ToastState;
    function Api() {
      api = useContext(ToastContext);
      return null;
    }
    await render(
      <ToastManager>
        <Api />
        <AddToast data={{ id: "announced", title: "First notice", dismiss: 60000 }} />
      </ToastManager>,
    );
    const announcement = () => document.querySelector('[role="status"][aria-live="assertive"]');
    await expect.poll(() => announcement()?.textContent).toBe("Notification First notice");
    await expect.poll(announcement, { timeout: 3000 }).toBeNull();
    if (leaving) {
      flushSync(() => api.removeToast("announced"));
      expect(document.querySelector('li[data-state="closed"]')).not.toBeNull();
    }
    flushSync(() => api.addToast({ id: "announced", title: "Second notice", dismiss: 60000 }));
    await expect.poll(() => announcement()?.textContent).toBe("Notification Second notice");
    const secondAnnouncement = announcement();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(announcement()).toBe(secondAnnouncement);
    await expect.poll(announcement, { timeout: 3000 }).toBeNull();
    expect(api.toasts).toHaveLength(1);
  },
);

test.each([false, true])(
  "changing a toast id preserves its order and permits removal or expiry (remove=%s)",
  async (remove) => {
    let api!: ToastState;
    function Api() {
      api = useContext(ToastContext);
      return null;
    }
    await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
    await render(
      <ToastManager>
        <Api />
      </ToastManager>,
    );
    flushSync(() => {
      api.addToast({ id: "before", title: "Before", dismiss: 60000 });
      api.addToast({ id: "old", title: "Renamed notice", dismiss: 1000 });
      api.addToast({ id: "after", title: "After", dismiss: 60000 });
    });
    await expect.element(page.getByText("Renamed notice", { exact: true })).toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const renamedAt = performance.now();
    flushSync(() => api.updateToast("old", { id: "new" }));
    expect(api.toasts.map((toast) => toast.id)).toEqual(["before", "new", "after"]);
    if (remove) flushSync(() => api.removeToast("new"));
    // The renamed toast starts a fresh 1000 ms interval, longer than the poll's default.
    await expect
      .poll(() => api.toasts.map((toast) => toast.id), { timeout: 3000 })
      .toEqual(["before", "after"]);
    if (!remove) expect(performance.now() - renamedAt).toBeGreaterThan(750);
    await expect.element(page.getByText("Renamed notice", { exact: true })).not.toBeInTheDocument();
  },
);

test("copying holds both clocks until the clipboard promise settles", async () => {
  let finish!: () => void;
  vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  await showToast({ dismiss: 1000, clipboardContent: "Exact details" });
  const copy = page.getByRole("button", { name: "Copy details", exact: true });
  await copy.click();
  await expect.element(copy).toBeDisabled();
  await page.getByRole("button", { name: "Outside toast", exact: true }).click();
  const circle = document
    .querySelectorAll<HTMLLIElement>("li.card-overlay")[0]
    .querySelectorAll("circle")[1];
  expect(document.activeElement).toBe(
    page.getByRole("button", { name: "Outside toast", exact: true }).element(),
  );
  const offset = circle.style.strokeDashoffset;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  expect(circle.style.strokeDashoffset).toBe(offset);
  finish();
  await expect
    .element(page.getByText("Details copied to clipboard.", { exact: true }))
    .toBeInTheDocument();
  await expect
    .element(page.getByText("Save failed", { exact: true }), { timeout: 3000 })
    .not.toBeInTheDocument();
});

test("menu presses stay inside the region and cannot swipe or dismiss its toast", async () => {
  await showToast({
    actionMenu: {
      icon: "menu2",
      label: "Notification actions",
      items: [
        {
          id: "keep",
          label: "Keep notification",
          description: "Available after export",
          disabled: true,
          onSelect: () => Result.Ok(undefined),
        },
      ],
    },
  });
  const toast = document.querySelector<HTMLElement>("li.card-overlay")!;
  await expect.poll(() => getComputedStyle(toast).transform).toBe("none");
  await page.getByRole("button", { name: "Notification actions", exact: true }).click();
  const menu = page.getByRole("menu");
  await expect.element(menu).toBeVisible();
  expect(menu.element().closest('[role="region"][aria-label="Notifications (F8)"]')).not.toBeNull();
  const initialX = toast.getBoundingClientRect().x;
  await userEvent.dragAndDrop(menu, menu, {
    sourcePosition: { x: 4, y: 4 },
    targetPosition: { x: 100, y: 4 },
    steps: 10,
  });
  expect(toast.dataset.swipe).toBeUndefined();
  expect(toast.getBoundingClientRect().x).toBeCloseTo(initialX, 0);
  // The native keyboard command targets the focused frame. Focus the menu
  // explicitly so Escape reaches its document after the drag.
  (menu.element() as HTMLElement).focus();
  expect(document.activeElement).toBe(menu.element());
  expect(document.hasFocus()).toBe(true);
  await userEvent.keyboard("{Escape}");
  await expect.element(menu).not.toBeInTheDocument();
  expect(toast.dataset.state).toBe("open");
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
});

test("metadata follows store exits and retains an id re-added during clear", async () => {
  let api!: ToastState;
  let retained: { id: string; transitionStatus?: string }[] = [];
  function Api() {
    api = useContext(ToastContext);
    retained = Toast.useToastManager().toasts;
    return null;
  }
  await render(
    <ToastManager>
      <Api />
    </ToastManager>,
  );
  flushSync(() => {
    api.addToast({ id: "shared", title: "First generation", dismiss: 60000 });
    api.addToast({ id: "other", title: "Other notice", dismiss: 60000 });
  });
  await expect.element(page.getByText("First generation", { exact: true })).toBeVisible();
  flushSync(() => api.clear());
  expect(retained.every((toast) => toast.transitionStatus === "ending")).toBe(true);
  expect(__getToastRetainedMetadataForTests(api)).toEqual({ generations: 2, positions: 2 });
  flushSync(() => api.addToast({ id: "shared", title: "Second generation", dismiss: 60000 }));
  expect(__getToastRetainedMetadataForTests(api)).toEqual({ generations: 2, positions: 2 });
  await expect.poll(() => retained.map((toast) => toast.id)).toEqual(["shared"]);
  expect(api.toasts.map((toast) => toast.title)).toEqual(["Second generation"]);
  expect(__getToastRetainedMetadataForTests(api)).toEqual({ generations: 1, positions: 1 });
  flushSync(() => api.removeToast("shared"));
  await expect.poll(() => retained).toEqual([]);
  await expect
    .poll(() => __getToastRetainedMetadataForTests(api))
    .toEqual({
      generations: 0,
      positions: 0,
    });
});
