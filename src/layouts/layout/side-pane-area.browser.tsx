import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "@vitest/browser/context";
import { PaneRegion } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { Icon } from "../../icons/registry";
import { LayoutRoot } from "./root";

/**
 * Side panes get a track each where there is width to dock them, and share one row
 * where there is not. The arrangement adapts; what is available does not.
 *
 * A browser test because every part of it is live-DOM: the breakpoint is a real
 * media query, which container a pane lands in follows from it, and the stack is
 * `AnimatePresence` mounting and unmounting for real. The regression being guarded
 * is a Right-region pane *disappearing* below the breakpoint instead of moving — a
 * feature placed there used to exist only on desktop.
 *
 * The viewport is set before render rather than resized into, because the headless
 * browser's device-metrics override does not reliably dispatch the `matchMedia`
 * change event the breakpoint hook listens for. That the hook tracks changes in
 * both directions is covered by `use-is-desktop.test.tsx`.
 */

const MOBILE = { width: 500, height: 900 } as const;
const DESKTOP = { width: 1024, height: 800 } as const;

const PANE_ICON = <Icon name="square" />;

/** The stack, bottom-first, as pane ids — and which of them is showing. */
function sidePanes(): { ids: string[]; showing: string | null } {
  const panes = [...document.querySelectorAll<HTMLElement>('[data-testid="side-pane"]')];
  return {
    ids: panes.map((pane) => pane.dataset.paneId ?? ""),
    showing: panes.find((p) => p.dataset.paneShowing !== undefined)?.dataset.paneId ?? null,
  };
}

function hiddenPaneIds(): string[] {
  return [...document.querySelectorAll<HTMLElement>('[data-testid="side-pane"]')]
    .filter((pane) => pane.getAttribute("aria-hidden") === "true")
    .map((pane) => pane.dataset.paneId ?? "");
}

/**
 * Registers one pane per side region and exposes a toggle for each — the same
 * public surface a consumer uses, so the test drives the pane system the way the
 * app does rather than reaching into its state.
 *
 * A sibling of `LayoutRoot` rather than its children, which become the backdrop
 * layer: the toggles have to stay clickable while a pane is open.
 */
function PaneHarness() {
  const { setPanes, togglePaneRegion } = useLayoutActions();

  useEffect(() => {
    setPanes(
      [
        {
          id: "left-pane",
          name: "Left Pane",
          icon: PANE_ICON,
          size: "400px",
          inLeftMenu: true,
          inRightMenu: false,
          content: <p>Left pane body</p>,
        },
        {
          id: "right-pane",
          name: "Right Pane",
          icon: PANE_ICON,
          size: "320px",
          inLeftMenu: false,
          inRightMenu: true,
          content: <p>Right pane body</p>,
        },
      ],
      true,
    );
  }, [setPanes]);

  return (
    <div className="fixed top-0 left-0 z-50 flex gap-2">
      <button type="button" onClick={() => togglePaneRegion(PaneRegion.Left, "left-pane")}>
        toggle left
      </button>
      <button type="button" onClick={() => togglePaneRegion(PaneRegion.Right, "right-pane")}>
        toggle right
      </button>
    </div>
  );
}

function renderLayout() {
  return render(
    <>
      <PaneHarness />
      <LayoutRoot />
    </>,
  );
}

test("below the breakpoint, both side regions share one row and stack", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  renderLayout();

  // No per-region tracks at this width; one shared row instead.
  expect(document.querySelector(".grid-area-left")).toBeNull();
  expect(document.querySelector(".grid-area-right")).toBeNull();
  expect(document.querySelector(".grid-area-side")).not.toBeNull();

  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane"], showing: "left-pane" });
  // The row takes the size the showing pane asks for.
  await expect
    .poll(() =>
      getComputedStyle(document.querySelector<HTMLElement>(".app-layout")!).getPropertyValue(
        "--side-size",
      ),
    )
    .toBe("400px");

  // The Right pane is the regression: it must arrive in the shared row rather than
  // vanish, and it must cover the Left pane rather than replace it.
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane", "right-pane"], showing: "right-pane" });
  expect(hiddenPaneIds()).toEqual(["left-pane"]);
  // Still mounted underneath — going back to it returns it as it was left.
  await expect.element(page.getByText("Left pane body")).toBeInTheDocument();
  await expect
    .poll(() =>
      getComputedStyle(document.querySelector<HTMLElement>(".app-layout")!).getPropertyValue(
        "--side-size",
      ),
    )
    .toBe("320px");

  // Closing the pane on top reveals the one beneath rather than emptying the row.
  await userEvent.click(page.getByRole("button", { name: "Close panel" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane"], showing: "left-pane" });
  expect(hiddenPaneIds()).toEqual([]);

  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(() => sidePanes().ids).toEqual([]);
});

test("above the breakpoint, the same panes dock concurrently", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  renderLayout();

  expect(document.querySelector(".grid-area-side")).toBeNull();

  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));

  // Concurrent, each in its own track — no stack, nothing hidden.
  await expect
    .poll(() => document.querySelector(".grid-area-left")?.textContent)
    .toContain("Left pane body");
  await expect
    .poll(() => document.querySelector(".grid-area-right")?.textContent)
    .toContain("Right pane body");
  expect(document.querySelectorAll('[data-testid="side-pane"]')).toHaveLength(0);
});
