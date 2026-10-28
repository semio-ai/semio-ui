// @vitest-environment jsdom
import { useContext } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Popover } from "./popover";
import { ToastContext, ToastManager, type ToastState } from "./toast";
import { __getToastRetainedMetadataForTests } from "./toast-retained-state";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("PointerEvent", MouseEvent);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("toast updates in one tick retain both changes and a stable update callback", () => {
  let state!: ToastState;
  function Consumer() {
    state = useContext(ToastContext);
    return null;
  }
  render(
    <ToastManager>
      <Consumer />
    </ToastManager>,
  );
  const update = state.updateToast;
  act(() => {
    state.addToast({ id: "batched", title: "Initial", dismiss: 60000 });
    update("batched", { title: "Updated" });
    update("batched", { content: "Retained description" });
  });
  expect(state.toasts).toEqual([
    { id: "batched", title: "Updated", content: "Retained description", dismiss: 60000 },
  ]);
  expect(state.updateToast).toBe(update);

  act(() => {
    update("batched", { title: "Second title" });
    update("batched", { content: "Second description" });
  });
  expect(state.toasts[0]).toMatchObject({ title: "Second title", content: "Second description" });
  expect(state.updateToast).toBe(update);

  act(() => {
    state.removeToast("batched");
    update("batched", { title: "Removed" });
  });
  expect(state.toasts).toEqual([]);
});

test("toast presses keep an open Radix popover open", async () => {
  let state!: ToastState;
  function Consumer() {
    state = useContext(ToastContext);
    return null;
  }
  const onStateChange = vi.fn();
  const view = render(
    <ToastManager>
      <Consumer />
      <Popover
        open
        onStateChange={onStateChange}
        trigger={<button type="button">Open popover</button>}
      >
        <button type="button">Popover content</button>
      </Popover>
    </ToastManager>,
  );
  act(() => state.addToast({ id: "branch", title: "Notification", dismiss: 60000 }));
  // Radix installs its outside-press listener after the opening event finishes.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  fireEvent.pointerDown(view.getByText("Notification"), { button: 0, pointerType: "mouse" });
  expect(onStateChange).not.toHaveBeenCalled();
});

test("renaming a toast keeps its slot and synchronous updates follow the new id", () => {
  let state!: ToastState;
  function Consumer() {
    state = useContext(ToastContext);
    return null;
  }
  render(
    <ToastManager>
      <Consumer />
    </ToastManager>,
  );
  act(() => {
    state.addToast({ id: "before", title: "Before", dismiss: 60000 });
    state.addToast({ id: "old", title: "Original", dismiss: 60000 });
    state.addToast({ id: "after", title: "After", dismiss: 60000 });
    state.updateToast("old", { id: "new", content: "Merged details" });
    state.updateToast("new", { title: "Renamed" });
    state.updateToast("old", { title: "Stale update" });
  });
  expect(state.toasts).toEqual([
    { id: "before", title: "Before", dismiss: 60000 },
    { id: "new", title: "Renamed", content: "Merged details", dismiss: 60000 },
    { id: "after", title: "After", dismiss: 60000 },
  ]);
  act(() => state.removeToast("new"));
  expect(state.toasts.map((toast) => toast.id)).toEqual(["before", "after"]);
});

test("renamed toast expires under its new id", () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  try {
    let state!: ToastState;
    function Consumer() {
      state = useContext(ToastContext);
      return null;
    }
    render(
      <ToastManager>
        <Consumer />
      </ToastManager>,
    );
    act(() => {
      state.addToast({ id: "before", title: "Before", dismiss: 60000 });
      state.addToast({ id: "old", title: "Original", dismiss: 1000 });
      state.addToast({ id: "after", title: "After", dismiss: 60000 });
    });
    act(() => vi.advanceTimersByTime(500));
    act(() => state.updateToast("old", { id: "new" }));
    act(() => vi.advanceTimersByTime(750));
    expect(state.toasts.map((toast) => toast.id)).toEqual(["before", "new", "after"]);
    act(() => vi.advanceTimersByTime(251));
    expect(state.toasts.map((toast) => toast.id)).toEqual(["before", "after"]);
  } finally {
    vi.useRealTimers();
  }
});

test.each([false, true])(
  "toast metadata is released after distinct ids leave (clear=%s)",
  (clear) => {
    let state!: ToastState;
    function Consumer() {
      state = useContext(ToastContext);
      return null;
    }
    render(
      <ToastManager>
        <Consumer />
      </ToastManager>,
    );
    act(() => {
      for (let index = 0; index < 40; index++) {
        state.addToast({ id: `notice-${index}`, title: `Notice ${index}`, dismiss: 60000 });
      }
    });
    expect(__getToastRetainedMetadataForTests(state)).toEqual({ generations: 40, positions: 40 });
    act(() => {
      if (clear) state.clear();
      else for (const toast of state.toasts) state.removeToast(toast.id);
    });
    expect(state.toasts).toEqual([]);
    expect(__getToastRetainedMetadataForTests(state)).toEqual({ generations: 0, positions: 0 });
  },
);

test("copy settlement resumes clocks after focus leaves without a viewport blur", async () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  let finish!: () => void;
  vi.stubGlobal("navigator", {
    clipboard: {
      writeText: () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    },
  });
  try {
    let state!: ToastState;
    function Consumer() {
      state = useContext(ToastContext);
      return <button type="button">Outside toast</button>;
    }
    const view = render(
      <ToastManager>
        <Consumer />
      </ToastManager>,
    );
    act(() =>
      state.addToast({
        id: "copy",
        title: "Copy notice",
        dismiss: 1000,
        clipboardContent: "Details",
      }),
    );
    const copy = view.getByRole("button", { name: "Copy details" });
    const feedback = () =>
      [...copy.closest("li")!.querySelectorAll('[role="status"]')].map((node) => node.textContent);
    expect(feedback()).toEqual(["", ""]);
    act(() => copy.focus());
    fireEvent.click(copy);
    expect(copy.hasAttribute("disabled")).toBe(true);
    // Chromium can omit focusout when a focused button becomes disabled.
    copy.closest("li")!.addEventListener("focusout", (event) => event.stopPropagation(), {
      once: true,
    });
    act(() => view.getByRole("button", { name: "Outside toast" }).focus());
    act(() => vi.advanceTimersByTime(1500));
    expect(state.toasts).toHaveLength(1);
    await act(async () => {
      finish();
      await Promise.resolve();
    });
    expect(feedback()).toEqual(["", "Details copied to clipboard."]);
    act(() => vi.advanceTimersByTime(1001));
    expect(state.toasts).toEqual([]);
  } finally {
    vi.useRealTimers();
  }
});

test("an id re-added after store release gets a distinct clock generation", () => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  try {
    let state!: ToastState;
    function Consumer() {
      state = useContext(ToastContext);
      return null;
    }
    const view = render(
      <ToastManager>
        <Consumer />
      </ToastManager>,
    );
    act(() => state.addToast({ id: "reused", title: "First", dismiss: 1000 }));
    act(() => vi.advanceTimersByTime(1001));
    expect(state.toasts).toEqual([]);
    expect(__getToastRetainedMetadataForTests(state)).toEqual({ generations: 0, positions: 0 });
    // Motion still retains the root while its exit runs, after the store release.
    expect(view.getByText("First")).toBeTruthy();
    act(() => state.addToast({ id: "reused", title: "Second", dismiss: 1000 }));
    act(() => vi.advanceTimersByTime(750));
    expect(state.toasts.map((toast) => toast.title)).toEqual(["Second"]);
    act(() => vi.advanceTimersByTime(251));
    expect(state.toasts).toEqual([]);
    expect(__getToastRetainedMetadataForTests(state)).toEqual({ generations: 0, positions: 0 });
  } finally {
    vi.useRealTimers();
  }
});
