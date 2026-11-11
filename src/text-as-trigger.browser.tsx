import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
// The real compiled stylesheet: the role classes are what these tests read back off the
// trigger, and without it every `text-role-*` class is inert.
import "./test-stylesheet";
import { Text, TextRole } from "./text";
import { Tooltip } from "./floating/tooltip";

/**
 * A Tooltip trigger composes its child with Base UI's render function. Text must
 * forward event handlers, accessibility attributes and the ref to its DOM node.
 * The control case deliberately swallows those props to detect a broken trigger.
 */

const REASON = "The asset's own summary";

const settle = async () => {
  for (let i = 0; i < 4; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

test("a Tooltip handed Text directly opens", async () => {
  await render(
    <Tooltip content={REASON}>
      <Text role={TextRole.Note}>Quori</Text>
    </Tooltip>,
  );

  await page.getByText("Quori").hover();
  await expect.element(page.getByText(REASON)).toBeVisible();
});

test("and the trigger keeps its role class, so the paint is not the price of the tooltip", async () => {
  // Trigger composition retains both the role class and the consumer's classes.
  await render(
    <Tooltip content={REASON}>
      <Text role={TextRole.Note} className="truncate">
        Quori
      </Text>
    </Tooltip>,
  );

  const trigger = page.getByText("Quori").element();
  expect(trigger.classList.contains(TextRole.Note)).toBe(true);
  expect(trigger.classList.contains("truncate")).toBe(true);
});

/**
 * The control, and these tests are worth nothing without it: `getByText(...).hover()`
 * followed by "the content is visible" passes for any trigger that works, and would also
 * pass if `Tooltip` had started opening on its own. A child that swallows everything is
 * the condition the test above has to be able to tell itself apart from.
 *
 * Deliberately a local component rather than one of the package's own. `Select` is
 * already pinned this way in `select-disabled.browser.tsx`, and a second test depending
 * on the same component would flip for reasons that have nothing to do with `Text` the
 * day that one is fixed.
 */
function SwallowsEverything(_: Record<string, unknown>) {
  return <span>Ignored</span>;
}

test("a child that forwards nothing does not open one — the control", async () => {
  await render(
    <Tooltip content={REASON}>
      <SwallowsEverything />
    </Tooltip>,
  );

  await page.getByText("Ignored").hover();
  await settle();
  expect(page.getByText(REASON).elements()).toHaveLength(0);
});
