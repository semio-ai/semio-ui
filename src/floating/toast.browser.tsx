import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { useContext, useEffect, useState } from "react";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastContext, ToastManager, type ToastData } from "./toast";
import "../test-stylesheet";

afterEach(async () => {
  await cleanup();
});

function SeedToast({ data }: { data: ToastData }) {
  const addToast = useAddToast();
  useEffect(() => {
    addToast(data);
  }, [addToast, data]);
  return null;
}

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
  // (`interval - removeAfter`). The bound sits halfway between the two.
  expect(removedAgainAt! - readdedAt!).toBeGreaterThan(interval - removeAfter / 2);
  await expect.element(page.getByText("Saved", { exact: true })).not.toBeInTheDocument();
});
