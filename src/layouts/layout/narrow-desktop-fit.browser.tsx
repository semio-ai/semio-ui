import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "@vitest/browser/context";
import { PaneRegion } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { Icon } from "../../icons/registry";
import "../../test-stylesheet";
import { LayoutRoot } from "./root";

/**
 * The docked arrangement must never paint outside itself.
 *
 * `desktop` is width-only at 768px, but the docked grid needs room for the menu
 * rail, a left pane, a content column AND a right pane. Between those two numbers
 * the layout became overconstrained, and because the side tracks were rigid lengths
 * — `var(--left-size)` and `var(--right-size)`, no `minmax` — the grid resolved it
 * by OVERFLOWING rather than by compressing:
 *
 * - `overflow-x: clip` on `.app-layout` then swallowed the overflow, so the right
 *   sidebar was simply not on screen.
 * - The menu's own content, wider than its squeezed `auto` track, was painted over
 *   by `Header` and the side panes — later siblings, so they win — clipping the
 *   wordmark and every nav label.
 *
 * Both were one root cause: a track that cannot give width back. Asserted as
 * geometry rather than by screenshot, because "it looks wrong at this size" is what
 * took a human noticing at one particular window width to find.
 *
 * Needs the real stylesheet — the grid is in `public/styles.css`, so a test with
 * mocked CSS would pass against any track definition at all.
 */

/** Wide enough to be "desktop" (min-width 48rem), far too narrow for both panes. */
const CRAMPED = { width: 800, height: 800 } as const;
/** Room for everything, so the cramped assertions cannot pass vacuously. */
const ROOMY = { width: 1600, height: 800 } as const;

/** Deliberately generous, so the sum cannot fit at `CRAMPED` on any platform. */
const LEFT_WIDTH = 400;
const RIGHT_WIDTH = 400;

const el = (selector: string): HTMLElement => {
  const found = document.querySelector<HTMLElement>(selector);
  if (!found) throw new Error(`no element for ${selector}`);
  return found;
};

const box = (selector: string): DOMRect => el(selector).getBoundingClientRect();

/** Both panes open, which is the arrangement that overflows. */
function BothPanesOpen() {
  const { setPanes, togglePaneRegion } = useLayoutActions();

  useEffect(() => {
    // REPLACE — panes live in a module-scoped store that outlives a render, so
    // merging would inherit whatever a previous test left open.
    setPanes(
      [
        {
          id: "assets",
          name: "Assets",
          icon: <Icon name="action-placeholder" />,
          size: `${LEFT_WIDTH.toString()}px`,
          inLeftMenu: true,
          inRightMenu: false,
          content: <p>Assets body</p>,
        },
        {
          id: "inspector",
          name: "Inspector",
          icon: <Icon name="action-placeholder" />,
          size: `${RIGHT_WIDTH.toString()}px`,
          inLeftMenu: false,
          inRightMenu: true,
          content: <p>Inspector body</p>,
        },
      ],
      true,
    );
    togglePaneRegion(PaneRegion.Left, "assets", true);
    togglePaneRegion(PaneRegion.Right, "inspector", true);
  }, [setPanes, togglePaneRegion]);

  return null;
}

test("a cramped desktop layout compresses its panes instead of painting outside itself", async () => {
  await page.viewport(ROOMY.width, ROOMY.height);
  render(
    <>
      <BothPanesOpen />
      <LayoutRoot />
    </>,
  );

  // ROOMY first, as the positive control: both panes really render and the menu
  // really occupies its own column. Without this, every assertion below would be
  // satisfied by a layout that simply failed to render a pane.
  await expect.poll(() => Math.round(box(".grid-area-right").width)).toBeGreaterThan(0);
  expect(Math.round(box(".grid-area-left").width)).toBeGreaterThan(0);
  expect(Math.round(box(".grid-area-menu").width)).toBeGreaterThan(0);

  await page.viewport(CRAMPED.width, CRAMPED.height);

  // The right pane stays INSIDE the layout. It used to be pushed past the right
  // edge and hidden by `overflow-x: clip`, so a viewer lost the inspector entirely
  // with nothing to say it was there.
  await expect
    .poll(() => Math.round(box(".grid-area-right").right))
    .toBeLessThanOrEqual(Math.round(box(".app-layout").right) + 1);

  // And the menu keeps its own space: nothing starts left of where the menu ends.
  // This is the overlap that clipped the wordmark and the nav labels.
  expect(Math.round(box(".grid-area-left").left)).toBeGreaterThanOrEqual(
    Math.round(box(".grid-area-menu").right) - 1,
  );

  // Still there, only narrower — compressing is the intended resolution, so a pane
  // collapsed to nothing would be a different bug wearing this fix's clothes.
  expect(Math.round(box(".grid-area-right").width)).toBeGreaterThan(0);
  expect(Math.round(box(".grid-area-left").width)).toBeGreaterThan(0);
});
