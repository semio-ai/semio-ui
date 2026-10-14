import { Result } from "@semio/utils";
import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { useEffect } from "react";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastManager, type ToastData } from "./toast";
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
  await expect.element(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
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
  await expect.element(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
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
    dismiss: 600,
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
  await new Promise((resolve) => setTimeout(resolve, 800));
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
  await new Promise((resolve) => setTimeout(resolve, 800));
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  finish(Result.Ok("Data exported"));
  await expect.element(page.getByText("Data exported", { exact: true })).toBeVisible();
  expect(run).toHaveBeenCalledOnce();
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
  await showToast({ dismiss: 600 });
  await page.getByRole("button", { name: "Outside toast", exact: true }).click();
  await expect.element(page.getByText("Save failed", { exact: true })).toBeVisible();
  await expect.element(page.getByText("Save failed", { exact: true })).not.toBeInTheDocument();
});
