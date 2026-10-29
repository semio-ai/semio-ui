import { useEffect } from "react";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { useAddToast } from "../hooks/use-add-toast";
import { Variant } from "../types";
import { ToastManager, type ToastData } from "./toast";

/**
 * A toast's dismiss control, in a real browser: an action toast's button runs its
 * action and closes, and a plain toast's close button only closes. The action runs
 * through Base UI's `Toast.Close`, which merges its own click handler into the button,
 * so whether both happen, and in which order, is only observable with the real parts.
 */

function AddOnMount({ toast }: { toast: ToastData }) {
  const addToast = useAddToast();
  useEffect(() => {
    addToast(toast);
  }, [addToast, toast]);
  return null;
}

test("an action toast's button runs its action with the toast, then closes it", async () => {
  const onClick = vi.fn();
  const toast: ToastData = {
    id: "published",
    title: "Asset published",
    variant: Variant.Success,
    dismiss: { label: "View", onClick },
  };
  await render(
    <ToastManager>
      <AddOnMount toast={toast} />
    </ToastManager>,
  );

  const title = page.getByText("Asset published");
  await expect.element(title).toBeVisible();
  await page.getByRole("button", { name: "View", exact: true }).click();

  expect(onClick).toHaveBeenCalledExactlyOnceWith(toast);
  await expect.element(title).not.toBeInTheDocument();
});

test("control: a plain toast's close button closes it", async () => {
  const toast: ToastData = { id: "saved", title: "Saved", dismiss: 10_000 };
  await render(
    <ToastManager>
      <AddOnMount toast={toast} />
    </ToastManager>,
  );

  const title = page.getByText("Saved");
  await expect.element(title).toBeVisible();
  await page.getByRole("button", { name: "dismiss", exact: true }).click();

  await expect.element(title).not.toBeInTheDocument();
});
