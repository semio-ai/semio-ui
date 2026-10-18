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

/**
 * Chromium paints an `outline-style: auto` focus ring, and any outline whose colour no
 * stylesheet sets, in the platform's own focus-ring colour, which differs between
 * macOS and Linux. A measured colour equal to it records as this token, so a focus
 * ring that a stylesheet colours is still compared exactly.
 */
export const NATIVE_FOCUS_RING = "(native focus ring)";
const nativeFocusRing: Partial<Record<"light" | "dark", string>> = {};

function currentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

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
  const value = (property: string) => {
    const computed = style.getPropertyValue(kebab(property));
    return property === "outlineColor" && computed === nativeFocusRing[currentTheme()]
      ? NATIVE_FOCUS_RING
      : computed;
  };
  return {
    ...Object.fromEntries([...properties, ...extra].map((property) => [property, value(property)])),
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

/**
 * Resolves with the first CSS animation on the element `find` returns, read on the
 * frame it starts: its name, duration and keyframes. Start it before the action that
 * triggers the animation; a short animation can finish before an awaited action
 * returns.
 */
export function firstAnimation(find: () => Element | null): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const tick = () => {
      const animation = find()
        ?.getAnimations()
        .find((candidate): candidate is CSSAnimation => candidate instanceof CSSAnimation);
      if (!animation) {
        requestAnimationFrame(tick);
        return;
      }
      const effect = animation.effect as KeyframeEffect;
      resolve({
        animationName: animation.animationName,
        duration: String(effect.getComputedTiming().duration),
        keyframes: JSON.stringify(
          effect.getKeyframes().map(({ offset, height, width }) => ({ offset, height, width })),
        ),
      });
    };
    tick();
  });
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
    // A missing font would fall back to the platform's own without an error, and
    // `document.fonts.check` is true when no face matches at all, so the run stops
    // unless every weight loaded a face of the pinned family.
    for (const weight of [400, 500, 600, 700]) {
      const faces = await document.fonts.load(`${String(weight)} 16px ${FONT}`);
      expect(faces.length, `a face loaded for weight ${String(weight)}`).toBeGreaterThan(0);
      for (const face of faces) {
        expect(face.family.replace(/["']/g, "")).toBe(FONT.replace(/["']/g, ""));
        expect(face.status).toBe("loaded");
      }
    }
    // The platform's focus-ring colour, per theme, from a plain button focused by
    // keyboard.
    for (const mode of ["light", "dark"] as const) {
      document.documentElement.classList.toggle("dark", mode === "dark");
      const probe = document.createElement("button");
      probe.textContent = "Focus ring probe";
      document.body.prepend(probe);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      await userEvent.keyboard("{Tab}");
      expect(document.activeElement, "the focus ring probe has focus").toBe(probe);
      nativeFocusRing[mode] = getComputedStyle(probe).outlineColor;
      probe.remove();
    }
    document.documentElement.classList.remove("dark");
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
