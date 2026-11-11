import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
// Real geometry: the scroll area needs a bounded height for its content to overflow.
import "../test-stylesheet";
import { ScrollArea } from "../layouts/scroll-area";
import { Tooltip } from "./tooltip";

/**
 * A tooltip inside a `ScrollArea` closes when its trigger scrolls, and stays open when the
 * pointer enters the area.
 *
 * Tooltip listens for trusted ancestor scrolls in capture. `ScrollArea` dispatches
 * a scroll event for measurement whenever the pointer enters its viewport. That event
 * moves nothing and must leave the explanation visible. A real scroll provides the
 * control that verifies dismissal still works.
 */

const REASON = "Ask the owner for Editor access";

const settle = async (frames = 4) => {
  for (let i = 0; i < frames; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

/**
 * The open tooltip's text, or null when none is open. Read by state rather than presence:
 * a tooltip that closes before its entry animation has started stays mounted until that
 * animation ends.
 */
const openTooltip = () =>
  document.querySelector('.tooltip-content[data-state$="open"]')?.textContent ?? null;

const viewport = () => document.querySelector<HTMLElement>("[data-scroll-area-viewport]")!;

async function renderTooltipInScrollArea() {
  await render(
    <div>
      <div style={{ height: "40px" }}>Outside</div>
      <div style={{ height: "150px", width: "200px" }}>
        <ScrollArea>
          <div style={{ height: "40px" }}>Above</div>
          {/* Beside its trigger, so the tooltip covers nothing the pointer is sent to. */}
          <Tooltip content={REASON} side="right">
            <button type="button">Add</button>
          </Tooltip>
          <div style={{ height: "600px" }}>Below</div>
        </ScrollArea>
      </div>
    </div>,
  );
  // The pointer rests outside the area, so that moving it in later is an entry.
  await userEvent.hover(page.getByText("Outside"));
  // Keyboard focus opens the tooltip with no pointer involved. The overflowing viewport is a
  // tab stop of its own, ahead of the button.
  await userEvent.keyboard("{Tab}{Tab}");
  await expect.element(page.getByRole("button", { name: "Add" })).toHaveFocus();
  await expect.poll(openTooltip).toContain(REASON);
}

test("an open tooltip stays open when the pointer enters its scroll area", async () => {
  await renderTooltipInScrollArea();
  await userEvent.hover(page.getByText("Above"));
  await settle(8);
  expect(openTooltip()).toContain(REASON);
});

test("an open tooltip closes when its scroll area scrolls", async () => {
  await renderTooltipInScrollArea();
  viewport().scrollTop = 30;
  await expect.poll(openTooltip).toBeNull();
});
