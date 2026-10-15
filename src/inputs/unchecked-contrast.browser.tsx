import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import "../test-stylesheet";
import { Size, Theme, Variant } from "../types";
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

function Controls() {
  return (
    <>
      {[false, true].flatMap((disabled) =>
        [false, true].map((checked) => (
          <div key={`${disabled}-${checked}`} className="flex gap-4 p-2">
            <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => {}} />
            <Checkbox
              checked={checked}
              disabled={disabled}
              asIndicator
              sizing="list-item"
              onCheckedChange={() => {}}
            />
            <ToggleSquare value={checked} disabled={disabled} size={Size.Sm} onChange={() => {}} />
            <ToggleSquare
              value={checked}
              disabled={disabled}
              size={Size.Sm}
              asIndicator
              sizing="list-item"
              onChange={() => {}}
            />
            <Switch checked={checked} disabled={disabled} onCheckedChange={() => {}} />
            <ToggleSquare
              value={checked}
              disabled={disabled}
              color="#f56b29"
              size={Size.Sm}
              onChange={() => {}}
            />
            <Switch
              checked={checked}
              disabled={disabled}
              color="#f56b29"
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
            size={Size.Sm}
            onChange={() => {}}
          />
        )),
      )}
    </>
  );
}

for (const theme of [Theme.Light, Theme.Dark]) {
  for (const surface of Object.values(Surface)) {
    test(`${theme}/${surface}: controls retain their exact boundary across states`, async () => {
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
        const alpha = tint[3] / 255;
        const painted = base.slice(0, 3).map((c, i) => tint[i] * alpha + c * (1 - alpha));
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
        for (const button of host.querySelectorAll<HTMLElement>("button")) {
          expect(boundary(button)).toEqual(expected);
          expect(ratio(boundary(button), painted), button.outerHTML).toBeGreaterThanOrEqual(3);
          if (button.dataset.state === "indeterminate")
            expect(getComputedStyle(button).boxShadow).toContain("3px");
        }
        for (const enabled of host.querySelectorAll<HTMLElement>(
          'button[data-state="unchecked"]:not(:disabled)',
        )) {
          await userEvent.hover(enabled);
          expect(boundary(enabled)).toEqual(expected);
          enabled.focus();
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          await Promise.all(enabled.getAnimations().map((animation) => animation.finished));
          expect(boundary(enabled)).toEqual(expected);
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
