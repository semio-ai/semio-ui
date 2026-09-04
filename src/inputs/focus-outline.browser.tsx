import { afterEach, expect, test } from "vitest";
import "../test-stylesheet";

/**
 * The focus ring is ONE signal, whatever the control shows at rest.
 *
 * Two variants draw a control's edge: `variant-responsive-appearing-outline`, which
 * shows nothing until you reach for it, and `variant-responsive-persistent-outline`,
 * which carries a line at rest because its label sits outside it. **Focused, they
 * must be indistinguishable.** A reader learns one appearance for "this is the field
 * I am typing into", and a field that answers differently depending on a styling
 * choice made three components away teaches them that the difference means something.
 *
 * The failure this pins is not hypothetical and is invisible in review: the persistent
 * variant signalled focus by thickening its resting line 1px → 2px, at offset 0, in
 * the same grey. Held against the fill, that reads as the field's edge closing in on
 * its own text — and on a hovered field it read as going backwards, since the hover
 * rule lifts the edge to the accent and a `:focus` rule pinned it back to grey.
 *
 * ⚠ THE REAL STYLESHEET IS LOADED DELIBERATELY, and `resting outlines differ` is what
 * proves it arrived. Without it both classes are inert, every property computes to the
 * same initial value, and "the two agree when focused" passes on two elements that are
 * agreeing about nothing. That control fails first in that case, which is what lets
 * the rest be read as measurements — two mirrored subjects agreeing is not evidence
 * when both can be empty.
 *
 * ⚠ A REAL FOCUSED ELEMENT, not a rule read out of the stylesheet. `:focus` is the
 * state under test; matching declaration text would pass on a rule the cascade never
 * applies, and these are utilities in a layered sheet where a later utility wins.
 *
 * ⚠ THE READ HAS TO WAIT FOR THE TRANSITION. Both variants transition their outline,
 * and `getComputedStyle` reports the ANIMATED value — so a read taken in the same tick
 * as `.focus()` returns the resting one. Every assertion here would then compare two
 * pre-focus states, and this file would report the old, broken stylesheet as correct.
 * {@link outlineOf} settles first; nothing may read an outline without it.
 */

const OUTLINE_VARIANTS = {
  appearing: "variant-responsive-appearing-outline",
  persistent: "variant-responsive-persistent-outline",
} as const;

const hosts: HTMLElement[] = [];

afterEach(() => {
  for (const host of hosts.splice(0)) host.remove();
});

interface Outline {
  width: string;
  offset: string;
  color: string;
}

/**
 * Mount a focusable control carrying `className`, settle it, and read its outline.
 *
 * An `<input>` rather than a `<div tabindex>`: `:focus` is the selector under test and
 * an input is what actually carries these classes in the package. It stays in the
 * document until the test ends, because `getComputedStyle` on a detached element
 * resolves nothing and reports the initial value for every property — which for
 * `outline-width` is a plausible-looking `3px` rather than an obvious blank.
 *
 * **Settling waits on the transitions themselves, not on a duration and not on the
 * value going quiet.** The duration comes from a token these variants do not name, so
 * a sleep long enough today is a flake the day it is raised. Waiting for the READ to
 * stop changing is worse and quietly so: a transition does not begin moving the
 * computed value for a frame or two after the class state changes, so "two agreeing
 * frames" agrees immediately — on the resting outline, which is precisely the state
 * the broken stylesheet left on a focused field. Both shortcuts fail towards passing.
 */
async function outlineOf(className: string, focused: boolean): Promise<Outline> {
  const host = document.createElement("div");
  const input = document.createElement("input");
  input.className = `responsive default ${className}`;
  host.appendChild(input);
  document.body.appendChild(host);
  hosts.push(host);
  if (focused) input.focus();

  // A transition is created during style recalculation, so one is forced here before
  // asking what is running. Asking first returns an empty list and the wait below
  // silently becomes a no-op, which reads the outline mid-transition.
  //
  // ⚠ Deliberately NOT `requestAnimationFrame`, which is the obvious way to wait for
  // a style change to land. A hidden page throttles rAF to nothing, so a frame wait
  // there does not resolve late — it does not resolve at all, and the test hangs to
  // its timeout rather than failing on a value.
  void getComputedStyle(input).outlineWidth;
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.race([
    // `allSettled`: a transition cancelled by another style change rejects, and that
    // is a finished transition for this purpose.
    Promise.allSettled(input.getAnimations().map((animation) => animation.finished)),
    // A ceiling on a transition that never ends, not the expected duration. Reaching
    // it reads whatever is there, so the assertion fails on the VALUE — which is the
    // diagnosis — rather than on a timeout that says nothing about the outline.
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);

  const style = getComputedStyle(input);
  return { width: style.outlineWidth, offset: style.outlineOffset, color: style.outlineColor };
}

test("resting outlines differ — the stylesheet is loaded and the two variants are distinct", async () => {
  const appearing = await outlineOf(OUTLINE_VARIANTS.appearing, false);
  const persistent = await outlineOf(OUTLINE_VARIANTS.persistent, false);

  // The whole point of the persistent variant: an edge with nobody reaching for it.
  expect(parseFloat(persistent.width)).toBeGreaterThan(0);
  expect(parseFloat(appearing.width)).toBe(0);
});

test("focused, the two variants are indistinguishable", async () => {
  const appearing = await outlineOf(OUTLINE_VARIANTS.appearing, true);
  const persistent = await outlineOf(OUTLINE_VARIANTS.persistent, true);

  expect(persistent).toEqual(appearing);
});

test("the focus ring is lifted off the control and takes the accent", async () => {
  const persistent = await outlineOf(OUTLINE_VARIANTS.persistent, true);
  const resting = await outlineOf(OUTLINE_VARIANTS.persistent, false);

  // Offset, so the ring sits clear of the fill instead of thickening against it —
  // which is what made focus read as the edge encroaching on the field's own text.
  expect(parseFloat(persistent.offset)).toBeGreaterThan(0);
  // Colour, not only geometry: growing the SAME grey line is a change a reader has to
  // measure against the field beside it to notice at all.
  expect(persistent.color).not.toBe(resting.color);
});
