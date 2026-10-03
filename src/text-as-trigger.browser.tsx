import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
// The real compiled stylesheet: the role classes are what these tests read back off the
// trigger, and without it every `text-role-*` class is inert.
import "./test-stylesheet";
import { Text, TextRole } from "./text";
import { Tooltip } from "./floating/tooltip";

/**
 * Whether {@link Text} can BE a floating component's trigger, rather than sit inside a
 * wrapper that is.
 *
 * ## The requirement, which both libraries impose and spell differently
 *
 * A trigger has to put its own props — pointer and focus handlers, `aria-describedby`,
 * `data-state` — and its own ref onto a real DOM node. It does not own that node, so it
 * hands them to whatever it was given and depends on that thing passing them through.
 *
 * Radix spells this `asChild`: the trigger CLONES its child, so a child component that
 * neither spreads unknown props nor forwards a ref drops them all. Base UI spells it
 * `render`, and its element form (`render={<div … />}`) asks for exactly the same thing.
 * Base UI's FUNCTION form (`render={(props) => <div {...props} />}`) is the one real
 * difference: it hands the props back and lets the caller place them, which satisfies the
 * requirement without the child cooperating at all.
 *
 * So the question is a property of the CHILD, not of the library, and migrating the
 * floating components from Radix to Base UI does not change the answer for any component
 * used the element way.
 *
 * ## Why it needs a test rather than an argument
 *
 * **The failure is silent and looks correct.** A dropped ref leaves a control that still
 * renders, still reads correctly to a screen reader, and simply never opens its tooltip.
 * That is how the wrapper convention around `Select`, `Button` and `NameLink` was found —
 * by a test written in the direct form and failing.
 *
 * `Text` widened to the native attributes and now spreads them, so the answer changed
 * without any of the call sites changing. Pinning it here is what stops the wrapper
 * guidance outliving its reason in one direction, and an unnoticed regression in the
 * other.
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
  // Radix merges its own `className` into the child's. The role is the FIRST class `Text`
  // emits and the caller's `className` the last, so a merge that replaced rather than
  // appended would leave the text unstyled while the tooltip worked — the opposite
  // trade, and just as quiet.
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
