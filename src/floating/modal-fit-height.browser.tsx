import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { Modal } from "./modal";
// The real compiled stylesheet: the claim is about layout, and without it the popup's
// sizing classes do not exist and every box collapses to content size.
import "../test-stylesheet";

afterEach(cleanup);

/** The floor a desktop modal's height keeps without `fitHeight` (`min-h-72`). */
const FLOOR = 288;

async function popupHeight(props: { fitHeight?: boolean; size?: "fit" | "wide" }) {
  const view = await render(
    <Modal
      open
      title="Rename"
      onStateChange={() => {}}
      onSubmit={() => {}}
      fitHeight={props.fitHeight}
      size={props.size}
    >
      <input aria-label="Name" />
    </Modal>,
  );
  await expect.poll(() => document.querySelector("[role=dialog]")).not.toBeNull();
  // Read once the open transition has settled, so the height is the resting one.
  const popup = document.querySelector<HTMLElement>("[role=dialog]")!;
  await expect.poll(() => getComputedStyle(popup).opacity).toBe("1");
  const height = popup.getBoundingClientRect().height;
  await view.unmount();
  return height;
}

/**
 * On desktop a modal holding one short field keeps an 18rem floor, which leaves most
 * of its body empty; `fitHeight` lets the height follow the content instead.
 */
test("a short modal on desktop sits on the floor, and follows its content with fitHeight", async () => {
  await page.viewport(1280, 800);
  const floored = await popupHeight({});
  const fitted = await popupHeight({ fitHeight: true });

  expect(floored).toBe(FLOOR);
  expect(fitted).toBeLessThan(FLOOR);
  expect(fitted).toBeGreaterThan(0);
});

/**
 * Below the desktop breakpoint every modal takes the whole window, so `fitHeight`
 * has nothing to change there.
 */
test("fitHeight leaves a phone-sized modal at the full window height", async () => {
  await page.viewport(375, 812);
  const floored = await popupHeight({});
  const fitted = await popupHeight({ fitHeight: true });

  expect(floored).toBe(812 - 4);
  expect(fitted).toBe(floored);
});

/** The wide form's height is set, not floored, so `fitHeight` leaves it. */
test("fitHeight leaves a wide modal's height", async () => {
  await page.viewport(1280, 800);
  const wide = await popupHeight({ size: "wide" });
  const fitted = await popupHeight({ size: "wide", fitHeight: true });

  expect(wide).toBeGreaterThan(FLOOR);
  expect(fitted).toBe(wide);
});
