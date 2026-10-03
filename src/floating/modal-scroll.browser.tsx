import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { Modal } from "./modal";
// The real compiled stylesheet: the claim is about layout, and without it the popup's
// sizing classes do not exist and every box collapses to content size.
import "../test-stylesheet";

/**
 * A modal holding more than it can show must still be scrollable to the end of it.
 *
 * `Modal` sizes its popup, and the scroll area inside fills what the popup leaves after
 * the header and footer. Handing those same constraints to `ScrollArea`'s `className`
 * instead puts them on the **viewport** — the box that scrolls — which then sizes itself
 * from the window rather than from the space it was given, and extends past the popup
 * that clips it. Nothing looks wrong: the scrollbar appears, `overflow-y` reads `scroll`,
 * the content scrolls. It just stops short, and the stretch below the clip cannot be
 * reached at any scroll position. Measured before the fix, at a 1280x800 viewport: a
 * 796px scroller inside a 650px clip, with the last 146px of the form unreachable.
 *
 * Asserted at desktop width because that is where the popup is sized by its content
 * (`desktop:h-fit`); below the breakpoint it takes the full window height and the
 * mis-targeted constraint happens to agree with the space available.
 */
test("a modal taller than its popup can be scrolled to the end of its content", async () => {
  await page.viewport(1280, 800);
  await render(
    <Modal
      open
      title="Tall"
      description="More than fits"
      onStateChange={() => {}}
      onSubmit={() => {}}
    >
      <div>
        <div style={{ height: "3000px" }} />
        <div data-testid="last-field" style={{ height: "20px" }}>
          the last field
        </div>
      </div>
    </Modal>,
  );

  const viewport = () => document.querySelector<HTMLElement>("[data-scroll-area-viewport]");
  await expect.poll(viewport).not.toBeNull();

  const popup = document.querySelector<HTMLElement>("[role=dialog]")!;
  // The scroller must fit inside the popup that clips it.
  await expect
    .poll(() => viewport()!.clientHeight <= Math.ceil(popup.getBoundingClientRect().height))
    .toBe(true);

  // Scrolled as far as it goes, the bottom of the form is on screen. Set `scrollTop`
  // directly rather than dispatching a wheel event, which drives no native scrolling and
  // would report zero whether or not the defect is present.
  viewport()!.scrollTop = viewport()!.scrollHeight;
  await expect
    .poll(() => {
      const last = document.querySelector<HTMLElement>('[data-testid="last-field"]')!;
      return Math.round(last.getBoundingClientRect().bottom - popup.getBoundingClientRect().bottom);
    })
    .toBeLessThanOrEqual(0);
});
