import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Size, Variant } from "../types";
import { Select } from "./select";

/**
 * `SelectOption.description` explains an option WITHOUT changing it.
 *
 * The description is layered over the option as a tooltip rather than rendered as a
 * second line inside it. A two-line item stops matching the interactive rhythm of every
 * other row in the menu and makes the menu size itself around prose; a tooltip leaves
 * the option exactly the control it already was.
 *
 * **That claim is mostly a negative one, so this file is mostly about what did NOT
 * change.** Wrapping every item in a `Tooltip` puts a Radix trigger — with its own ref
 * and pointer handlers — onto the same DOM node as the menu item, which is precisely the
 * kind of change that can break selection, roving focus, type-ahead or the menu's close
 * behaviour while the tooltip itself works perfectly. A test that only proved the
 * tooltip appears would miss all of it.
 *
 * No stylesheet import here on purpose: every assertion is about behaviour and DOM
 * identity, not paint. Pulling in the real stylesheet would let these quietly come to
 * depend on it.
 */

const DESCRIBED = [
  { value: "admin", label: "Admin", description: "Can edit and manage access." },
  { value: "editor", label: "Editor", description: "Can edit, but not share." },
  { value: "viewer", label: "Viewer", description: "Can view." },
];

const UNDESCRIBED = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const settle = async () => {
  for (let i = 0; i < 4; i++) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }
};

async function openMenu(selectedLabel: string) {
  await page.getByText(selectedLabel).first().click();
  await settle();
}

test("a description actually reaches the option — the positive claim", async () => {
  // Every other test here is a NEGATIVE claim, which is deliberate: the risk is that
  // wrapping items in a tooltip trigger breaks selection or focus. But negatives alone
  // cannot tell a working feature from a deleted one — with the description never
  // passed through, or the trigger disarmed, all of them still pass. This is the one
  // assertion that fails if the tooltip stops being wired at all, which matters
  // because the rung explanations in the sharing modal live nowhere else.
  await render(
    <Select
      value="viewer"
      onChange={() => undefined}
      options={DESCRIBED}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role"
    />,
  );

  await openMenu("Viewer");

  const admin = page.getByRole("menuitemradio", { name: "Admin" }).element();
  admin.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
  admin.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  admin.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  (admin as HTMLElement).focus();
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Asserted through the accessible wiring rather than by finding the text anywhere on
  // screen: `aria-describedby` is what makes the description reach the option at all,
  // and a stray match elsewhere in the DOM would not.
  expect(admin.getAttribute("aria-describedby")).toBeTruthy();
  const described = document.getElementById(admin.getAttribute("aria-describedby") ?? "");
  expect(described?.textContent).toContain("Can edit and manage access.");
});

test("a described option is still a selectable radio item", async () => {
  const onChange = vi.fn();
  await render(
    <Select
      value="viewer"
      onChange={onChange}
      options={DESCRIBED}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role"
    />,
  );

  await openMenu("Viewer");

  // Same role and the same count as an undescribed menu — the tooltip wraps the item
  // rather than replacing or nesting inside it.
  expect(page.getByRole("menuitemradio").elements()).toHaveLength(3);

  await page.getByRole("menuitemradio", { name: "Admin" }).click();
  await settle();

  // Selection still reaches the consumer, with the option's own value.
  expect(onChange).toHaveBeenCalledWith("admin");
});

test("a described menu still closes on select, like an undescribed one", async () => {
  // `NestedRadio` closes on select — one value, so picking it is the whole
  // interaction. A trigger wrapped around each item could swallow the select event and
  // leave the menu open, which would look like a styling quirk rather than a broken
  // control.
  await render(
    <Select
      value="viewer"
      onChange={() => undefined}
      options={DESCRIBED}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role"
    />,
  );

  await openMenu("Viewer");
  expect(page.getByRole("menuitemradio").elements()).toHaveLength(3);

  await page.getByRole("menuitemradio", { name: "Editor" }).click();
  await settle();

  expect(page.getByRole("menuitemradio").elements()).toHaveLength(0);
});

test("a described option keeps its accessible name — the description does not join it", async () => {
  // If the tooltip's content leaked into the item's accessible name, every option would
  // announce as label-plus-sentence and `getByRole(name)` lookups across the app would
  // start matching on prose. The description is supplementary; the name is the label.
  await render(
    <Select
      value="viewer"
      onChange={() => undefined}
      options={DESCRIBED}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role"
    />,
  );

  await openMenu("Viewer");

  for (const option of DESCRIBED) {
    const el = page.getByRole("menuitemradio", { name: option.label }).element();
    expect(el.textContent?.trim()).toBe(option.label);
  }
});

test("an undescribed option renders exactly as it did — no wrapper, no trigger", async () => {
  // The control for the three tests above. `Tooltip` short-circuits when disabled, so an
  // option with no description must carry none of the trigger's attributes; if it did,
  // every existing menu in the app would have quietly changed.
  await render(
    <Select
      value="viewer"
      onChange={() => undefined}
      options={UNDESCRIBED}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role"
    />,
  );

  await openMenu("Viewer");

  const items = page.getByRole("menuitemradio").elements();
  expect(items).toHaveLength(3);
  for (const item of items) {
    // Radix's tooltip trigger stamps `data-state` and describes its child; neither
    // should exist on an option that has nothing to say.
    expect(item.getAttribute("aria-describedby")).toBeNull();
  }
});

test("the trigger shows the selected label, never the description", async () => {
  await render(
    <Select
      value="admin"
      onChange={() => undefined}
      options={DESCRIBED}
      size={Size.Sm}
      variant={Variant.Default}
      label="Role"
    />,
  );
  await settle();

  await expect.element(page.getByText("Admin").first()).toBeVisible();
  // Closed menu, so the description exists nowhere on screen.
  expect(page.getByText("Can edit and manage access.").elements()).toHaveLength(0);
});
