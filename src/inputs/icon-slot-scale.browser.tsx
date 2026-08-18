import { expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render, cleanup } from "vitest-browser-react";
// The real compiled stylesheet, because every claim here is a measurement. Without
// it the `sized-*` classes are inert and both glyphs would agree at whatever the raw
// SVG carries — an assertion that could only ever agree with itself.
import "../test-stylesheet";
import { Size } from "../types";
import { Icon } from "../icons/registry";
import { Button } from "../buttons/button";
import { Search } from "./search";

/**
 * `Button`'s icon slot and a field's icon slot resolve to DIFFERENT sizes at the
 * same `Size`, and to different colours.
 *
 * Not filed as a bug: the divergence may well be deliberate. A button's glyph IS
 * the control, while a field's is an adornment sitting beside the text the reader is
 * actually looking at — which is also why the field's is muted and the button's is
 * full strength. This test exists so the decision can be made against numbers, and
 * so that whichever way it is settled, a later change to either scale is visible.
 *
 * Why it matters in practice: a button placed beside a field, each taking its own
 * default, does not line up. That is exactly what the assets pane's filter row is —
 * a `Search` next to a `FilterSortDropdown` trigger — and pinning the button's glyph
 * to the field's is the only lever available today.
 *
 * The second render pass exists so the matrix carries its own numbers. To capture
 * it as an image, add `await page.screenshot({ path: "…png" })` after that pass —
 * left out of the committed test because a test that writes files on every run is
 * noise, and the numbers are already in the run output.
 *
 * The audit that prompted it: NO field call site anywhere overrides its icon size.
 * `Search` is the only field wrapper supplying an icon at all, and it passes a bare
 * `<Icon name="search" />`, so every field in the product renders the slot default.
 * Overriding happens only on buttons — 10 sites, in five spellings of three actual
 * values, against 55 sites that take the slot default.
 */

/**
 * The first glyph's height and colour in a container.
 *
 * The same icon (`search`) is used on both sides deliberately: the question is what
 * the two SLOTS do, so varying the glyph would confound it. `adjustments` — what the
 * real filter trigger uses — is registered by the app rather than by `@semio/ui`, so
 * it renders nothing here and would have measured zero.
 */
function readGlyph(id: string): { px: number; color: string } {
  const svg = document.querySelector(`[data-testid="${id}"] svg`);
  if (!svg) return { px: 0, color: "none" };
  return {
    px: Math.round(svg.getBoundingClientRect().height),
    color: getComputedStyle(svg).color,
  };
}

const SIZES = [Size.Sm, Size.Md, Size.Lg] as const;
const LABEL: Record<string, string> = { [Size.Sm]: "Sm", [Size.Md]: "Md", [Size.Lg]: "Lg" };

/** `note` is filled on the second pass, once there are numbers to print. */
function Matrix({ notes }: { notes?: Record<string, string> }) {
  return (
    <div className="flex w-[560px] flex-col gap-3 bg-white p-4" data-testid="scale-matrix">
      <div className="flex flex-row items-center gap-3 text-xs font-semibold text-neutral-700">
        <span className="w-8">Size</span>
        <span className="w-44">field icon — slot default</span>
        <span className="w-24">button icon</span>
        <span>measured</span>
      </div>

      {SIZES.map((size) => (
        <div
          key={size}
          data-testid={`pair-${LABEL[size]}`}
          className="flex flex-row items-center gap-3"
        >
          <span className="w-8 text-xs text-neutral-500">{LABEL[size]}</span>
          <div className="w-44" data-testid={`field-${LABEL[size]}`}>
            <Search size={size} value="" placeholder="Search..." wrapperClassName="w-full" />
          </div>
          <div className="w-24" data-testid={`button-${LABEL[size]}`}>
            <Button size={size} visuals="inverted" leftIcon="search" altText="Filter" />
          </div>
          <span className="font-mono text-xs text-neutral-600">{notes?.[LABEL[size]] ?? ""}</span>
        </div>
      ))}

      <div className="flex flex-row items-center gap-3 pt-2 text-xs font-semibold text-neutral-700">
        <span className="w-8">Size</span>
        <span className="w-44">field icon — slot default</span>
        <span className="w-24">button — PINNED</span>
        <span>measured</span>
      </div>
      {/* The override, at the size the assets pane's filter row actually uses. */}
      <div data-testid="pair-pinned" className="flex flex-row items-center gap-3">
        <span className="w-8 text-xs text-neutral-500">Sm</span>
        <div className="w-44" data-testid="field-pinned">
          <Search size={Size.Sm} value="" placeholder="Search..." wrapperClassName="w-full" />
        </div>
        <div className="w-24" data-testid="button-pinned">
          <Button
            size={Size.Sm}
            visuals="inverted"
            leftIcon={<Icon name="search" size="none" className="size-3.5" />}
            altText="Filter"
          />
        </div>
        <span className="font-mono text-xs text-neutral-600">{notes?.pinned ?? ""}</span>
      </div>
    </div>
  );
}

test("a Button's icon slot and a field's icon slot resolve to different sizes", async () => {
  // Wide enough for the measured column: the default viewport clips it, and a
  // clipped number in the captured image is worse than no number.
  await page.viewport(760, 380);
  render(<Matrix />);
  await expect.element(page.getByTestId("scale-matrix")).toBeVisible();

  const measured = SIZES.map((size) => ({
    size: LABEL[size],
    field: readGlyph(`field-${LABEL[size]}`),
    button: readGlyph(`button-${LABEL[size]}`),
  }));
  const pinned = { field: readGlyph("field-pinned"), button: readGlyph("button-pinned") };

  console.log("icon slot scale:", JSON.stringify({ defaults: measured, pinned }));

  // Second pass, so the captured image carries its own numbers rather than needing
  // the run output beside it. `cleanup` first: `render` mounts a NEW container.
  const note = (a: { px: number }, b: { px: number }) =>
    `${String(a.px)}px vs ${String(b.px)}px  (${b.px === a.px ? "match" : `+${String(b.px - a.px)}`})`;
  cleanup();
  render(
    <Matrix
      notes={{
        ...Object.fromEntries(measured.map((r) => [r.size, note(r.field, r.button)])),
        pinned: note(pinned.field, pinned.button),
      }}
    />,
  );
  await expect.element(page.getByTestId("scale-matrix")).toBeVisible();

  // Every default pairing disagrees. Asserted as a PROPERTY, not against hardcoded
  // pixels: the point is that the two scales differ, and pinning today's numbers
  // would make this a second place to update if either is deliberately changed.
  for (const row of measured) {
    expect(row.field.px, `field glyph renders at ${row.size}`).toBeGreaterThan(0);
    expect(row.button.px, `button glyph renders at ${row.size}`).toBeGreaterThan(0);
    expect(
      row.button.px,
      `Button and field icon slots agree at ${row.size} — if this now passes, the two ` +
        `scales were reconciled and the pinned overrides in the app are dead weight`,
    ).not.toBe(row.field.px);
  }

  // The colours differ too, which is the other half of the "is it intentional"
  // question: the field's glyph is an adornment, the button's is the control.
  expect(measured[0]?.button.color).not.toBe(measured[0]?.field.color);

  // Pinning is what makes the sizes agree — the only lever available today.
  expect(pinned.button.px).toBe(pinned.field.px);
});
