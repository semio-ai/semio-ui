import { useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Toast } from "@base-ui/react/toast";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import type {} from "@vitest/browser-playwright";
import "../test-stylesheet";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastContext, ToastManager, type ToastData, type ToastState } from "./toast";
import { Dialog } from "./dialog";
import { Modal } from "./modal";

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
  expect(element.lastElementChild!.tagName).toBe("DIV");
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
