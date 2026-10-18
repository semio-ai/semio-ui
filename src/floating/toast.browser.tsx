import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import type {} from "@vitest/browser-playwright";
import "../test-stylesheet";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastManager, type ToastData } from "./toast";
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
