import { expect, test } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { page, userEvent } from "@vitest/browser/context";
import { useEffect, useRef } from "react";
import { ScrollArea } from "./scroll-area";
import "../test-stylesheet";

/**
 * A consumer that claims the wheel for itself can actually keep it — including over the
 * scrollbar.
 *
 * Some consumers forward the wheel into their own state instead of letting the area
 * scroll: the animation track list drives a MotionValue that also moves the canvas
 * camera, so letting both happen moves the list twice per notch. Suppressing the area's
 * own scrolling is what makes that work.
 *
 * Base UI registers a `{ passive: false }` wheel listener **on the scrollbar element**
 * and writes `scrollTop` imperatively. That fires in the target phase — ahead of any
 * bubble-phase handler on an ancestor — and `preventDefault` does not undo an imperative
 * write, so a wheel over the ~10px gutter escapes a consumer that registered on the way
 * up. The gutter is only mounted while hovering, and hovering is exactly when you wheel
 * over it.
 *
 * So the contract is: **register in the capture phase.** This pins it from both sides,
 * because an assertion that only checked the capture arm would pass just as well if Base
 * UI stopped listening on the scrollbar at all.
 */
async function wheelOverGutter(capture: boolean) {
  function Harness() {
    const host = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = host.current!;
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };
      el.addEventListener("wheel", onWheel, { passive: false, capture });
      return () => el.removeEventListener("wheel", onWheel, { capture });
    }, []);
    return (
      <div ref={host} style={{ height: "150px", width: "200px", overflow: "hidden" }}>
        <ScrollArea style={{ maxHeight: 150 }}>
          <div style={{ height: "1500px" }}>tall</div>
        </ScrollArea>
      </div>
    );
  }
  render(<Harness />);
  await userEvent.hover(page.getByText("tall"));
  const viewport = document.querySelector<HTMLElement>("[data-scroll-area-viewport]")!;
  await expect
    .poll(() => !!document.querySelector('[data-testid="scroll-area-scrollbar"]'))
    .toBe(true);
  const gutter = document.querySelector<HTMLElement>('[data-testid="scroll-area-scrollbar"]')!;
  viewport.scrollTop = 0;
  gutter.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 120 }));
  await new Promise((resolve) => setTimeout(resolve, 150));
  const moved = viewport.scrollTop;
  cleanup();
  return moved;
}

test("a capture-phase wheel handler suppresses scrolling started over the scrollbar", async () => {
  // The control, and the reason the claim below is not vacuous: registered on the way up,
  // the area scrolls anyway, because Base UI's own listener has already run.
  expect(await wheelOverGutter(false)).toBeGreaterThan(0);

  // The claim: registered on the way down, the event never reaches the scrollbar.
  expect(await wheelOverGutter(true)).toBe(0);
});
