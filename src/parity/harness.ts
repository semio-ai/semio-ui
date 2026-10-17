/// <reference types="vite/client" />
/**
 * Shared machinery for the parity files (`*-parity.browser.tsx`). Each file renders
 * component states, reads their computed styles, geometry, animation and focus, and
 * compares them with its committed baseline JSON.
 *
 * Every state renders in one fixed webfont, Inter, from the exactly pinned
 * `@fontsource-variable/inter` devDependency. Text geometry otherwise follows the
 * platform's `system-ui` font, and a baseline captured on one platform would fail on
 * another. With the font fixed, the parity files run in the ordinary browser suite on
 * macOS and on Linux CI. A font version change moves glyph metrics, so it needs a
 * recapture.
 *
 * `VITE_PARITY_CAPTURE=1 npx vitest run --project browser src/parity/<file>` rewrites
 * that file's baseline from the current code. Capture the baseline from the code being
 * replaced, in its own commit, before changing it; a difference the check then reports
 * is either a defect or a change to name.
 */
import "@fontsource-variable/inter";
import { afterAll, afterEach, beforeAll, beforeEach, expect } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { cleanup } from "vitest-browser-react";
import "../test-stylesheet";
import type { Theme } from "../types";

export type Measurements = Record<string, Record<string, string | number | boolean>>;

export const capture = import.meta.env.VITE_PARITY_CAPTURE === "1";

const FONT = '"Inter Variable"';

/** Computed properties read from every measured element. */
export const properties = [
  "color",
  "backgroundColor",
  "borderTopLeftRadius",
  "boxShadow",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "opacity",
  "borderTopWidth",
  "borderTopColor",
  "borderBottomWidth",
  "borderBottomColor",
  "fill",
  "stroke",
] as const;

export const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export async function settle() {
  // Finishing can schedule React updates and further transitions. Drain those too,
  // then leave two complete layout frames before measuring viewport coordinates.
  for (let pass = 0; pass < 3; pass++) {
    document.getAnimations().forEach((animation) => animation.finish());
    await frame();
    await frame();
  }
  expect(
    document.getAnimations().filter((animation) => animation.playState === "running"),
  ).toHaveLength(0);
}

export function required<T extends Element>(element: T | null | undefined): T {
  expect(element, "required parity element").toBeTruthy();
  return element!;
}

/**
 * The shared computed properties plus `extra` ones, and the element's viewport rect at
 * half-pixel precision.
 */
export function measure(
  element: Element,
  extra: readonly string[] = [],
): Record<string, string | number> {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const round = (value: number) => Math.round(value * 2) / 2;
  return {
    ...Object.fromEntries(
      [...properties, ...extra].map((property) => [
        property,
        style.getPropertyValue(kebab(property)),
      ]),
    ),
    x: round(rect.x),
    y: round(rect.y),
    width: round(rect.width),
    height: round(rect.height),
  };
}

function kebab(property: string) {
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function take(
  result: Measurements,
  name: string,
  element: Element,
  extra: readonly string[] = [],
) {
  result[name] = measure(element, extra);
}

/**
 * Waits for `target` to lay out inside the viewport, records its entrance animation,
 * finishes every animation, and measures it as `name`.
 */
export async function surface(target: string | Element, result: Measurements, name = "surface") {
  const resolve = () => (typeof target === "string" ? document.querySelector(target) : target);
  await expect
    .poll(() => {
      const element = resolve();
      const rect = element?.getBoundingClientRect();
      return !!rect && rect.width > 0 && rect.height > 0 && rect.x >= 0 && rect.y >= 0;
    })
    .toBe(true);
  const element = required(resolve());
  // Read entrance metadata before finishing: fill/geometry are sampled at rest.
  const { animationName, animationDuration } = getComputedStyle(element);
  result[`${name} entrance`] = { animationName, animationDuration };
  await settle();
  take(result, name, element);
  return element;
}

export function role(roleName: Parameters<typeof page.getByRole>[0], name: string) {
  return page.getByRole(roleName, { name, exact: true });
}

/** The focused element's accessible name, or `(body)` when nothing has focus. */
export function focusName() {
  const element = required(document.activeElement);
  if (element === document.body) return "(body)";
  const labelledBy = element.getAttribute("aria-labelledby");
  const name = (
    element.getAttribute("aria-label") ??
    (labelledBy
      ? labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ")
      : null) ??
    element.textContent ??
    ""
  ).trim();
  // A control named by a `<label for>` has no text of its own. Only labelable
  // elements (buttons, inputs) carry `labels`, so a control that stops being one
  // loses its name here as it does for assistive technology.
  if (name !== "" || !("labels" in element)) return name;
  const labels = (element as HTMLButtonElement).labels;
  return Array.from(labels ?? [], (label) => label.textContent ?? "")
    .join(" ")
    .trim();
}

export interface ParityOptions {
  /** The committed baseline, imported as JSON. */
  baseline: Record<string, Measurements>;
  /** The baseline's path relative to the package root, where a capture writes it. */
  baselinePath: string;
  /** How many theme/state keys a complete capture records. */
  expectedCount: number;
}

/**
 * Registers the parity hooks for the calling file (fixed webfont, viewport, pointer
 * parking, cleanup, and the capture writer) and returns its `verify`.
 */
export function parityHarness({ baseline, baselinePath, expectedCount }: ParityOptions) {
  const captured: Record<string, Measurements> = {};

  beforeAll(async () => {
    // Tailwind's base layer resolves every family through these variables, and an
    // inline declaration on the root outranks the theme layer's.
    for (const variable of ["--font-sans", "--default-font-family"])
      document.documentElement.style.setProperty(variable, FONT);
    // A missing font would fall back to the platform's own without an error, so the
    // run stops unless the webfont actually loaded.
    for (const weight of [400, 500, 600, 700])
      await document.fonts.load(`${String(weight)} 16px ${FONT}`);
    expect(document.fonts.check(`16px ${FONT}`), "the fixed webfont loaded").toBe(true);
  });

  beforeEach(async () => {
    await page.viewport(1280, 800);
    await document.fonts.ready;
    // The pointer survives React cleanup; park it outside every fixed fixture.
    await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  });

  afterEach(async () => {
    await cleanup();
    document.documentElement.classList.remove("dark");
  });

  afterAll(async () => {
    if (capture && Object.keys(captured).length > 0) {
      expect(Object.keys(captured)).toHaveLength(expectedCount);
      // Vitest 5 resolves built-in file commands from the project root.
      await commands.writeFile(baselinePath, `${JSON.stringify(captured, null, 2)}\n`);
    }
  });

  return function verify(theme: Theme, state: string, measurements: Measurements) {
    const key = `${theme} / ${state}`;
    captured[key] = measurements;
    if (capture) return;
    const expected = baseline[key];
    expect(expected, `${key}: baseline state exists`).toBeDefined();
    expect(Object.keys(measurements), `${key}: element set`).toEqual(Object.keys(expected));
    for (const [element, values] of Object.entries(measurements)) {
      expect(Object.keys(values), `${key} / ${element}: property set`).toEqual(
        Object.keys(expected[element]),
      );
      for (const [property, value] of Object.entries(values)) {
        expect(value, `${key} / ${element} / ${property}`).toEqual(expected[element][property]);
      }
    }
  };
}
