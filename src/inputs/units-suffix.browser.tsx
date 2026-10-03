import type { ReactNode } from "react";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
// The real compiled stylesheet: what is under test is LAYOUT — the suffix's width,
// its truncation and where it ends — and with every class inert there is none.
import "../test-stylesheet";
import { Size } from "../types";
import { NumberField } from "./number-field";
import { SliderNumberField } from "./slider-number-field";

/**
 * A number field's units suffix stays inside the field whatever its text.
 *
 * Units are free text from whoever authored a value, so a suffix sized to its full
 * length could be wider than the field it sits in: "intensity" pushed the value aside
 * and ran past the field's right edge, over whatever came next in the row. The field
 * here is a fixed 140px, roughly a timeline row's value slot.
 */

const FIELDS = [
  [
    "SliderNumberField",
    (units: string) => (
      <SliderNumberField size={Size.Sm} value={0.35} onChange={() => {}} units={units} />
    ),
  ],
  [
    "NumberField",
    (units: string) => (
      <NumberField size={Size.Sm} value={0.35} onChange={() => {}} units={units} />
    ),
  ],
] as const;

async function renderField(field: (units: string) => ReactNode, units: string) {
  const view = await render(<div style={{ width: "140px" }}>{field(units)}</div>);
  const frame = view.container.firstElementChild as HTMLElement;
  const suffix = [...view.container.querySelectorAll("input")].find(
    (input) => input.readOnly && input.value === units,
  );
  if (!suffix) throw new Error(`no units suffix reading "${units}"`);
  return { frame, suffix };
}

/**
 * Whether the suffix's text is wider than the box it is drawn in. Measured from the
 * text, because an input's `scrollWidth` does not grow with text it clips.
 */
function textOverflows(input: HTMLInputElement): boolean {
  const style = getComputedStyle(input);
  const context = document.createElement("canvas").getContext("2d")!;
  context.font = style.font;
  const content =
    input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  return context.measureText(input.value).width > content + 0.5;
}

describe.each(FIELDS)("%s units suffix", (_name, field) => {
  test("a long unit truncates inside the field instead of running past it", async () => {
    const { frame, suffix } = await renderField(field, "intensity");
    expect(suffix.getBoundingClientRect().right).toBeLessThanOrEqual(
      frame.getBoundingClientRect().right,
    );
    // Clipped, not resized: the text is wider than the box it is drawn in, and the
    // cut is marked with an ellipsis rather than a hard edge.
    expect(textOverflows(suffix)).toBe(true);
    expect(getComputedStyle(suffix).textOverflow).toBe("ellipsis");
    // Truncation is visual only; the whole unit is still the suffix's value.
    expect(suffix.value).toBe("intensity");
  });

  test("a unit of up to four characters shows in full, and a fifth truncates", async () => {
    for (const units of ["%", "mm", "fps", "mm/s"]) {
      const { suffix } = await renderField(field, units);
      expect(textOverflows(suffix), units).toBe(false);
    }
    // At this size the four-character box is narrower than five characters.
    const { suffix } = await renderField(field, "mm/s²");
    expect(textOverflows(suffix)).toBe(true);
  });
});
