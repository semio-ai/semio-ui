import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "@vitest/browser/context";
import { ScrollArea } from "./scroll-area";
// The real compiled stylesheet. Without it `h-full`/`flex-1` do not exist, every box
// collapses to content size, and the fitting and overflowing cases measure the same
// thing — which would make every assertion here vacuous.
import "../test-stylesheet";

/**
 * A scrollbar appears when content genuinely overflows, and not otherwise — and an axis
 * with nothing to scroll stops being a scroll container, so the engine has no native bar
 * to paint.
 *
 * `scrollWidth`/`scrollHeight` and `clientWidth`/`clientHeight` are integers by spec, and
 * where a viewport's box is a fractional size WebKit rounds the pair in opposite
 * directions, reporting `scroll = client + 1` for content that fits exactly. Both scroll
 * Base UI decides scrollability from precisely that comparison (`clientHeight >=
 * scrollHeight`), so it raises a scrollbar for content that fits — which is how the app
 * came to show one on a menu holding 144px of content in a 564px box. The fractional
 * measurement in `ScrollArea` is what overrides that verdict, so it survives the move off
 * Radix rather than being replaced by `data-has-overflow-y`.
 *
 * ## What can and cannot be observed here
 *
 * Two facts about this environment decide the shape of every test below, and both were
 * established by mutation — reverting the fix and watching which assertions moved — not by
 * reading the component.
 *
 * **The rounding artefact itself is not reproducible.** It needs a fractional device pixel
 * ratio and this browser runs at 1. Worse, Chromium does not round the way WebKit does: a
 * 200px viewport holding 200.39px of content reports `scrollHeight` 200, not 201. So a
 * sub-pixel excess is invisible to the integer metrics here, Base UI declines to mount a
 * bar for it on its own, and **no assertion about scrollbar presence can see this fix at all**
 * in the fitting or sub-pixel cases. The archived first draft of this file asserted exactly
 * that and passed with the fix fully reverted.
 *
 * **The decision is observable as `overflow` instead.** Gating the scrollbars can only ever
 * subtract from what Base UI would mount, so in a browser where Base UI already declines, it
 * is unobservable. Taking the axis out of scrolling is not: it is a computed style on the
 * viewport, it is ours alone, and it moves the moment the measurement does. So the
 * content-fits direction is asserted through `overflow`, and scrollbar presence is asserted
 * only where it can fail — the overflow direction, where the gate could wrongly suppress a
 * bar that is wanted.
 *
 * Every presence case hovers first: the component mounts a scrollbar only while the pointer
 * is over the area, so a gutter is not painted permanently over every list in the app.
 * Asserting without hovering passes no matter what the component decides, which the hover
 * case below exists to prove.
 */

const orientations = () =>
  [...document.querySelectorAll('[data-testid="scroll-area-scrollbar"]')]
    .map((bar) => bar.getAttribute("data-orientation") ?? "")
    .sort((a, b) => a.localeCompare(b));

const viewportOverflow = () => {
  const vp = document.querySelector<HTMLElement>("[data-scroll-area-viewport]");
  if (!vp) return null;
  const cs = getComputedStyle(vp);
  return { x: cs.overflowX, y: cs.overflowY };
};

async function renderAndHover(
  viewport: { height: string; width: string },
  content: { height: string; width: string },
  label: string,
) {
  render(
    <div style={{ height: viewport.height, width: viewport.width }}>
      <ScrollArea>
        <div style={{ height: content.height, width: content.width }}>{label}</div>
      </ScrollArea>
    </div>,
  );
  await userEvent.hover(page.getByText(label));
}

test("content that fits scrolls on neither axis, and raises no scrollbar", async () => {
  await renderAndHover(
    { height: "200.4px", width: "300.4px" },
    { height: "100px", width: "100px" },
    "fits easily",
  );
  // `hidden` beats the viewport's inline `overflow: scroll`, so the engine has nothing to draw a
  // native bar for. This is the assertion that can fail; the one below cannot in Chromium.
  await expect.poll(viewportOverflow).toEqual({ x: "hidden", y: "hidden" });
  await expect.poll(orientations).toEqual([]);
});

test("a sub-pixel excess is not treated as overflow", async () => {
  // 0.39px past the viewport on both axes — the size of the artefact being absorbed, and
  // far too little to scroll anything into view.
  await renderAndHover(
    { height: "200px", width: "300px" },
    { height: "200.4px", width: "300.4px" },
    "a hair too big",
  );
  // The only assertion in the file that pins OVERFLOW_EPSILON: shrink it under 0.39 and
  // this excess becomes real overflow, both axes become scroll containers, and this fails.
  // Nothing else here moves when that constant does.
  await expect.poll(viewportOverflow).toEqual({ x: "hidden", y: "hidden" });
  await expect.poll(orientations).toEqual([]);
});

test("a real overflow still raises a scrollbar, on the axis that overflows", async () => {
  await renderAndHover(
    { height: "200px", width: "300px" },
    { height: "900px", width: "100px" },
    "much too tall",
  );
  // Vertical only — the content is narrower than the viewport, so a horizontal bar would
  // be the same false positive in the other axis. Guards the direction the compensation
  // could break: a gate that suppressed bars that are wanted.
  await expect.poll(orientations).toEqual(["vertical"]);
});

test("a real overflow on both axes raises both", async () => {
  await renderAndHover(
    { height: "200px", width: "300px" },
    { height: "900px", width: "900px" },
    "too tall and too wide",
  );
  await expect.poll(orientations).toEqual(["horizontal", "vertical"]);
});

test("the scrollbar is hover-mounted, which is why every case above hovers", async () => {
  render(
    <div style={{ height: "200px", width: "300px" }}>
      <ScrollArea>
        <div style={{ height: "900px", width: "900px" }}>unhovered</div>
      </ScrollArea>
    </div>,
  );
  // Genuine overflow on both axes, but no pointer over the area, which keeps the
  // scrollbars unmounted — so a presence assertion made here would pass regardless of
  // what the overflow check decided.
  await expect.poll(orientations).toEqual([]);
});

/**
 * The scrollbar the *browser* draws is a separate problem from the one this component
 * draws, and it cannot be styled away: WebKit paints a native bar on an axis reporting a
 * rounded pixel of overflow even with `scrollbar-width: none` and `::-webkit-scrollbar {
 * display: none }` both applied. So an axis with nothing to scroll is taken out of
 * scrolling altogether.
 *
 * Which is the one change here that could hide content rather than merely look wrong — an
 * axis wrongly locked is content the viewer cannot reach. The two cases below are the only
 * ones that catch that, in its two forms: locked when it should not be, and never unlocked
 * once the content grows.
 */

test("an overflowing axis stays scrollable, and really scrolls", async () => {
  await renderAndHover(
    { height: "200px", width: "300px" },
    { height: "900px", width: "100px" },
    "scroll me",
  );

  // Vertical keeps scrolling; horizontal, with nothing to reach, does not.
  await expect.poll(viewportOverflow).toEqual({ x: "hidden", y: "scroll" });

  // Not just the computed value — the axis has to actually move, or this would be a way of
  // hiding content rather than a way of hiding a scrollbar.
  const vp = document.querySelector<HTMLElement>("[data-scroll-area-viewport]");
  vp?.scrollTo({ top: 300 });
  await expect.poll(() => vp?.scrollTop).toBeGreaterThan(0);
});

test("an axis locked with nothing to scroll regains scrolling when content grows", async () => {
  function Growable({ tall }: { tall: boolean }) {
    return (
      <div style={{ height: "200px", width: "300px" }}>
        <ScrollArea>
          <div style={{ height: tall ? "900px" : "100px", width: "100px" }}>grow me</div>
        </ScrollArea>
      </div>
    );
  }

  const view = render(<Growable tall={false} />);
  await userEvent.hover(page.getByText("grow me"));
  await expect.poll(viewportOverflow).toEqual({ x: "hidden", y: "hidden" });

  // The `ResizeObserver` re-measure is what makes locking the axis safe rather than a way
  // of stranding content: without it, an area that started out fitting would never scroll
  // again no matter how much content arrived.
  view.rerender(<Growable tall />);
  await expect.poll(viewportOverflow).toEqual({ x: "hidden", y: "scroll" });

  const vp = document.querySelector<HTMLElement>("[data-scroll-area-viewport]");
  vp?.scrollTo({ top: 300 });
  await expect.poll(() => vp?.scrollTop).toBeGreaterThan(0);
});

/**
 * The other way content becomes unreachable, and the one that needs no rounding artefact
 * to happen: the scrolling box growing past the box that clips it.
 *
 * `height: 100%` resolves against the containing block's *specified* height, so an
 * ancestor sized by its content — a popup that fits what it holds, a menu, a dialog
 * capped by `max-height` rather than `height` — makes the percentage resolve to `auto`,
 * and the viewport grows to its content instead of capping it. Scrollbars and `overflow`
 * all still look right; the viewport simply extends past the clip, and the stretch beyond
 * it cannot be brought into view at any scroll position. Measured on a modal before the
 * fix: a 796px viewport inside a 650px clip, with the last 146px of the form unreachable.
 */
test("content stays reachable when an ancestor is sized by its content", async () => {
  render(
    // A popup that fits its content but caps: `height: fit-content` with a `max-height`,
    // which is how every menu and dialog in the app is sized.
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "fit-content",
        maxHeight: "400px",
        width: "300px",
        overflow: "clip",
      }}
      data-testid="popup"
    >
      <ScrollArea
        orientation="vertical"
        header={<div style={{ height: "40px" }}>header</div>}
        footer={<div style={{ height: "40px" }}>footer</div>}
      >
        <div>
          <div style={{ height: "1990px" }} />
          <div data-testid="end" style={{ height: "10px" }}>
            end
          </div>
        </div>
      </ScrollArea>
    </div>,
  );

  const vp = () => document.querySelector<HTMLElement>("[data-scroll-area-viewport]");
  await expect.poll(() => vp()).not.toBeNull();

  // The scrolling box must fit inside the popup that clips it. A viewport taller than its
  // clip is the defect itself, whatever the scrollbars say.
  const popup = document.querySelector<HTMLElement>('[data-testid="popup"]')!;
  await expect
    .poll(() => vp()!.clientHeight <= Math.ceil(popup.getBoundingClientRect().height))
    .toBe(true);

  // And the functional claim: scrolled as far as it will go, the end of the content is
  // actually on screen. This is what "unreachable" means, and it is measured rather than
  // inferred from `overflow` — a synthetic wheel event drives no native scrolling and
  // would report zero either way.
  vp()!.scrollTop = vp()!.scrollHeight;
  await expect
    .poll(() => {
      const end = document.querySelector<HTMLElement>('[data-testid="end"]')!;
      return Math.round(end.getBoundingClientRect().bottom - popup.getBoundingClientRect().bottom);
    })
    .toBeLessThanOrEqual(0);
});

/**
 * A vertical-only area has no horizontal axis, and must not acquire one from its content.
 *
 * Base UI sets `min-width: fit-content` on the content wrapper so that content wider than
 * the viewport can drive horizontal scrolling. On an area with `orientation="vertical"`
 * that is actively wrong: the wrapper sizes to the widest thing inside it, the measurement
 * sees horizontal overflow, and the axis stays a scroll container — with no horizontal
 * scrollbar of its own, since those are gated on the orientation. So the area scrolls
 * sideways and shows nothing for it, which is the WebKit native-bar case in another guise.
 *
 * A `nowrap` label is the case that reaches this in the app rather than a contrived one:
 * it is the standard menu-item pattern, and every menu, dropdown, combobox and modal in
 * the package is vertical. Its `min-content` width is the whole untruncated label, so
 * `fit-content` resolves to that, and the label's own `text-overflow` stops clipping at
 * the popup's width — the ellipsis silently disappears.
 */
test("a vertical area does not gain a horizontal axis from a nowrap label", async () => {
  render(
    <div style={{ height: "150px", width: "200px" }}>
      <ScrollArea orientation="vertical">
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          a menu item label far longer than two hundred pixels of available width
        </div>
      </ScrollArea>
    </div>,
  );
  const vp = () => document.querySelector<HTMLElement>("[data-scroll-area-viewport]")!;
  await expect.poll(() => getComputedStyle(vp()).overflowX).toBe("hidden");
  // Not just the computed style: the box must not have anything to scroll to either.
  await expect.poll(() => vp().scrollWidth).toBe(vp().clientWidth);
});
