import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Tooltip } from "./tooltip";

/**
 * A press on an `aria-disabled` trigger keeps its tooltip open.
 *
 * Such a press does nothing, and the tooltip is usually the reason the control is off,
 * so closing it would hide the explanation at the moment the reader acted. An enabled
 * trigger keeps Radix's behaviour and closes on press: that is the control case.
 */

const settle = async (frames = 4) => {
  for (let i = 0; i < frames; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

/** The visible tooltip surface's text, or null when no tooltip is open. */
const shownTooltip = () => document.querySelector(".tooltip-content")?.textContent ?? null;

test("pressing an aria-disabled trigger leaves its tooltip open", async () => {
  await render(
    <div style={{ padding: 40 }}>
      <Tooltip content="Ask the owner for Editor access">
        <span role="button" tabIndex={0} aria-disabled="true">
          Add
        </span>
      </Tooltip>
    </div>,
  );
  const trigger = page.getByRole("button", { name: "Add" });
  await trigger.hover();
  await expect.poll(shownTooltip).toContain("Ask the owner for Editor access");
  // `force`: Playwright will not press an `aria-disabled` element on its own.
  await trigger.click({ force: true });
  await settle(8);
  expect(shownTooltip()).toContain("Ask the owner for Editor access");
});

test("Enter and Space on an aria-disabled button leave its tooltip open", async () => {
  // A keyboard press on a button is a click with no pointerdown before it.
  await render(
    <div style={{ padding: 40 }}>
      <Tooltip content="Ask the owner for Editor access">
        <button type="button" aria-disabled="true">
          Add
        </button>
      </Tooltip>
    </div>,
  );
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "Add" })).toHaveFocus();
  await expect.poll(shownTooltip).toContain("Ask the owner for Editor access");
  for (const key of ["{Enter}", " "]) {
    await userEvent.keyboard(key);
    await settle(8);
    expect(shownTooltip()).toContain("Ask the owner for Editor access");
  }
});

test("pressing an enabled trigger closes its tooltip", async () => {
  await render(
    <div style={{ padding: 40 }}>
      <Tooltip content="Adds an asset">
        <button type="button">Add</button>
      </Tooltip>
    </div>,
  );
  const trigger = page.getByRole("button", { name: "Add" });
  await trigger.hover();
  await expect.poll(shownTooltip).toContain("Adds an asset");
  await trigger.click();
  await expect.poll(shownTooltip).toBeNull();
});
