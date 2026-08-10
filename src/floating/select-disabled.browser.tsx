import { expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";
import { Size, Variant } from "../types";
import { Select } from "./select";
import { Tooltip } from "./tooltip";

/**
 * `Select`'s disabled state, in a real browser.
 *
 * A jsdom test can only check that `disabled` was passed. Whether the menu then refuses
 * to open, and whether a wrapping `Tooltip` still fires, are behaviours of the Radix
 * trigger and of pointer-event handling — neither of which exists in jsdom. They are also
 * the two things the state is *for*: a control that dims but still opens is not disabled,
 * and one that dims and swallows hover cannot explain itself.
 */

const OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const REASON = "Keeping a published asset private is a paid capability.";

const settle = async () => {
  for (let i = 0; i < 4; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

test("a disabled Select does not open its menu when clicked", async () => {
  render(
    <Select
      value="viewer"
      onChange={() => undefined}
      options={OPTIONS}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role for Anyone"
      disabled
    />,
  );

  // The trigger renders and shows its value — disabled is not hidden.
  await expect.element(page.getByText("Viewer")).toBeVisible();

  await page.getByText("Viewer").click();
  await settle();

  // No menu. Asserted on the options that would be in it rather than on a container,
  // since the content is portalled and its wrapper is Radix's to name.
  expect(page.getByRole("menuitemradio").elements()).toHaveLength(0);
  expect(page.getByText("Editor").elements()).toHaveLength(0);
});

test("an enabled Select does open — the same click, to show the test can tell", async () => {
  render(
    <Select
      value="viewer"
      onChange={() => undefined}
      options={OPTIONS}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role for Grace"
    />,
  );

  await page.getByText("Viewer").click();
  await settle();

  expect(page.getByRole("menuitemradio").elements().length).toBeGreaterThan(0);
});

test("a disabled trigger still fires a Tooltip over it", async () => {
  // The reason this state does not use `pointer-events: none`. Radix already refuses to
  // open a disabled trigger, so suppressing pointer events would only cost the tooltip —
  // and a disabled control that withholds its reason is worse than either alone.
  //
  // Note the wrapping span, which is load-bearing: `Tooltip` uses Radix `asChild` and
  // hands its ref and pointer handlers to its child, and `Select` forwards neither, so
  // passing it directly drops them and the tooltip never opens — silently, with a control
  // that still looks right. This test was written asserting the direct form and failed,
  // which is how the requirement was found.
  render(
    <Tooltip content={REASON}>
      <span className="inline-flex">
        <Select
          value="viewer"
          onChange={() => undefined}
          options={OPTIONS}
          size={Size.Sm}
          variant={Variant.Default}
          label="Role for Anyone"
          disabled
        />
      </span>
    </Tooltip>,
  );

  await page.getByText("Viewer").hover();
  await expect.element(page.getByText(REASON)).toBeVisible();
});

test("a Tooltip handed the Select directly does not open — the trap, pinned", async () => {
  // Pinned deliberately. If `Select` later forwards a ref and spreads unknown props, this
  // test flips to failing, which is the signal to delete it and the wrapper guidance with
  // it. Better that than the guidance quietly outliving the reason for it.
  render(
    <Tooltip content={REASON}>
      <Select
        value="viewer"
        onChange={() => undefined}
        options={OPTIONS}
        size={Size.Sm}
        variant={Variant.Default}
        label="Role for Anyone"
        disabled
      />
    </Tooltip>,
  );

  await page.getByText("Viewer").hover();
  await settle();
  expect(page.getByText(REASON).elements()).toHaveLength(0);
});
