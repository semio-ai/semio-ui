// @vitest-environment jsdom
import { useContext } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Popover } from "./popover";
import { ToastContext, ToastManager, type ToastState } from "./toast";

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
