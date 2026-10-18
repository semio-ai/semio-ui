import { Result } from "@semio/utils";
import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { useContext, useEffect, useState } from "react";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastContext, ToastManager, type ToastData } from "./toast";
import "../test-stylesheet";

afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
});

function SeedToast({ data }: { data: ToastData }) {
  const addToast = useAddToast();
  useEffect(() => {
    addToast(data);
  }, [addToast, data]);
  return null;
}

async function showToast(data: Partial<ToastData> = {}) {
  await render(
    <ToastManager>
      <SeedToast data={{ id: "test", title: "Save failed", dismiss: 60000, ...data }} />
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
  const liveRegion = [...document.querySelectorAll('[role="status"]')].find(
    (node) => node.textContent === "",
  )!;
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
  await render(
    <ToastManager>
      <Consumer />
      <SeedToast data={{ id: "expiring", title: "Saved", dismiss: 50 }} />
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
  let readded = false;
  function AddAgainOnRemoval() {
    const { toasts, addToast } = useContext(ToastContext);
    const [listed, setListed] = useState(false);
    useEffect(() => {
      if (toasts.length > 0) {
        setListed(true);
      } else if (listed && !readded) {
        // While the first one is still playing its exit animation.
        readded = true;
        addToast({ id: "repeated", title: "Saved", dismiss: 300 });
      }
    }, [toasts, listed, addToast]);
    return null;
  }
  await render(
    <ToastManager>
      <AddAgainOnRemoval />
      <SeedToast data={{ id: "repeated", title: "Saved", dismiss: 50 }} />
    </ToastManager>,
  );
  await expect.poll(() => readded, { timeout: 5000 }).toBe(true);
  await expect.element(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect
    .element(page.getByText("Saved", { exact: true }), { timeout: 5000 })
    .not.toBeInTheDocument();
});
