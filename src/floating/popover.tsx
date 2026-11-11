import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { clsx } from "clsx";
import { isValidElement, type ReactNode } from "react";
import { Variant } from "../types";
import { Arrow } from "./arrow";
import { renderMenuTrigger } from "./menu-action";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onStateChange?: (open: boolean) => void;
  variant?: Variant;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

function Popover({
  trigger,
  children,
  open,
  onStateChange,
  variant,
  portalContainer,
}: PopoverProps) {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root
        open={open}
        modal={false}
        onOpenChange={(next, details) => {
          const target =
            details.reason === "focus-out" && details.event instanceof FocusEvent
              ? details.event.relatedTarget
              : details.event.target;
          // Notifications are a shared interaction region for open overlays.
          if (
            !next &&
            (details.reason === "outside-press" || details.reason === "focus-out") &&
            target instanceof Element &&
            target.closest("[data-notifications-region]")
          ) {
            details.cancel();
            return;
          }
          onStateChange?.(next);
        }}
      >
        <PopoverPrimitive.Trigger
          nativeButton={
            !(
              isValidElement(trigger) &&
              typeof trigger.type === "string" &&
              trigger.type !== "button"
            )
          }
          className="focus:outline-none"
          render={(props, state) => renderMenuTrigger(trigger, props, state.open)}
        />
        <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
          {/* 4px from the trigger, plus the 6px arrow that hangs from the popup's edge. Collisions
              push it right up to the viewport's edge, as they do a Tooltip. */}
          <PopoverPrimitive.Positioner
            positionMethod="fixed"
            align="center"
            sideOffset={10}
            collisionPadding={0}
          >
            <PopoverPrimitive.Popup
              render={(props, state) => (
                <div {...props} data-state={state.open ? "open" : "closed"} />
              )}
              className={clsx(
                variant,
                "popover-content focus:outline-none",
                "variant-scope card-overlay",
                "m-0.5 min-w-55 rounded-sm",
              )}
            >
              <PopoverPrimitive.Arrow className="data-[side=bottom]:-top-1.5 data-[side=bottom]:-translate-x-0.5 data-[side=bottom]:rotate-180 data-[side=top]:-bottom-1.5 data-[side=top]:-translate-x-0.5 data-[side=right]:-left-2.25 data-[side=right]:-translate-y-0.5 data-[side=right]:rotate-90 data-[side=left]:-right-2.25 data-[side=left]:-translate-y-0.5 data-[side=left]:-rotate-90">
                <Arrow
                  filled={false}
                  variant={variant ?? Variant.Default}
                  className="block h-1.5 w-3"
                  preserveAspectRatio="none"
                />
              </PopoverPrimitive.Arrow>
              {children}
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export { Popover };
