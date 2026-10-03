import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Dropdown, NestedItem, NestedMenu, Size, Tooltip, Variant } from "@semio/ui";

/**
 * The surface ramp, shown as a ramp.
 *
 * `.card`, `.card-overlay` and `.card-transparent` separate themselves from what is
 * behind them by background lightness and a downward drop shadow — no border, no
 * outline. Which one to reach for is decided by what a surface sits ON: `.card` for
 * content resting in the page, `.card-overlay` for anything floating over it,
 * `.card-transparent` where what it covers has to stay legible.
 *
 * The stories put the steps next to each other on their real grounds, because that is
 * the only arrangement in which the ramp can be judged. A single surface centred on a
 * neutral backdrop reads well at every step and says nothing about whether the steps
 * are distinguishable from one another — which is the whole question.
 *
 * How far apart they actually are is a measurement rather than a matter of looking:
 * `@semio/ui`'s `floating/surface-separation.browser.tsx` carries the figure for every
 * pair in both themes, against WCAG 1.4.11's 3:1 for a component boundary.
 */
const meta: Meta = {
  title: "ui/Surfaces",
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

/** Labels a surface with the token it fills from, so the steps can be named on sight. */
function Swatch({ className, name, fill }: { className: string; name: string; fill: string }) {
  return (
    <div className={`${className} variant-scope w-56 p-4`}>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs opacity-60">{fill}</p>
    </div>
  );
}

/**
 * Both themes side by side. The ramp is not symmetric — the light steps are 8 and 12
 * sRGB units apart where the dark ones are 13 and 15, against grounds that differ too —
 * so one theme is half the answer.
 */
function BothThemes({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2">
      <div className="bg-layout-light-base p-8">{children}</div>
      <div className="dark bg-layout-dark-base p-8 text-neutral-100">{children}</div>
    </div>
  );
}

/**
 * Every step on the app frame.
 *
 * `.card-transparent` sits over a gradient rather than a flat fill: at 90% opacity
 * behind a blur it is the one surface whose appearance is a property of what it covers,
 * and a flat ground would render it indistinguishable from an opaque one.
 */
export const TheRamp: Story = {
  render: () => (
    <BothThemes>
      <div className="flex flex-col gap-4">
        <Swatch className="card" name=".card" fill="layout-*-inset" />
        <Swatch className="card-overlay" name=".card-overlay" fill="layout-*-deep-inset" />
        <div className="relative overflow-hidden rounded-md">
          <div className="from-primary-500 to-tertiary-500 absolute inset-0 bg-linear-to-br" />
          <div className="relative p-4">
            <Swatch
              className="card-transparent"
              name=".card-transparent"
              fill="layout-*-deep-inset/90"
            />
          </div>
        </div>
      </div>
    </BothThemes>
  ),
};

/**
 * The pair the ramp exists for, and the hardest one to read: an overlay opening over a
 * card. This is the arrangement every dropdown, menu and tooltip lands in, and the two
 * steps are one stop apart with nothing but lightness between them.
 */
export const OverlayOnCard: Story = {
  render: () => (
    <BothThemes>
      <div className="card variant-scope w-72 p-6">
        <p className="mb-4 text-sm">A card, at rest in the page.</p>
        <div className="card-overlay variant-scope p-4">
          <p className="text-sm">An overlay floating over it.</p>
        </div>
      </div>
    </BothThemes>
  ),
};

/**
 * The live components, so the ramp is checked against what ships rather than against a
 * swatch. Both open onto a card, which is the ground they have least delta against.
 *
 * The inverted tooltip is included because it is the one floating surface that does not
 * take `.card-overlay` — it fills from `--strong-accent-text-color` instead, and its
 * arrow follows the fill rather than the ramp.
 */
export const FloatingComponents: Story = {
  render: () => (
    <BothThemes>
      <div className="card variant-scope flex w-72 flex-col items-start gap-3 p-6">
        <Dropdown trigger={<Button size={Size.Sm}>Open a dropdown</Button>}>
          <NestedMenu>
            <NestedItem>Rename</NestedItem>
            <NestedItem>Duplicate</NestedItem>
            <NestedItem variant={Variant.Error}>Delete</NestedItem>
          </NestedMenu>
        </Dropdown>
        <Tooltip content="A tooltip, on the same step.">
          <Button size={Size.Sm} variant={Variant.Secondary}>
            Hover for a tooltip
          </Button>
        </Tooltip>
        <Tooltip content="An inverted tooltip, which fills instead." invert>
          <Button size={Size.Sm} variant={Variant.Secondary}>
            Hover for an inverted one
          </Button>
        </Tooltip>
      </div>
    </BothThemes>
  ),
};
