import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { PaneRegion, type PaneSpec } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { Icon } from "../../icons/registry";
import "../../test-stylesheet";
import { LayoutRoot } from "./root";

/**
 * What the layout's own controls for a Right-region pane are called: the header's
 * side-panel toggle, the close button a docked pane carries, and the one a pane in
 * the narrow layout's shared row carries.
 *
 * The Right region holds whatever a consumer puts there, so those names come from
 * the pane (`openLabel` / `closeLabel`) and fall back to wording true of any pane.
 * Both halves are pinned at both arrangements, because each arrangement renders its
 * close button from a different component and either can drift alone.
 *
 * Viewports are set before render: the headless browser does not reliably dispatch
 * the `matchMedia` change the breakpoint hook listens for.
 */

const MOBILE = { width: 500, height: 900 } as const;
const DESKTOP = { width: 1024, height: 800 } as const;

const PANE_ICON = <Icon name="action-placeholder" />;

type Labels = Pick<PaneSpec, "openLabel" | "closeLabel">;

const UNNAMED: Labels = {};
// Names no implementation spells, so a control that hard-codes its wording — any
// wording — cannot pass the named-pane tests by coincidence.
const NAMED: Labels = { openLabel: "Open diagnostics", closeLabel: "Close diagnostics" };
const EMPTY: Labels = { openLabel: "", closeLabel: "" };

/**
 * One pane per side region, the Right one carrying `labels`. Registered through the
 * public actions, as a consumer does; the Left toggle is a sibling of `LayoutRoot`
 * so it stays clickable while a pane is open.
 */
function Harness({ labels }: { labels: Labels }) {
  const { setPanes, togglePaneRegion } = useLayoutActions();

  useEffect(() => {
    setPanes(
      [
        {
          id: "left-pane",
          name: "Left Pane",
          icon: PANE_ICON,
          size: "300px",
          inLeftMenu: true,
          inRightMenu: false,
          content: <p>Left pane body</p>,
        },
        {
          id: "right-pane",
          name: "Right Pane",
          icon: PANE_ICON,
          size: "300px",
          inLeftMenu: false,
          inRightMenu: true,
          content: <p>Right pane body</p>,
          ...labels,
        },
      ],
      true,
    );
  }, [setPanes, labels]);

  return (
    <div className="fixed top-0 left-0 z-50">
      <button type="button" onClick={() => togglePaneRegion(PaneRegion.Left, "left-pane")}>
        toggle left
      </button>
    </div>
  );
}

async function renderLayout(labels: Labels) {
  await render(
    <>
      <Harness labels={labels} />
      <LayoutRoot />
    </>,
  );
}

/** The `aria-label` of every labelled button in one area, an empty one included. */
function namesIn(area: string): string[] {
  return [...document.querySelectorAll<HTMLButtonElement>(`${area} button[aria-label]`)].map(
    (button) => button.getAttribute("aria-label") ?? "",
  );
}

function buttonIn(area: string, name: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(`${area} button[aria-label="${name}"]`);
  if (!button) throw new Error(`No "${name}" button in ${area}; found ${namesIn(area).join(", ")}`);
  return button;
}

const rightPaneShowing = () =>
  document.querySelector('[data-pane-id="right-pane"][data-pane-showing]') !== null;

test("narrow layout: an unnamed right pane's controls use neutral names", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout(UNNAMED);

  await expect.poll(() => namesIn(".grid-area-header")).toContain("Toggle side panel");
  await userEvent.click(buttonIn(".grid-area-header", "Toggle side panel"));
  await expect.poll(rightPaneShowing).toBe(true);

  // The toggle stays in place and becomes the way out; the pane carries its own too.
  expect(namesIn(".grid-area-header")).toContain("Close panel");
  expect(namesIn(".grid-area-side")).toContain("Close panel");
  expect(namesIn("body").filter((name) => /inspector/i.test(name))).toEqual([]);

  await userEvent.click(buttonIn(".grid-area-side", "Close panel"));
  await expect.poll(rightPaneShowing).toBe(false);
  await expect.poll(() => namesIn(".grid-area-header")).toContain("Toggle side panel");
});

test("narrow layout: a right pane's own names reach the toggle and its close button", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout(NAMED);

  await expect.poll(() => namesIn(".grid-area-header")).toContain("Open diagnostics");
  expect(namesIn("body")).not.toContain("Toggle side panel");
  await userEvent.click(buttonIn(".grid-area-header", "Open diagnostics"));
  await expect.poll(rightPaneShowing).toBe(true);

  expect(namesIn(".grid-area-header")).toContain("Close diagnostics");
  expect(namesIn(".grid-area-side")).toContain("Close diagnostics");
  expect(namesIn("body")).not.toContain("Close panel");

  // The header control closes it as well as the pane's own button does.
  await userEvent.click(buttonIn(".grid-area-header", "Close diagnostics"));
  await expect.poll(rightPaneShowing).toBe(false);
  await expect.poll(() => namesIn(".grid-area-header")).toContain("Open diagnostics");
});

test("narrow layout: covered by a left pane, the toggle is named for opening", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout(NAMED);

  await expect.poll(() => namesIn(".grid-area-header")).toContain("Open diagnostics");
  await userEvent.click(buttonIn(".grid-area-header", "Open diagnostics"));
  await expect.poll(rightPaneShowing).toBe(true);

  // Still open, but under the left pane: pressing the toggle brings it forward, so its
  // name has to say open, not close.
  await userEvent.click(page.getByRole("button", { name: "toggle left" }));
  await expect.poll(rightPaneShowing).toBe(false);
  expect(namesIn(".grid-area-header")).toContain("Open diagnostics");

  await userEvent.click(buttonIn(".grid-area-header", "Open diagnostics"));
  await expect.poll(rightPaneShowing).toBe(true);
  expect(namesIn(".grid-area-header")).toContain("Close diagnostics");
});

test("docked layout: an unnamed right pane's controls use neutral names", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await renderLayout(UNNAMED);

  await expect.poll(() => namesIn(".grid-area-header")).toContain("Toggle side panel");
  await userEvent.click(buttonIn(".grid-area-header", "Toggle side panel"));
  await expect.poll(() => namesIn(".grid-area-right")).toContain("Close panel");
  expect(namesIn("body").filter((name) => /inspector/i.test(name))).toEqual([]);

  await userEvent.click(buttonIn(".grid-area-right", "Close panel"));
  await expect
    .poll(() => document.querySelector(".grid-area-right")?.textContent ?? "")
    .not.toContain("Right pane body");
});

test("docked layout: a right pane's own names reach the toggle and its close button", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await renderLayout(NAMED);

  await expect.poll(() => namesIn(".grid-area-header")).toContain("Open diagnostics");
  expect(namesIn("body")).not.toContain("Toggle side panel");
  await userEvent.click(buttonIn(".grid-area-header", "Open diagnostics"));
  await expect.poll(() => namesIn(".grid-area-right")).toContain("Close diagnostics");
  expect(namesIn("body")).not.toContain("Close panel");
});

test("an empty name counts as unnamed", async () => {
  await page.viewport(MOBILE.width, MOBILE.height);
  await renderLayout(EMPTY);

  await expect.poll(() => namesIn(".grid-area-header")).toContain("Toggle side panel");
  await userEvent.click(buttonIn(".grid-area-header", "Toggle side panel"));
  await expect.poll(rightPaneShowing).toBe(true);
  expect(namesIn(".grid-area-side")).toContain("Close panel");
  expect(namesIn("body")).not.toContain("");
});
