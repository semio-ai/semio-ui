import { Tooltip as TooltipPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Size, Variant } from "../types";
import { Arrow } from "./arrow";

export interface TooltipProps {
  /** Non-interactive explanation. Use a Popover for links or actions. */
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  controlledState?: [boolean, (value: boolean) => void];
  variant?: Variant;
  disabled?: boolean;
  invert?: boolean;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

function Tooltip({
  content,
  children,
  side,
  controlledState,
  variant,
  disabled,
  invert,
  portalContainer,
}: TooltipProps) {
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [open, setOpen] = useState(controlledState?.[0] ?? false);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (controlledState) {
        controlledState[1](value);
      } else {
        setOpen(value);
      }
      setDefaultOpen(value);
    },
    [controlledState],
  );

  useEffect(() => {
    if (controlledState) {
      setOpen(controlledState[0]);
    } else {
      setOpen(defaultOpen);
    }
  }, [controlledState, defaultOpen]);

  // Short-circuit when disabled — Radix's `Tooltip.Trigger` does not honour a
  // `disabled` prop directly. With `asChild` the prop is forwarded to the
  // rendered element, but it's silently dropped on non-`<button>` children
  // (`<div>`, `<span>`, etc.), leaving the tooltip armed.
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <TooltipPrimitive.Trigger
          disabled={disabled}
          asChild
          onFocus={(event) => {
            // React portals bubble focus through the component tree. Only DOM
            // descendants of this trigger should open its explanation; focus in
            // a portaled menu must leave that menu as the topmost Escape layer.
            if (!event.currentTarget.contains(event.target)) event.preventDefault();
          }}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={portalContainer ?? undefined}>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={clsx(
              Size.Sm as string,
              "variant-scope",
              "sized-text",
              "tooltip-content",
              "inline-flex items-center px-2 py-0.5 select-none",
              invert ? "card-invert" : "variant-static-text card-overlay",
              variant,
              // The one `z-index` left in the package's overlays, kept deliberately rather
              // than by oversight. It is effective where it sits only because of a Radix
              // detail: `Content` is not itself the positioned element, but
              // `react-popper` reads its computed `z-index` and copies it onto the
              // wrapper it positions (`react-popper/dist/index.mjs:141,153`).
              //
              // **That makes it inert under any primitive with a Positioner/Popup split**,
              // base-ui's included — there the value would have to move to the Positioner,
              // which is the trap `inputs/combobox-shared.ts` documents for the popup. So
              // swapping this component's provider is the change that silently turns this
              // line into a no-op, and a tooltip that quietly stops out-ranking anything
              // is not a failure a test of tooltip *behaviour* would catch.
              //
              // Nothing else in the package sets one: overlays portal to the end of
              // `<body>` at `auto`, and a host stacking against its own ladder passes
              // `portalContainer`. The effect of keeping this is that a `Tooltip` out-ranks
              // a `Combobox` popup where the two overlap.
              "z-10",
            )}
          >
            <TooltipPrimitive.Arrow asChild width={12} height={6}>
              <Arrow filled={invert ?? false} variant={variant ?? Variant.Default} />
            </TooltipPrimitive.Arrow>
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
