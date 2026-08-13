import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "@vitest/browser/context";
import type { RectReadOnly } from "react-use-measure";
import { PaneRegion } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { usePanes } from "../../hooks/layout-atoms";
import { Icon } from "../../icons/registry";
import "../../test-stylesheet";
import { LayoutRoot } from "./root";

/**
 * A side pane taking the content area's room by SPANNING onto it, rather than by
 * collapsing the content track.
 *
 * The distinction is the whole test. Collapsing the track — what a `size: "full"`
 * pane does — sets `--content-size: 0fr`, and anything framing itself from the
 * measured content rect is then told it has no width: a 3D canvas reprojects to
 * nothing and has to recover on the way back, a restore needs a width remembered
 * from before, and resizing the window mid-expansion has nothing to recompute
 * from. Spanning leaves every track exactly as it was, so the rect stays live and
 * truthful the entire time something is covering it.
 *
 * Needs the real stylesheet: the span is `grid-column: left-start / content-end` in
 * `public/styles.css`, and the class emitting it sits on the layout root itself, so
 * a rule written as a descendant selector matches nothing and the pane silently
 * stays its ordinary width.
 */

const DESKTOP = { width: 1024, height: 800 } as const;
const WIDER = { width: 1320, height: 800 } as const;
const PANE_WIDTH = 280;

const el = (selector: string): HTMLElement => {
  const found = document.querySelector<HTMLElement>(selector);
  if (!found) throw new Error(`no element for ${selector}`);
  return found;
};

const widthOf = (selector: string): number => Math.round(el(selector).getBoundingClientRect().width);
const rightOf = (selector: string): number => Math.round(el(selector).getBoundingClientRect().right);
const layoutVar = (name: string): string =>
  getComputedStyle(el(".app-layout")).getPropertyValue(name).trim();
const expandedClass = (): boolean => el(".app-layout").classList.contains("left-sidebar-full");

/** What the content occupant is told, as opposed to what the DOM actually is. */
const reportedWidth = (): number => Number(el("[data-testid='probe']").dataset.width ?? "-1");
const reportedVisible = (): string => el("[data-testid='probe']").dataset.visible ?? "";

/** Column count of the pane's own content grid, which is driven by a container query. */
const paneColumns = (): number =>
  getComputedStyle(el("[data-testid='pane-grid']")).gridTemplateColumns.split(" ").length;

function PaneBody() {
  return (
    // Asks how wide THE PANE is, not the window. A viewport breakpoint cannot see
    // the right sidebar taking room, and an expanding pane changes width with the
    // window standing still — so the two questions have different answers, and this
    // is the one that is right for pane content.
    <div data-testid="pane-grid" className="@[400px]/pane:grid-cols-2 grid grid-cols-1">
      <span>Pane body</span>
      <span>Second cell</span>
    </div>
  );
}

/**
 * Drives the panes through the same public surface a consumer uses. A sibling of
 * `LayoutRoot` rather than its child, because the children become the backdrop
 * layer and these controls have to stay clickable while a pane covers it.
 */
function PaneHarness() {
  const { setPane, togglePaneRegion } = useLayoutActions();
  const panes = usePanes();
  const expanded = panes.find((pane) => pane.id === "assets")?.expanded === true;

  useEffect(() => {
    setPane({
      id: "assets",
      name: "Assets",
      icon: <Icon name="square" />,
      size: `${PANE_WIDTH.toString()}px`,
      inLeftMenu: true,
      inRightMenu: false,
      content: <PaneBody />,
    });
    setPane({
      id: "inspector",
      name: "Inspector",
      icon: <Icon name="square" />,
      size: "200px",
      inLeftMenu: false,
      inRightMenu: true,
      content: <p>Inspector body</p>,
    });
  }, [setPane]);

  return (
    <div className="fixed top-0 left-0 z-50 flex gap-2">
      <button type="button" onClick={() => togglePaneRegion(PaneRegion.Left, "assets")}>
        toggle left
      </button>
      <button type="button" onClick={() => togglePaneRegion(PaneRegion.Right, "inspector")}>
        toggle right
      </button>
      <button type="button" onClick={() => setPane({ id: "assets", expanded: !expanded })}>
        toggle expand
      </button>
    </div>
  );
}

function Probe(bounds: RectReadOnly, contentVisible: boolean) {
  return (
    <div
      data-testid="probe"
      data-width={Math.round(bounds.width)}
      data-visible={String(contentVisible)}
    />
  );
}

test("an expanded pane spans over the content instead of collapsing its track", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  render(
    <>
      <PaneHarness />
      <LayoutRoot>{Probe}</LayoutRoot>
    </>,
  );

  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(() => widthOf(".grid-area-left")).toBe(PANE_WIDTH);

  const restingContent = widthOf(".grid-area-content");
  expect(restingContent).toBeGreaterThan(0);
  // The occupant is told the same thing the DOM says. Everything below is about
  // keeping that true while a pane covers it.
  await expect.poll(reportedWidth).toBe(restingContent);
  expect(reportedVisible()).toBe("true");
  expect(paneColumns()).toBe(1);

  await userEvent.click(page.getByRole("button", { name: "toggle expand" }));
  await expect.poll(expandedClass).toBe(true);

  // Not one track moved: the pane still declares its own width and the content
  // column is still `1fr`. This is what a `size: "full"` pane cannot say.
  expect(layoutVar("--left-size")).toBe(`${PANE_WIDTH.toString()}px`);
  expect(layoutVar("--content-size")).toBe("1fr");
  expect(widthOf(".grid-area-content")).toBe(restingContent);
  await expect.poll(reportedWidth).toBe(restingContent);

  // The pane really is over the content — same right edge, wider than either the
  // pane's own track or the content's.
  expect(widthOf(".grid-area-left")).toBeGreaterThan(restingContent);
  expect(rightOf(".grid-area-left")).toBe(rightOf(".grid-area-content"));

  // Covered, and the occupant is told so — an optimisation signal, not a
  // correctness one, since the rect above stayed truthful regardless.
  await expect.poll(reportedVisible).toBe("false");

  // The pane got wider without the window moving, and its content noticed. That is
  // only possible through the pane's own container.
  expect(getComputedStyle(el(".\\@container\\/pane")).containerName).toBe("pane");
  expect(paneColumns()).toBe(2);

  // Resizing WHILE expanded. Nothing was stashed at expansion time, so there is
  // nothing to go stale: the content cell recomputes and the occupant is told.
  await page.viewport(WIDER.width, WIDER.height);
  await expect.poll(() => widthOf(".grid-area-content")).toBeGreaterThan(restingContent);
  const widened = widthOf(".grid-area-content");
  await expect.poll(reportedWidth).toBe(widened);
  expect(expandedClass()).toBe(true);
  expect(rightOf(".grid-area-left")).toBe(rightOf(".grid-area-content"));

  // A second pane opening mid-expansion pushes the span's far edge in, rather than
  // the span running under it: `content-end` is a grid line, not the window edge.
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));
  await expect.poll(() => widthOf(".grid-area-content")).toBeLessThan(widened);
  expect(rightOf(".grid-area-left")).toBe(rightOf(".grid-area-content"));
  expect(rightOf(".grid-area-left")).toBeLessThan(rightOf(".grid-area-right"));
  const shared = widthOf(".grid-area-content");
  await expect.poll(reportedWidth).toBe(shared);

  // Restoring needs no remembered width — the track never stopped computing one,
  // including across the resize and the second pane that both happened while
  // expanded.
  await userEvent.click(page.getByRole("button", { name: "toggle expand" }));
  await expect.poll(expandedClass).toBe(false);
  expect(widthOf(".grid-area-left")).toBe(PANE_WIDTH);
  expect(widthOf(".grid-area-content")).toBe(shared);
  await expect.poll(reportedVisible).toBe("true");
  expect(paneColumns()).toBe(1);
});
