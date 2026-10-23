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

  // Radix pauses the toasts while focus or the pointer is in them, which alone would
  // stop the clocks. Each step below makes Radix resume while the toast is held, so
  // only the hold keeps the wall clock from running out. The window regaining focus
  // resumes them with focus still in the open menu.
  await page.getByRole("button", { name: "Export actions", exact: true }).click();
  await expect.element(item).toBeVisible();
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
          <SeedToast data={{ id: "lagging", title: "Saved", dismiss: interval }} />
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
      <>
        <Consumer />
        <SeedToast data={{ id: "expiring", title: "Saved", dismiss: 50 }} />
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
  await render(
    <ToastManager>
      <>
        <AddAgainOnRemoval />
        <SeedToast data={{ id: "repeated", title: "Saved", dismiss: first }} />
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

test("a toast removed through the context and added again under its id lives its own interval", async () => {
  const interval = 1000;
  const removeAfter = 500;
  let readdedAt: number | null = null;
  let removedAgainAt: number | null = null;
  function RemoveThenAddAgain() {
    const { toasts, addToast, removeToast } = useContext(ToastContext);
    const [listed, setListed] = useState(false);
    useEffect(() => {
      if (toasts.length > 0 && !listed) {
        setListed(true);
        // Removed by a caller before its interval runs out, as a consumer that
        // dismisses its own notification does.
        const timer = setTimeout(() => removeToast("repeated"), removeAfter);
        return () => clearTimeout(timer);
      }
      if (toasts.length === 0 && listed && readdedAt === null) {
        // Added again, with the same interval, while the first one is leaving.
        readdedAt = performance.now();
        addToast({ id: "repeated", title: "Saved", dismiss: interval });
      } else if (toasts.length === 0 && readdedAt !== null && removedAgainAt === null) {
        removedAgainAt = performance.now();
      }
    }, [toasts, listed, addToast, removeToast]);
    return null;
  }
  await render(
    <ToastManager>
      <>
        <RemoveThenAddAgain />
        <SeedToast data={{ id: "repeated", title: "Saved", dismiss: interval }} />
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
