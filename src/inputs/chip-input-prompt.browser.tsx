import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
// The real compiled stylesheet, because this asserts a COLOUR as well as a
// string. Without it every Tailwind class is inert, both readings come back as
// the same default, and the assertion could only ever agree with itself.
import "../test-stylesheet";
import { Size } from "../types";
import { ChipInput } from "./chip-input";

/**
 * `ChipInput`'s prompt, across the state change that used to swap it.
 *
 * The field had two prompts and showed whichever matched its state: the
 * caller's `placeholder` while empty, and a hardcoded "Type and press
 * Enter..." once any chip existed. So a caller could name the prompt, see it
 * honoured, and have it silently replaced by wording it never chose — at the
 * moment the field started being used. They were styled differently too, the
 * caller's as body text and the built-in as a real placeholder, so an empty
 * field read as though it already CONTAINED the word.
 *
 * Asserted in a real browser because both halves are rendered rather than
 * declared: the visible prompt is a native `::placeholder`, which jsdom does
 * not paint and cannot report a colour for.
 */

const CALLER_PROMPT = "Add a tag";

const promptOf = (root: HTMLElement) => {
  const input = root.querySelector("input")!;
  return {
    text: input.placeholder,
    colour: getComputedStyle(input, "::placeholder").color,
  };
};

test("the prompt keeps the caller's wording and colour once a chip exists", () => {
  const view = render(
    <ChipInput
      selectedValues={[]}
      options={[]}
      onChange={() => undefined}
      size={Size.Md}
      allowCustomValues
      placeholder={CALLER_PROMPT}
    />,
  );

  const empty = promptOf(view.container);
  expect(empty.text).toBe(CALLER_PROMPT);

  view.rerender(
    <ChipInput
      selectedValues={["robotics"]}
      options={[]}
      onChange={() => undefined}
      size={Size.Md}
      allowCustomValues
      placeholder={CALLER_PROMPT}
    />,
  );

  const withChip = promptOf(view.container);

  // The defect: this read "Type and press Enter..." while `empty.text` read the
  // caller's own words.
  expect(withChip.text).toBe(CALLER_PROMPT);
  expect(withChip.colour).toBe(empty.colour);

  // The prompt is one element, not a span beside an input both claiming it —
  // which is what made the two readings differ in colour.
  expect(view.container.textContent).not.toContain(CALLER_PROMPT);
});
