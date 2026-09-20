import { useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "@vitest/browser/context";
import { Combobox, type ComboboxGroup } from "./combobox";
import "../test-stylesheet";

/**
 * Grouped options render their group HEADINGS, not just their options.
 *
 * `Combobox` takes either a flat option list or `ComboboxGroup[]`, and the grouped
 * shape exists to say something the options cannot: which set each one belongs to.
 * Losing the headings leaves every option present and correct, in one undivided
 * list — a control that still works, still filters and still selects, having
 * dropped the only thing the grouped API was chosen for.
 *
 * **Nothing about that is visible to a test that asserts on the options.** The
 * failure mode is a heading that renders with an undefined label: an empty element
 * in the right place, so the popup's option count, its text and its behaviour are
 * all unchanged. So the assertion has to be on the labels themselves, and it has to
 * be paired with an option from under each one — a heading with no options beneath
 * it is the other half of the same bug, and either alone passes for it.
 *
 * ## Why this lives here rather than in a story
 *
 * The library has a `Grouped` story. A story is rendered for a person to look at,
 * and it renders identically whether or not the headings arrive, because an empty
 * heading occupies no space anyone notices in a list that otherwise looks right.
 */
const GROUPS: ComboboxGroup[] = [
  {
    label: "In this project",
    items: [{ label: "Contained Model", value: "contained" }],
  },
  {
    label: "All assets",
    items: [{ label: "Published Model", value: "published" }],
  },
];

function GroupedHarness() {
  const [value, setValue] = useState<string | null>(null);
  return <Combobox<string> options={GROUPS} value={value} onChange={setValue} />;
}

test("a grouped combobox shows each group's label above its own options", async () => {
  render(<GroupedHarness />);

  await userEvent.click(page.getByRole("button", { name: "Toggle options" }));
  await expect.poll(() => document.querySelector("[role=listbox]")).not.toBeNull();

  // The headings, which are what the grouped shape is for.
  await expect.element(page.getByText("In this project")).toBeVisible();
  await expect.element(page.getByText("All assets")).toBeVisible();

  // And an option from under each, so a heading cannot pass over an empty group —
  // base-ui drops a group whose items all filter out, so a label standing alone
  // would mean the pairing had come apart rather than that the group is empty.
  await expect.element(page.getByRole("option", { name: "Contained Model" })).toBeVisible();
  await expect.element(page.getByRole("option", { name: "Published Model" })).toBeVisible();
});

test("a grouped combobox still selects the option that was clicked", async () => {
  render(<GroupedHarness />);

  await userEvent.click(page.getByRole("button", { name: "Toggle options" }));
  await page.getByRole("option", { name: "Published Model" }).click();

  // The control: the grouped shape reaches base-ui's store as groups, and its
  // value/label callbacks apply to the LEAVES under them. A group object reaching
  // those callbacks instead would leave the input empty or holding a group's label,
  // with the headings above still perfectly correct.
  await expect
    .poll(() => document.querySelector<HTMLInputElement>("input[role=combobox]")?.value)
    .toBe("Published Model");
});
