import { useEffect, useRef, useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "@vitest/browser/context";
import { PaneRegion } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { usePanes } from "../../hooks/layout-atoms";
import { Icon } from "../../icons/registry";
import "../../test-stylesheet";
import { LayoutRoot } from "./root";

/**
 * Freeing a region's space WITHOUT unmounting what is in it.
 *
 * Unregistering the pane was the only way to do this, and it takes the content
 * with it. That is not free: the studio's animation panel keeps its height in its
 * own state, so unregistering lost the height the viewer had dragged, and coming
 * back re-created an R3F canvas — which measures its container on mount and can
 * latch onto a mid-cascade size, leaving the scene framed wrongly until something
 * else disturbs it.
 *
 * Collapsing makes the same thing a RESIZE: the path a resizable pane already
 * takes on every drag. The half of this test that unregisters is the control — it
 * shows the mount actually would have repeated, so the other half is not passing
 * because nothing was ever at risk.
 */

const DESKTOP = { width: 1024, height: 800 } as const;
const FOOTER_HEIGHT = 140;

/**
 * Module-scoped deliberately: it has to outlive the component to record a repeat
 * mount. A counter in state would be destroyed by the very unmount it is there to
 * detect.
 */
let mounts = 0;

const el = (selector: string): HTMLElement | null => document.querySelector<HTMLElement>(selector);

const heightOf = (selector: string): number => {
  const found = el(selector);
  return found ? Math.round(found.getBoundingClientRect().height) : -1;
};

const footerGap = (): string => {
  const root = el(".app-layout");
  return root ? getComputedStyle(root).getPropertyValue("--content-footer-gap").trim() : "";
};

const body = (): HTMLElement | null => el("[data-testid='footer-body']");

/** The pane wrapper — the element carrying the size, not the content inside it. */
const paneWrapper = (): HTMLElement | null =>
  body()?.closest<HTMLElement>("[class*='container/pane']") ?? null;

/**
 * Records the footer row's height every frame for long enough to cover the
 * collapse, starting immediately — so it is already sampling when the click that
 * begins the animation lands.
 */
function sampleFooterHeights(): Promise<number[]> {
  const heights: number[] = [];
  return new Promise((resolve) => {
    const deadline = performance.now() + 400;
    const tick = () => {
      heights.push(heightOf(".grid-area-footer"));
      if (performance.now() < deadline) {
        requestAnimationFrame(tick);
      } else {
        resolve(heights);
      }
    };
    requestAnimationFrame(tick);
  });
}

const TALLER_HEIGHT = 260;

/**
 * Stands in for the animation panel: viewer-produced state that lives in the
 * content rather than the pane spec, a height it decides for itself, and a mount
 * that is not free to repeat.
 */
function FooterBody() {
  const [height, setHeight] = useState(FOOTER_HEIGHT);
  const [note, setNote] = useState("initial");
  // Lazy ref rather than lazy state: this is claimed once per mount and never
  // read as state. The guard also makes it idempotent, so a double-invoked
  // render cannot inflate the count the test is reading.
  const mountIndexRef = useRef(0);
  if (mountIndexRef.current === 0) {
    mounts += 1;
    mountIndexRef.current = mounts;
  }
  const mountIndex = mountIndexRef.current;

  return (
    <div
      data-testid="footer-body"
      data-mount-index={mountIndex}
      data-note={note}
      style={{ height: `${height.toString()}px` }}
    >
      <button type="button" onClick={() => setNote("edited")}>
        edit note
      </button>
      <button type="button" onClick={() => setHeight(TALLER_HEIGHT)}>
        grow
      </button>
    </div>
  );
}

function PaneHarness() {
  const { setPane, setPanes, removePane } = useLayoutActions();
  const panes = usePanes();
  const collapsed = panes.find((pane) => pane.id === "timeline")?.collapsed === true;

  useEffect(() => {
    // REPLACE, so each test starts from the same arrangement rather than
    // inheriting whatever the previous one left registered — panes live in a
    // module-scoped store that outlives a render.
    setPanes(
      [
        {
          id: "timeline",
          name: "Timeline",
          icon: <Icon name="square" />,
          size: "auto",
          region: PaneRegion.Footer,
          inLeftMenu: false,
          inRightMenu: false,
          content: <FooterBody />,
        },
      ],
      true,
    );
  }, [setPanes]);

  return (
    <div className="fixed top-0 left-0 z-50 flex gap-2">
      <button type="button" onClick={() => setPane({ id: "timeline", collapsed: !collapsed })}>
        toggle collapse
      </button>
      <button
        type="button"
        onClick={() => {
          removePane("timeline");
        }}
      >
        unregister
      </button>
      <button
        type="button"
        onClick={() => {
          setPane({
            id: "timeline",
            name: "Timeline",
            icon: <Icon name="square" />,
            size: "auto",
            region: PaneRegion.Footer,
            inLeftMenu: false,
            inRightMenu: false,
            collapsed: false,
            content: <FooterBody />,
          });
        }}
      >
        re-register
      </button>
    </div>
  );
}

test("a collapsed pane gives up its space but keeps its content mounted", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  render(
    <>
      <PaneHarness />
      <LayoutRoot />
    </>,
  );

  await expect.poll(() => heightOf(".grid-area-footer")).toBe(FOOTER_HEIGHT);
  expect(body()?.dataset.mountIndex).toBe("1");
  expect(footerGap()).not.toBe("0px");
  const restingContent = heightOf(".grid-area-content");

  // State the viewer produced, which is what unmounting would throw away.
  await userEvent.click(page.getByRole("button", { name: "edit note" }));
  await expect.poll(() => body()?.dataset.note).toBe("edited");

  // Collapsing stands in for unregistering, so it has to LOOK like it too. Sampled
  // rather than asserted on a declaration, because a declaration can be perfectly
  // correct and still animate nothing: a CSS transition on `height` cannot
  // interpolate the `auto` this row resolves to, so it silently snaps while
  // reporting a 150ms duration. Only the intermediate sizes prove otherwise.
  const sampler = sampleFooterHeights();
  await userEvent.click(page.getByRole("button", { name: "toggle collapse" }));
  const midFlight = await sampler;
  expect(midFlight.some((height) => height > 0 && height < FOOTER_HEIGHT)).toBe(true);

  // No size, no hit target, not announced — and the region stops holding its gap
  // open, so the layout does not keep a strip of padding for something with none.
  await expect.poll(() => heightOf(".grid-area-footer")).toBe(0);
  await expect.poll(footerGap).toBe("0px");
  await expect.poll(() => heightOf(".grid-area-content")).toBeGreaterThan(restingContent);

  // Still there, though: same mount, same state. This is the whole point.
  expect(body()).not.toBeNull();
  expect(body()?.dataset.mountIndex).toBe("1");
  expect(body()?.dataset.note).toBe("edited");
  expect(body()?.closest("[inert]")).not.toBeNull();

  await userEvent.click(page.getByRole("button", { name: "toggle collapse" }));

  // Comes back the size it was, without the pane spec having stored a height —
  // the content never stopped declaring one.
  await expect.poll(() => heightOf(".grid-area-footer")).toBe(FOOTER_HEIGHT);
  expect(body()?.dataset.mountIndex).toBe("1");
  expect(body()?.dataset.note).toBe("edited");
  expect(mounts).toBe(1);

  // The control. Unregistering frees the same space by unmounting, so the state is
  // gone and coming back is a fresh mount — which is what collapsing avoids, and
  // what makes the assertions above mean something.
  await userEvent.click(page.getByRole("button", { name: "unregister" }));
  await expect.poll(body).toBeNull();

  await userEvent.click(page.getByRole("button", { name: "re-register" }));
  await expect.poll(() => body()?.dataset.mountIndex).toBe("2");
  expect(body()?.dataset.note).toBe("initial");
  expect(mounts).toBe(2);
});

test("the footer row follows its content's height, before and after a collapse", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  render(
    <>
      <PaneHarness />
      <LayoutRoot />
    </>,
  );

  // The layout does not tell footer content how tall to be, and must not start:
  // the footer row is `minmax(0, auto)` and no `PaneSpec.size` feeds it, so the
  // height belongs entirely to whatever is placed there. The studio's animation
  // panel relies on this — it owns a height the viewer drags and hands an explicit
  // one to `AnimationSheet`, which is what keeps `@semio/animation` free of any
  // knowledge of panes and usable somewhere other than this row.
  await expect.poll(() => heightOf(".grid-area-footer")).toBe(FOOTER_HEIGHT);

  await userEvent.click(page.getByRole("button", { name: "grow" }));
  await expect.poll(() => heightOf(".grid-area-footer")).toBe(TALLER_HEIGHT);

  // Surviving a collapse is the part that could regress: animating to `auto`
  // means measuring, and a tween that finished by pinning the measured pixels
  // would silently make the pane the authority on its content's height.
  await userEvent.click(page.getByRole("button", { name: "toggle collapse" }));
  await expect.poll(() => heightOf(".grid-area-footer")).toBe(0);
  await userEvent.click(page.getByRole("button", { name: "toggle collapse" }));
  await expect.poll(() => heightOf(".grid-area-footer")).toBe(TALLER_HEIGHT);

  // Nothing definite left behind on the wrapper — `auto` is the pane declining to
  // have an opinion, which is the whole isolation claim.
  //
  // Polled, not read once: the tween writes pixels the whole way and only settles
  // on `auto` at the end, while the row assertion above is satisfied a beat earlier
  // because it rounds. Read once, this caught a mid-tween `259.653px` about one run
  // in three — and only under the full suite, never running this file alone.
  await expect.poll(() => paneWrapper()?.style.height).toBe("auto");
});
