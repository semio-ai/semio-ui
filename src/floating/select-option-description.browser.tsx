import { expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";
// The real compiled stylesheet, and load-bearing rather than habitual: every claim in
// this file is about WIDTH and LINE COUNT. With the Tailwind classes inert, the menu has
// no `min-w-*` at all, every description is the same unstyled full-bleed text, and the
// "does it wrap?" assertions measure one default against another and can only agree with
// themselves.
import "../test-stylesheet";
import { Size, Variant } from "../types";
import { Select } from "./select";

/**
 * A described option occupies ONE line, and the menu is wide enough to make that true.
 *
 * `SelectOption.description` puts explanation at the point of decision, which only works
 * if the items read as a list. A menu is normally floored at `min-w-55` (220px) and
 * otherwise tracks its trigger — fine for bare labels, and wrong here: a rung control in
 * a table cell is around 112px, so the floor decides, and at 220px ordinary phrases wrap
 * to different heights per item. That is the failure this file exists to catch, because
 * it is invisible to every behavioural test — an option is present, focusable and
 * selectable whether it occupies one line or three.
 *
 * Each test therefore carries its own CONTROL, and the controls are the point: a
 * measurement with nothing to differ from is not a measurement. The long-description case
 * establishes that the one-line assertion can fail at all, and the undescribed menu
 * establishes that the widening is what moved the width.
 *
 * **The two claims are separate, and neither substitutes for the other.** The one-line
 * test is a budget on the STRINGS: today's descriptions also clear the narrower 220px
 * floor, by 11px, so it passes with the widening removed and does not pin the width. The
 * width test is what pins the WIDTH. Removing the widening reddens that one alone — which
 * is the evidence that it is load-bearing, and the reason a future reader should not fold
 * the two together.
 */

/**
 * The width of the cell the control sits in, in px — roughly a rung control in a grants
 * row.
 *
 * A CONTAINER, not a class on the `Select`. `Select`'s own wrapper is `w-full`, so a
 * `min-w-*` on it does nothing to stop it growing: rendered with no constraint it becomes
 * as wide as the viewport, the menu matches its trigger at 1290px, and every description
 * fits trivially. Constraining the parent is what reproduces the narrow trigger that makes
 * the menu's floor — not the trigger — decide the width.
 */
const CELL_WIDTH = 112;

/**
 * Wide enough for the `desktop:` variant, which is width-only at 768px.
 *
 * Not a detail — it is the difference between this file measuring anything and measuring
 * nothing. Below 768px the menu takes `w-[calc(available-width - 4px)]` and fills the
 * viewport, so it is ~406px in a default test frame, no `min-w-*` is the deciding
 * constraint, and NOTHING wraps at any description length worth writing. The first
 * version of this file ran at the default size and passed while proving nothing; the
 * width claims only exist on desktop, so the viewport has to be one.
 */
const DESKTOP = { width: 1280, height: 800 };

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", description: "Can edit and manage access." },
  { value: "editor", label: "Editor", description: "Can edit." },
  { value: "viewer", label: "Viewer", description: "Can view." },
];

const UNDESCRIBED_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const settle = async () => {
  for (let i = 0; i < 4; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

/** Open the menu by clicking the trigger, which shows the selected option's label. */
async function openMenu(selectedLabel: string) {
  await page.getByText(selectedLabel).first().click();
  await settle();
}

/**
 * Every description's laid-out height, read from the elements themselves.
 *
 * Derived rather than hardcoded: the descriptions are `text-xs leading-snug`, and pinning
 * a px number here would turn a type-scale change into a silently passing test. The
 * assertions compare the descriptions against each OTHER, so the claim is "these are all
 * the same number of lines" — which is what a reader actually cares about.
 */
function descriptionHeights(): number[] {
  return ROLE_OPTIONS.map(
    (option) => page.getByText(option.description).element().getBoundingClientRect().height,
  );
}

test("every described option occupies the same single line", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  render(
    <div style={{ width: CELL_WIDTH }}>
      <Select
        value="viewer"
        onChange={() => undefined}
        options={ROLE_OPTIONS}
        size={Size.Sm}
        variant={Variant.Default}
        label="Role"
      />
    </div>,
  );

  await openMenu("Viewer");

  const heights = descriptionHeights();
  // Every description is laid out — a zero height would mean the element is in the DOM
  // but collapsed, which satisfies an equality check trivially.
  for (const height of heights) expect(height).toBeGreaterThan(0);

  // The whole claim: none is taller than the shortest, i.e. none wrapped.
  const singleLine = Math.min(...heights);
  for (const height of heights) expect(height).toBeCloseTo(singleLine, 0);
});

test("a description too long for the menu DOES wrap — the control for the test above", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  // Deliberately far past the budget. If this does not come back taller than a one-line
  // description, the assertion above is measuring something that cannot vary and proves
  // nothing about the real descriptions.
  const overlong =
    "Can edit the resource, manage who has access to it, change every collaborator's rung, " +
    "and remove people from the list entirely, which is far more than fits on one line.";

  render(
    <div style={{ width: CELL_WIDTH }}>
      <Select
        value="viewer"
        onChange={() => undefined}
        options={[
          { value: "viewer", label: "Viewer", description: "Can view." },
          { value: "admin", label: "Admin", description: overlong },
        ]}
        size={Size.Sm}
        variant={Variant.Default}
        label="Role"
      />
    </div>,
  );

  await openMenu("Viewer");

  const short = page.getByText("Can view.").element().getBoundingClientRect().height;
  const long = page.getByText(overlong).element().getBoundingClientRect().height;

  expect(short).toBeGreaterThan(0);
  expect(long).toBeGreaterThan(short);
});

test("descriptions widen the menu past the undescribed floor", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  // Same trigger, same labels, differing only in whether descriptions are present — so a
  // width difference can only be the widening.
  const menuWidth = async (options: typeof UNDESCRIBED_OPTIONS) => {
    const screen = render(
      <div style={{ width: CELL_WIDTH }}>
        <Select
          value="viewer"
          onChange={() => undefined}
          options={options}
          size={Size.Sm}
          variant={Variant.Default}
          label="Role"
        />
      </div>,
    );
    await openMenu("Viewer");
    // Measured on the menu the options actually sit in, reached from an option rather
    // than by naming Radix's portal wrapper: the item is ours, the wrapper is the
    // library's and is free to change.
    const item = page.getByRole("menuitemradio").first().element();
    const width = item.closest("[role='menu']")?.getBoundingClientRect().width ?? 0;
    screen.unmount();
    await settle();
    return width;
  };

  const described = await menuWidth(ROLE_OPTIONS);
  const undescribed = await menuWidth(UNDESCRIBED_OPTIONS);

  expect(undescribed).toBeGreaterThan(0);
  expect(described).toBeGreaterThan(undescribed);
});
