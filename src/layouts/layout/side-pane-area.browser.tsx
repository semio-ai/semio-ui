import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { PaneRegion } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { usePanes } from "../../hooks/layout-atoms";
import { Icon } from "../../icons/registry";
import "../../test-stylesheet";
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

const PANE_ICON = <Icon name="action-placeholder" />;

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
  const { setPane, setPanes, togglePaneRegion } = useLayoutActions();
  const collapsed = usePanes().find((pane) => pane.id === "left-pane")?.collapsed === true;

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
      <button type="button" onClick={() => setPane({ id: "left-pane", collapsed: !collapsed })}>
        collapse left
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

test("mobile header controls keep their size and position while the inspector toggles", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout();

  const headerButton = (label: string): HTMLButtonElement => {
    const button = document.querySelector<HTMLButtonElement>(
      `.grid-area-header button[aria-label="${label}"]`,
    );
    if (!button) throw new Error(`Missing header button: ${label}`);
    return button;
  };
  const rect = (label: string) => {
    const { x, y, width, height } = headerButton(label).getBoundingClientRect();
    return { x, y, width, height };
  };

  await expect.element(page.getByRole("button", { name: "Open inspector" })).toBeEnabled();
  const menuBefore = rect("Toggle Menu");
  const inspectBefore = rect("Open inspector");
  expect(menuBefore.width).toBe(inspectBefore.width);
  expect(menuBefore.height).toBe(inspectBefore.height);

  await userEvent.click(headerButton("Open inspector"));
  await expect.poll(sidePanes).toEqual({ ids: ["right-pane"], showing: "right-pane" });
  expect(rect("Toggle Menu")).toEqual(menuBefore);
  expect(rect("Close inspector")).toEqual(inspectBefore);

  await userEvent.click(headerButton("Close inspector"));
  await expect.poll(() => sidePanes().ids).toEqual([]);
  expect(rect("Open inspector")).toEqual(inspectBefore);
});

test("below the breakpoint, both side regions share one row and stack", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout();

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
  const paneClose = document.querySelector<HTMLButtonElement>(
    '.grid-area-side button[aria-label="Close inspector"]',
  );
  if (!paneClose) throw new Error("Missing inspector close button in the side pane");
  await userEvent.click(paneClose);
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane"], showing: "left-pane" });
  expect(hiddenPaneIds()).toEqual([]);

  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(() => sidePanes().ids).toEqual([]);
});

test("with both regions open, the toggle of a covered pane brings it forward", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout();

  // Opened in the opposite order to the test above: whichever went last is on top,
  // so neither region outranks the other.
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));
  await expect.poll(sidePanes).toEqual({ ids: ["right-pane"], showing: "right-pane" });
  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(sidePanes).toEqual({ ids: ["right-pane", "left-pane"], showing: "left-pane" });

  // The right pane is open but covered, so its toggle means "show me that" — not
  // "close it". Closing something the viewer cannot see changes nothing on screen,
  // which reads as a dead control and takes two presses to get the pane asked for.
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane", "right-pane"], showing: "right-pane" });

  // Now that it IS the one showing, the same toggle closes it and the left pane —
  // never closed, only covered — comes back.
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane"], showing: "left-pane" });
  await expect.element(page.getByText("Left pane body")).toBeVisible();
});

test("in the shared row, a collapsed pane stops showing but stays mounted", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout();

  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane"], showing: "left-pane" });

  // Every pane is a named query container, at BOTH arrangements. Docked and shared
  // are different wrappers, and pane content asking `@[…]/pane:` must not silently
  // start resolving against something else as the viewport crosses the breakpoint.
  const pane = document.querySelector<HTMLElement>('[data-testid="side-pane"]');
  expect(getComputedStyle(pane!).containerName).toBe("pane");

  await userEvent.click(page.getByRole("button", { name: "collapse left" }));

  // Collapsed means it gave up its space, so the row must not still be sized by it
  // and it must not still be the pane on top — the docked regions already exclude
  // collapsed panes from their widths, and the shared row has to agree.
  await expect
    .poll(() =>
      getComputedStyle(document.querySelector<HTMLElement>(".app-layout")!).getPropertyValue(
        "--side-size",
      ),
    )
    .toBe("0fr");
  expect(sidePanes().showing).toBeNull();
  expect(hiddenPaneIds()).toEqual(["left-pane"]);

  // Still there, though — that is the difference from unregistering.
  await expect.element(page.getByText("Left pane body")).toBeInTheDocument();

  await userEvent.click(page.getByRole("button", { name: "collapse left" }));
  await expect.poll(sidePanes).toEqual({ ids: ["left-pane"], showing: "left-pane" });
});

test("above the breakpoint, the same panes dock concurrently", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await renderLayout();

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

  // Both are visible here, so nothing is ever covered and the bring-forward
  // behaviour must not apply: the left pane was opened first and still has the
  // lower open order, but its toggle has to close it rather than re-rank it.
  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect
    .poll(() => document.querySelector(".grid-area-left")?.textContent ?? "")
    .not.toContain("Left pane body");
  expect(document.querySelector(".grid-area-right")?.textContent).toContain("Right pane body");
});
