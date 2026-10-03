import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { ScrollArea } from "./scroll-area";
// Real geometry: the thumb's position is a computed transform, so the compiled
// stylesheet has to be present or the track has no height to be positioned within.
import "../test-stylesheet";

/**
 * The thumb reflects where the viewport actually is, even when it was moved with the
 * pointer somewhere else.
 *
 * Base UI positions the thumb only from the viewport's scroll handler and a resize
 * observer — never on mount. The scrollbar here is mounted on hover, so it is created
 * after any scrolling that happened while the pointer was elsewhere: a canvas-driven
 * `motionScrollY`, `scrollTo` through the imperative handle, `externalScrollTop`,
 * keyboard scrolling, or a windowed list moving itself. Without a nudge it paints at the
 * top of its track while the viewport sits at the bottom, and only the next scroll event
 * corrects it — so the wrong state is the one a user sees on arriving.
 */
test("the thumb reflects a scroll that happened before it was mounted", async () => {
  await render(
    <div style={{ height: "150px", width: "200px" }}>
      <ScrollArea>
        <div style={{ height: "1500px" }}>tall</div>
      </ScrollArea>
    </div>,
  );
  const viewport = () => document.querySelector<HTMLElement>("[data-scroll-area-viewport]")!;
  await expect.poll(() => !!document.querySelector("[data-scroll-area-viewport]")).toBe(true);

  // Scroll to the very end with no pointer over the area, so no scrollbar exists yet.
  viewport().scrollTop = viewport().scrollHeight;
  await expect.poll(() => viewport().scrollTop).toBeGreaterThan(0);

  await userEvent.hover(page.getByText("tall"));

  const geometry = () => {
    const bar = document.querySelector<HTMLElement>('[data-testid="scroll-area-scrollbar"]');
    const thumb = bar?.firstElementChild as HTMLElement | undefined;
    if (!bar || !thumb) return null;
    const track = bar.getBoundingClientRect();
    const box = thumb.getBoundingClientRect();
    return { offset: box.top - track.top, track: track.height, thumb: box.height };
  };
  await expect.poll(() => geometry() !== null).toBe(true);

  // Viewport at the end means the thumb belongs at the end of its track, not the start.
  // Asserted as a fraction so it does not encode this fixture's pixel sizes.
  await expect
    .poll(() => {
      const g = geometry()!;
      return (g.offset + g.thumb) / g.track;
    })
    .toBeGreaterThan(0.9);
});
