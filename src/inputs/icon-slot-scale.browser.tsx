import { expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render, cleanup } from "vitest-browser-react";
// The real compiled stylesheet, because every claim here is a measurement. Without
// it the `sized-*` classes are inert and every glyph would report whatever the raw
// SVG carries — an assertion that could only ever agree with itself.
import "../test-stylesheet";
import { Size } from "../types";
import { Icon } from "../icons/registry";
import { Button } from "../buttons/button";
import { Search } from "./search";

/**
 * A control's glyph is an explicit step per control size, and a `Button` and a field
 * at the same `Size` resolve to the SAME step.
 *
 * Both slots used to take 3/5 of their own box, and their boxes differ, so the two
 * disagreed at every size — a button beside a field did not line up, and the only
 * lever was pinning the button's glyph by hand. Worse, 3/5 lands on fractional
 * pixels at most sizes (3/5 of a 28px Sm button is 16.8, of a 32px Md button 19.2),
 * so the standard size was a subpixel box. Every hand-pinned glyph in the app was
 * one of those fractions rounded to the nearest step, and none of them disagreed
 * about which step — which is what made an explicit scale the obvious fix rather
 * than a matter of taste.
 *
 * The colours still differ, and deliberately: a button's glyph IS the control, a
 * field's is an adornment beside the text the reader is looking at. Sizing was the
 * accident; the colour distinction was not.
 *
 * Asserted against the pixel values on purpose. This scale is now a stated design
 * decision rather than an emergent one, so a change to it should have to be made
 * here too — that is the difference between a number and a consequence.
 */

/** The first glyph's height and colour in a container. */
function readGlyph(id: string): { px: number; color: string } {
  const svg = document.querySelector(`[data-testid="${id}"] svg`);
  if (!svg) return { px: 0, color: "none" };
  return {
    px: Math.round(svg.getBoundingClientRect().height),
    color: getComputedStyle(svg).color,
  };
}

/**
 * The scale. Xs and Lg are unchanged from what 3/5 produced (12 and 24 came out
 * exact); Sm and Md are 16.8 and 19.2 snapped to the step the call sites had
 * already chosen for them by hand.
 */
const SCALE = [
  { size: Size.Xs, label: "Xs", px: 12 },
  { size: Size.Sm, label: "Sm", px: 16 },
  { size: Size.Md, label: "Md", px: 20 },
  { size: Size.Lg, label: "Lg", px: 24 },
  { size: Size.Xl, label: "Xl", px: 28 },
] as const;

/** `notes` is filled on the second pass, once there are numbers to print. */
function Matrix({ notes }: { notes?: Record<string, string> }) {
  return (
    <div className="flex w-[560px] flex-col gap-3 bg-white p-4" data-testid="scale-matrix">
      <div className="flex flex-row items-center gap-3 text-xs font-semibold text-neutral-700">
        <span className="w-8">Size</span>
        <span className="w-44">field icon</span>
        <span className="w-24">button icon</span>
        <span>measured</span>
      </div>

      {SCALE.map(({ size, label }) => (
        <div key={size} data-testid={`pair-${label}`} className="flex flex-row items-center gap-3">
          <span className="w-8 text-xs text-neutral-500">{label}</span>
          <div className="w-44" data-testid={`field-${label}`}>
            <Search size={size} value="" placeholder="Search..." wrapperClassName="w-full" />
          </div>
          <div className="w-24" data-testid={`button-${label}`}>
            <Button size={size} visuals="inverted" leftIcon="search" altText="Filter" />
          </div>
          <span className="font-mono text-xs text-neutral-600">{notes?.[label] ?? ""}</span>
        </div>
      ))}

      <div className="flex flex-row items-center gap-3 pt-2 text-xs font-semibold text-neutral-700">
        <span className="w-8">Size</span>
        <span className="w-44">—</span>
        <span className="w-24">button — PINNED</span>
        <span>measured</span>
      </div>
      {/* A deliberate departure from the scale, spelled the way the two surviving
          ones in the app are: `size="none"` drops `.icon-standard`, which is the
          class `.sized-icon` targets, so the slot cannot overrule the call site. */}
      <div data-testid="pair-pinned" className="flex flex-row items-center gap-3">
        <span className="w-8 text-xs text-neutral-500">Sm</span>
        <div className="w-44" />
        <div className="w-24" data-testid="button-pinned">
          <Button
            size={Size.Sm}
            visuals="inverted"
            leftIcon={<Icon name="search" size="none" className="size-2.5" />}
            altText="Tiny"
          />
        </div>
        <span className="font-mono text-xs text-neutral-600">{notes?.pinned ?? ""}</span>
      </div>
    </div>
  );
}

test("a Button and a field render the same explicit glyph step at every size", async () => {
  // Wide enough for the measured column: the default viewport clips it, and a
  // clipped number in the captured image is worse than no number.
  await page.viewport(760, 560);
  render(<Matrix />);
  await expect.element(page.getByTestId("scale-matrix")).toBeVisible();

  const measured = SCALE.map(({ label, px }) => ({
    size: label,
    expected: px,
    field: readGlyph(`field-${label}`),
    button: readGlyph(`button-${label}`),
  }));
  const pinned = readGlyph("button-pinned");

  console.log("icon slot scale:", JSON.stringify({ defaults: measured, pinned }));

  // Second pass, so the captured image carries its own numbers rather than needing
  // the run output beside it. `cleanup` first: `render` mounts a NEW container.
  cleanup();
  render(
    <Matrix
      notes={{
        ...Object.fromEntries(
          measured.map((r) => [
            r.size,
            `${String(r.field.px)}px / ${String(r.button.px)}px  (want ${String(r.expected)})`,
          ]),
        ),
        pinned: `${String(pinned.px)}px  (pinned, off-scale)`,
      }}
    />,
  );
  await expect.element(page.getByTestId("scale-matrix")).toBeVisible();

  for (const row of measured) {
    expect(row.field.px, `field glyph at ${row.size}`).toBe(row.expected);
    expect(row.button.px, `button glyph at ${row.size}`).toBe(row.expected);
  }

  // The other half of the old divergence, kept on purpose: the field's glyph is an
  // adornment, the button's is the control.
  expect(measured[0]?.button.color).not.toBe(measured[0]?.field.color);

  // A call site can still depart from the scale, which is what keeps the two
  // deliberate departures in the app working — the 10px playback glyphs in
  // `control-strip`, and `KeyIcon`'s 16px centre. If this breaks, `.sized-icon`
  // has started overruling `size="none"` and those pins have silently moved.
  expect(pinned.px, "a size=none pin overrides the slot's step").toBe(10);
});
