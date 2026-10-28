import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import "../test-stylesheet";
import { Size, Theme, Variant } from "../types";
import { Accordion } from "../layouts/accordion";
import { Checkbox } from "./checkbox";
import { ToggleSquare } from "./toggle-square";
import { Switch } from "./switch";

enum Surface {
  Base = "base",
  Raised = "raised",
  Inset = "inset",
  DeepInset = "deep inset",
  Dialog = "dialog",
  Popover = "popover",
  List = "list row",
  EmphasizedList = "emphasized list row",
  SelectedList = "selected list row",
}

const surfaces: Record<Surface, string> = {
  [Surface.Base]: "bg-layout-light-base dark:bg-layout-dark-base",
  [Surface.Raised]: "bg-[#dcdcdc] dark:bg-[#252525]",
  [Surface.Inset]: "bg-layout-light-inset dark:bg-layout-dark-inset",
  [Surface.DeepInset]: "bg-layout-light-deep-inset dark:bg-layout-dark-deep-inset",
  [Surface.Dialog]: "card",
  [Surface.Popover]: "card-overlay",
  [Surface.List]: "card",
  [Surface.EmphasizedList]: "card",
  [Surface.SelectedList]: "card",
};

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

/** Resolve computed CSS colors to sRGB bytes, as in the other contrast suites. */
function rgba(color: string): number[] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return [...ctx.getImageData(0, 0, 1, 1).data];
}

function ratio(a: number[], b: number[]): number {
  const luminance = (rgb: number[]) =>
    rgb.slice(0, 3).reduce((sum, c, i) => {
      const v = c / 255;
      return (
        sum +
        [0.2126, 0.7152, 0.0722][i] * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      );
    }, 0);
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function boundary(element: HTMLElement): number[] {
  const style = getComputedStyle(element);
  expect(style.opacity).toBe("1");
  const first = /^(.+?) 0px 0px 0px 1px inset(?:,|$)/.exec(style.boxShadow);
  expect(first, style.boxShadow).not.toBeNull();
  return rgba(first![1]);
}

const variants = Object.values(Variant);

function Controls() {
  return (
    <>
      {variants.map((variant) => (
        <div key={variant} className="flex flex-wrap gap-2">
          {[false, true].flatMap((disabled) =>
            [false, true].map((checked) => (
              <div key={`${disabled}-${checked}`} className="flex gap-2">
                <Checkbox
                  variant={variant}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => {}}
                />
                <Checkbox
                  variant={variant}
                  checked={checked}
                  disabled={disabled}
                  asIndicator
                  onCheckedChange={() => {}}
                />
                <ToggleSquare
                  variant={variant}
                  value={checked}
                  disabled={disabled}
                  onChange={() => {}}
                />
                <ToggleSquare
                  variant={variant}
                  value={checked}
                  disabled={disabled}
                  asIndicator
                  onChange={() => {}}
                />
                <Switch
                  variant={variant}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => {}}
                />
              </div>
            )),
          )}
        </div>
      ))}
      {[false, true].flatMap((disabled) =>
        [false, true].map((checked) => (
          <div key={`custom-${disabled}-${checked}`} className="flex gap-2">
            <ToggleSquare color="#f56b29" value={checked} disabled={disabled} onChange={() => {}} />
            <ToggleSquare
              color="#f56b29"
              value={checked}
              disabled={disabled}
              asIndicator
              onChange={() => {}}
            />
            <Switch
              color="#f56b29"
              checked={checked}
              disabled={disabled}
              onCheckedChange={() => {}}
            />
          </div>
        )),
      )}
      {[false, true].flatMap((disabled) =>
        [false, true].map((asIndicator) => (
          <ToggleSquare
            key={`partial-${disabled}-${asIndicator}`}
            value="partial"
            disabled={disabled}
            asIndicator={asIndicator}
            variant={Variant.Primary}
            onChange={() => {}}
          />
        )),
      )}
      <Accordion
        defaultOpen
        items={[{ key: "disclosure", header: "Disclosure", content: "Panel" }]}
      />
    </>
  );
}

async function settle(element: HTMLElement) {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await Promise.all(
    element.getAnimations({ subtree: true }).map((animation) => animation.finished),
  );
}

for (const theme of [Theme.Light, Theme.Dark]) {
  test(`${theme}: icon toggles have no edge while empty toggles and indicators retain it`, async () => {
    const view = await render(
      <div className={`${theme} flex gap-4 p-8`}>
        <div data-pointer-target style={{ position: "fixed", right: 0, bottom: 0 }}>
          Outside
        </div>
        {[false, true].flatMap((disabled) =>
          [false, true, "partial" as const]
            .filter((value) => disabled || value !== "partial")
            .flatMap((value) =>
              [undefined, "#f56b29"].map((color) => (
                <ToggleSquare
                  key={`${disabled}-${value}-${color}`}
                  value={value}
                  disabled={disabled}
                  color={color}
                  size={Size.Sm}
                  onChange={() => {}}
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M2 2h12v12H2z" />
                  </svg>
                </ToggleSquare>
              )),
            ),
        )}
        <ToggleSquare value={false} size={Size.Sm} onChange={() => {}} />
        <ToggleSquare value={false} size={Size.Sm} asIndicator onChange={() => {}}>
          <svg aria-hidden="true" width="16" height="16" />
        </ToggleSquare>
      </div>,
    );
    try {
      await userEvent.hover(view.container.querySelector<HTMLElement>("[data-pointer-target]")!);
      const buttons = [...view.container.querySelectorAll<HTMLElement>("button")];
      for (const button of buttons.slice(0, -2)) {
        expect(getComputedStyle(button).boxShadow, button.outerHTML).toBe("none");
        await userEvent.hover(button);
        expect(getComputedStyle(button).boxShadow, button.outerHTML).toBe("none");
        if (!button.hasAttribute("disabled")) {
          button.focus();
          expect(getComputedStyle(button).boxShadow, button.outerHTML).toBe("none");
        }
      }
      for (const button of buttons.slice(-2)) {
        expect(boundary(button)).toEqual(
          rgba(getComputedStyle(button).getPropertyValue("--standard-color")),
        );
      }
    } finally {
      await view.unmount();
    }
  });

  test.each([undefined, "#f56b29"])(
    `${theme}: partial icon toggle color=%s paints only a 1px standard inset and accent hover`,
    async (color) => {
      const view = await render(
        <div className={`${theme} p-8`}>
          <div data-pointer-target style={{ position: "fixed", right: 0, bottom: 0 }}>
            Outside
          </div>
          <ToggleSquare
            value="partial"
            variant={Variant.Primary}
            color={color}
            size={Size.Sm}
            onChange={() => {}}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
              <path d="M2 2h12v12H2z" />
            </svg>
          </ToggleSquare>
        </div>,
      );
      try {
        await userEvent.hover(view.container.querySelector<HTMLElement>("[data-pointer-target]")!);
        const button = view.container.querySelector<HTMLElement>("button")!;
        const inset = (token: string) => {
          const style = getComputedStyle(button);
          expect(style.boxShadow.match(/inset/g)).toHaveLength(1);
          expect(boundary(button)).toEqual(rgba(style.getPropertyValue(token)));
        };
        inset("--standard-color");
        await userEvent.hover(button);
        inset("--accent-color");
      } finally {
        await view.unmount();
      }
    },
  );

  test(`${theme}: checked edges follow hover fills while switch thumbs hold their checked colour`, async () => {
    const view = await render(
      <div className={`${theme} ${surfaces[Surface.Base]} p-8`}>
        <div data-pointer-target style={{ position: "fixed", right: 0, bottom: 0 }}>
          Outside
        </div>
        <Controls />
      </div>,
    );
    const outside = view.container.querySelector<HTMLElement>("[data-pointer-target]")!;
    try {
      await userEvent.hover(outside);
      for (const button of view.container.querySelectorAll<HTMLElement>("button.variant-scope")) {
        await settle(button);
        const style = getComputedStyle(button);
        const standard = rgba(style.getPropertyValue("--standard-color"));
        const checked = button.dataset.state === "checked";
        const disabled = button.hasAttribute("disabled");
        if (button.getAttribute("role") === "switch") {
          const thumb = button.querySelector<HTMLElement>("span")!;
          const thumbStyle = getComputedStyle(thumb);
          expect(thumbStyle.transitionProperty.split(", ")).toEqual([
            "translate",
            "background-color",
          ]);
          expect(thumbStyle.transitionDuration).toBe("0.16s");
          // Tailwind's `ease-out` token.
          expect(thumbStyle.transitionTimingFunction).toBe("cubic-bezier(0, 0, 0.2, 1)");
          expect(thumbStyle.opacity).toBe(disabled ? "0.5" : "1");
          const thumbColor = rgba(thumbStyle.backgroundColor);
          if (checked) {
            expect(thumbColor).toEqual(rgba(style.getPropertyValue("--on-standard-color")));
            if (!disabled)
              expect(ratio(thumbColor, rgba(style.backgroundColor))).toBeGreaterThanOrEqual(4.4);
          } else {
            expect(thumbColor).toEqual(standard);
          }
          if (disabled) {
            const surface = rgba(getComputedStyle(outside.parentElement!).backgroundColor);
            const trackColor = rgba(style.backgroundColor);
            const trackAlpha = trackColor[3] / 255;
            const track = trackColor.map((c, i) =>
              i === 3 ? 255 : c * trackAlpha + surface[i] * (1 - trackAlpha),
            );
            const thumbAlpha = (thumbColor[3] / 255) * Number(thumbStyle.opacity);
            const painted = thumbColor.map((c, i) =>
              i === 3 ? 255 : c * thumbAlpha + track[i] * (1 - thumbAlpha),
            );
            // Disabled controls carry no contrast requirement, their thumb is dimmed on
            // purpose, and an unchecked thumb is the variant colour, which on a light
            // surface is faint for the brightest hues (warning measures about 1.1:1).
            // This floor is not a legibility claim. It separates a dim thumb from one
            // painted in its own track's colour, which measures about 1.0:1.
            expect(ratio(painted, track), button.outerHTML).toBeGreaterThanOrEqual(1.05);
          }
        }
        if (checked && !disabled && button.classList.contains("variant-checkbox-bg")) {
          const trackColor = rgba(style.backgroundColor);
          const thumb =
            button.getAttribute("role") === "switch"
              ? button.querySelector<HTMLElement>("span")!
              : null;
          const thumbColor = thumb ? rgba(getComputedStyle(thumb).backgroundColor) : null;
          expect(boundary(button)).toEqual(trackColor);
          await userEvent.hover(button);
          await settle(button);
          const hovered = getComputedStyle(button);
          expect(boundary(button)).toEqual(rgba(hovered.getPropertyValue("--accent-color")));
          expect(boundary(button)).toEqual(rgba(hovered.backgroundColor));
          if (thumb) {
            expect(rgba(getComputedStyle(thumb).backgroundColor)).toEqual(thumbColor);
            expect(rgba(getComputedStyle(thumb).backgroundColor)).toEqual(
              rgba(hovered.getPropertyValue("--on-standard-color")),
            );
            expect(rgba(hovered.color)).toEqual(
              rgba(hovered.getPropertyValue("--on-accent-color")),
            );
            if (
              button.classList.contains(theme === Theme.Dark ? Variant.Default : Variant.Secondary)
            ) {
              expect(rgba(hovered.backgroundColor)).not.toEqual(trackColor);
              expect(rgba(hovered.color)).not.toEqual(thumbColor);
            }
          }
          await userEvent.hover(outside);
          await settle(button);
          if (thumb) expect(rgba(getComputedStyle(thumb).backgroundColor)).toEqual(thumbColor);
        }
      }
    } finally {
      await view.unmount();
    }
  }, 30_000);

  for (const surface of Object.values(Surface)) {
    test(`${theme}/${surface}: every variant paints an opaque checked-fill edge across enabled and disabled states`, async () => {
      const host = document.createElement("div");
      host.className = theme;
      document.body.appendChild(host);
      const pointerTarget = document.createElement("div");
      Object.assign(pointerTarget.style, {
        position: "fixed",
        right: "0",
        bottom: "0",
        width: "8px",
        height: "8px",
      });
      document.body.appendChild(pointerTarget);
      await userEvent.hover(pointerTarget);
      const view = await render(
        <div className={`variant-scope ${surfaces[surface]} p-8`}>
          <div
            data-ground
            style={{
              backgroundColor:
                surface === Surface.SelectedList
                  ? "color-mix(in oklab, var(--accent-color) 18%, transparent)"
                  : surface === Surface.EmphasizedList
                    ? "color-mix(in oklab, var(--accent-color) 8%, transparent)"
                    : undefined,
            }}
          >
            <Controls />
          </div>
        </div>,
        { container: host },
      );
      try {
        const expected = theme === Theme.Dark ? [161, 161, 161, 255] : [82, 82, 82, 255];
        const ground = host.querySelector<HTMLElement>("[data-ground]")!;
        const base = rgba(getComputedStyle(ground.parentElement!).backgroundColor);
        const tint = rgba(getComputedStyle(ground).backgroundColor);
        expect(tint[3]).toBe(
          surface === Surface.SelectedList ? 46 : surface === Surface.EmphasizedList ? 20 : 0,
        );
        const expectedBase =
          theme === Theme.Dark
            ? surface === Surface.Base
              ? 51
              : surface === Surface.Raised
                ? 37
                : [Surface.DeepInset, Surface.Popover].includes(surface)
                  ? 23
                  : 38
            : surface === Surface.Base
              ? 204
              : surface === Surface.Raised
                ? 220
                : [Surface.DeepInset, Surface.Popover].includes(surface)
                  ? 237
                  : 229;
        expect(base).toEqual([expectedBase, expectedBase, expectedBase, 255]);
        const disclosure = host.querySelector<HTMLElement>("h3 .grid-list-item-indicator")!;
        expect(disclosure.classList.contains("variant-scope")).toBe(false);
        expect(boundary(disclosure)).toEqual(expected);
        const controls = host.querySelectorAll<HTMLElement>("button.variant-scope");
        expect(controls).toHaveLength(176);
        for (const button of controls) {
          const style = getComputedStyle(button);
          const standard = rgba(style.getPropertyValue("--standard-color"));
          expect(standard[3]).toBe(255);
          expect(boundary(button), button.outerHTML).toEqual(standard);
          if (button.classList.contains("custom-color"))
            expect(standard).toEqual([245, 107, 41, 255]);
          if (button.dataset.state === "indeterminate") expect(style.boxShadow).toContain("3px");
        }
        for (const enabled of host.querySelectorAll<HTMLElement>(
          'button.default[data-state="unchecked"]:not(:disabled)',
        )) {
          await userEvent.hover(enabled);
          expect(boundary(enabled)).toEqual(
            rgba(getComputedStyle(enabled).getPropertyValue("--standard-color")),
          );
          enabled.focus();
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          await Promise.all(enabled.getAnimations().map((animation) => animation.finished));
          expect(boundary(enabled)).toEqual(
            rgba(getComputedStyle(enabled).getPropertyValue("--standard-color")),
          );
          if (enabled.classList.contains("variant-responsive-appearing-outline")) {
            expect(getComputedStyle(enabled).outlineStyle).toBe("solid");
            expect(getComputedStyle(enabled).outlineWidth).toBe("2px");
            expect(getComputedStyle(enabled).outlineOffset).toBe("2px");
          }
        }
      } finally {
        await view.unmount();
        host.remove();
        pointerTarget.remove();
      }
    });
  }
}
