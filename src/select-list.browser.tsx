import { useState } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "@vitest/browser/context";
import "./test-stylesheet";
import { Size } from "./types";
import { SelectList } from "./select-list";
import type { SelectOption } from "./floating/select";

/**
 * `SelectList` presents a select and renders it as a list, so the things worth pinning
 * are the ones that cross that seam: the size it is asked for has to reach the option
 * label, and an option it refuses to select has to look refused.
 *
 * Both are silent when broken — the label renders at the wrong size rather than not at
 * all, and a disabled option looks identical to an enabled one — which is why they are
 * asserted against real computed style, with the stylesheet loaded, rather than against
 * class names.
 */

const OPTIONS = [
  { label: "Alpha", value: "a" },
  { label: "Beta", value: "b" },
];

const options = () => [...document.querySelectorAll('[role="option"]')];

const labelOf = (row: Element) => {
  const el = row.querySelector(".sized-text");
  if (!el) throw new Error("no label element in row");
  return el;
};

// The tint layer's INLINE background, which is the decision `resolveVisual` makes —
// `"transparent"` for no tint, a `color-mix(...)` string for one. Deliberately not
// `getComputedStyle`: the mix resolves against `--accent-color`, and a computed read
// reports plain `rgba(0, 0, 0, 0)` both when no tint was asked for and when the custom
// property did not resolve, so it cannot tell the two apart.
const tintOf = (row: Element) => {
  const el = row.querySelector<HTMLElement>('[aria-hidden][style*="background-color"]');
  if (!el) throw new Error("no tint layer in row");
  return el.style.backgroundColor;
};

// Hover moves a REAL pointer, over the row's label rather than the row: a synthetic
// `mouseover` does not reliably reach React's `onMouseEnter`, and Playwright refuses to
// act on the `aria-disabled` row itself — but the label inside it is an ordinary element,
// and the event bubbles to the row from there. Both rows are hovered the same way, so the
// enabled control and the disabled case are comparable.
const hover = (row: Element) => userEvent.hover(labelOf(row));

// Click stays synthetic: it only ever has to establish that activation is a no-op, and
// Playwright would refuse the disabled row outright.
const click = (el: Element) => el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

/** `SelectList` is controlled, so a spy alone never moves `value`. */
function Controlled({
  options: opts,
  onChange,
}: {
  options: SelectOption[];
  onChange: (v: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <SelectList
      value={value}
      options={opts}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

test("the option label scales with `size`", () => {
  // `sized-text` resolves against a `size-*` class on the SAME element, so a label that
  // relies on the row's size class silently renders at the unsized default at EVERY
  // size. Xs and Lg sit either side of that default, so neither assertion can pass by
  // accident.
  const xs = render(<SelectList size={Size.Xs} value="a" onChange={() => {}} options={OPTIONS} />);
  expect(getComputedStyle(labelOf(options()[0])).fontSize).toBe("9.6px"); // 0.6rem
  xs.unmount();

  render(<SelectList size={Size.Lg} value="a" onChange={() => {}} options={OPTIONS} />);
  expect(getComputedStyle(labelOf(options()[0])).fontSize).toBe("20px"); // --text-xl, 1.25rem
});

test("choosing an option reports its value and marks it selected", async () => {
  const onChange = vi.fn();
  render(<Controlled options={OPTIONS} onChange={onChange} />);

  click(options()[1]);

  expect(onChange).toHaveBeenCalledWith("b");
  await vi.waitFor(() => {
    expect(options()[1].getAttribute("aria-selected")).toBe("true");
    expect(options()[0].getAttribute("aria-selected")).toBe("false");
  });
});

test("a disabled option is dimmed, is not selectable, and does not tint on hover", async () => {
  const onChange = vi.fn();
  render(
    <Controlled options={[OPTIONS[0], { ...OPTIONS[1], disabled: true }]} onChange={onChange} />,
  );

  const [enabled, disabled] = options();
  expect(disabled.getAttribute("aria-disabled")).toBe("true");

  // Dimmed. The row itself carries no disabled treatment, so the cell has to.
  const dimmed = disabled.querySelector(".opacity-50");
  expect(dimmed).not.toBeNull();
  expect(getComputedStyle(dimmed!).opacity).toBe("0.5");

  // Hover the ENABLED row first, and wait for its tint. Without that, "the disabled row
  // has no tint" passes on a tree where hover never worked at all — the assertion is a
  // negative, and a negative is satisfied by nothing having happened.
  await hover(enabled);
  await vi.waitFor(() => expect(tintOf(enabled)).not.toBe("transparent"));

  // Now move to the disabled row. The enabled row's tint clearing is what proves the
  // hover actually moved, so the assertion below is about a hover that really happened.
  await hover(disabled);
  await vi.waitFor(() => expect(tintOf(enabled)).toBe("transparent"));
  expect(tintOf(disabled)).toBe("transparent");

  click(disabled);
  expect(onChange).not.toHaveBeenCalled();
  expect(disabled.getAttribute("aria-selected")).toBe("false");
});
