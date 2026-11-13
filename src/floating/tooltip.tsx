import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import {
  type ReactNode,
  cloneElement,
  useId,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Size, Variant } from "../types";
import { Arrow } from "./arrow";
import { renderMenuTrigger } from "./menu-action";
import { consumeTooltipEscape, registerTooltipEscape } from "./overlay-interaction";

const TOOLTIP_OPEN = "semio.tooltip.open";

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
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledState?.[0] ?? internalOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupId = useId();
  // Every request is recorded, controlled or not, so a tooltip whose control is released
  // (Snippet releases "Copied!" after a moment) shows the state last asked for, not the one
  // it had before control began.
  //
  // Read through a ref: a caller's inline `controlledState` tuple is new on every render,
  // and the effects below must follow open-state transitions, not that identity. Re-run
  // on a parent's render, the open effect would announce this tooltip as newly opened and
  // close a newer one.
  const controlledStateRef = useRef(controlledState);
  controlledStateRef.current = controlledState;
  const changeOpen = useCallback((value: boolean) => {
    setInternalOpen(value);
    controlledStateRef.current?.[1](value);
  }, []);
  const handleOpenChange = useCallback(
    (value: boolean, details: TooltipPrimitive.Root.ChangeEventDetails) => {
      const trigger = triggerRef.current;
      // Pressing an aria-disabled trigger does nothing, so its explanation stays visible.
      if (
        !value &&
        details.reason === "trigger-press" &&
        trigger?.getAttribute("aria-disabled") === "true" &&
        // Not `instanceof Node`: a trigger rendered into another document (an iframe) has
        // nodes from that document's realm, which fail the check against this one.
        trigger.contains(details.event.target as Node | null)
      ) {
        details.cancel();
        return;
      }
      if (!value && details.reason === "escape-key") {
        // Base UI handles Escape on both the trigger and document. Whichever path
        // runs first marks the native event; neither may stop its propagation.
        consumeTooltipEscape(details.event);
        details.allowPropagation();
      }
      changeOpen(value);
    },
    [changeOpen],
  );

  useEffect(() => {
    if (!open || disabled) return;
    const doc = triggerRef.current?.ownerDocument;
    if (!doc) return;
    const onOtherOpen = (event: Event) => {
      if ((event as CustomEvent).detail !== popupId) changeOpen(false);
    };
    const unregisterEscape = registerTooltipEscape(doc, () => changeOpen(false));
    doc.addEventListener(TOOLTIP_OPEN, onOtherOpen);
    doc.dispatchEvent(new CustomEvent(TOOLTIP_OPEN, { detail: popupId }));
    return () => {
      doc.removeEventListener(TOOLTIP_OPEN, onOtherOpen);
      unregisterEscape();
    };
  }, [open, disabled, popupId, changeOpen]);

  useEffect(() => {
    if (!open || disabled) return;
    const doc = triggerRef.current?.ownerDocument;
    if (!doc) return;
    const onScroll = (event: Event) => {
      // ScrollArea dispatches scroll for measurement on pointer entry. Only an
      // actual scroll of an ancestor moves the trigger and dismisses its hint.
      // The target is a node of the trigger's own document, so it is not checked with
      // `instanceof Node`, which fails for a document in another realm (an iframe).
      const target = event.target as Node | null;
      if (
        event.isTrusted &&
        typeof target?.contains === "function" &&
        target.contains(triggerRef.current)
      )
        changeOpen(false);
    };
    doc.addEventListener("scroll", onScroll, true);
    return () => {
      doc.removeEventListener("scroll", onScroll, true);
    };
  }, [open, disabled, changeOpen]);

  if (disabled) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delay={700} timeout={300}>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <TooltipPrimitive.Trigger
          ref={triggerRef}
          onFocus={(event) => {
            // React portals bubble focus through the component tree. Only DOM
            // descendants of this trigger should open its explanation: focus in a
            // portalled menu must leave that menu as the topmost Escape layer.
            if (!event.currentTarget.contains(event.target)) event.preventBaseUIHandler();
          }}
          render={(props, state) => {
            const trigger = renderMenuTrigger(children, props, state.open);
            return cloneElement(trigger, {
              // The open explanation describes the trigger, unless the trigger already
              // names its own description: a disabled menu entry's reason is both that
              // description and this tooltip's text, and is announced once.
              "aria-describedby": trigger.props["aria-describedby"] ?? (open ? popupId : undefined),
            });
          }}
        />
        <TooltipPrimitive.Portal container={portalContainer ?? undefined}>
          <TooltipPrimitive.Positioner
            positionMethod="fixed"
            side={side ?? "top"}
            collisionPadding={0}
            // The popup sits 6px from its trigger, plus the 6px arrow that hangs from its edge.
            sideOffset={12}
            // A Tooltip out-ranks a Combobox popup where they overlap. The z-index
            // belongs on the Positioner because it is the positioned element.
            className="z-10"
          >
            <TooltipPrimitive.Popup
              id={popupId}
              role="tooltip"
              render={(props, state) => (
                <div {...props} data-state={state.open ? "open" : "closed"} />
              )}
              className={clsx(
                Size.Sm as string,
                "variant-scope",
                "sized-text",
                "tooltip-content",
                "inline-flex items-center px-2 py-0.5 select-none",
                invert ? "card-invert" : "variant-static-text card-overlay",
                variant,
              )}
            >
              <TooltipPrimitive.Arrow className="data-[side=bottom]:-top-1.5 data-[side=bottom]:rotate-180 data-[side=top]:-bottom-1.5 data-[side=right]:-left-2.25 data-[side=right]:-translate-y-0.5 data-[side=right]:rotate-90 data-[side=left]:-right-2.25 data-[side=left]:-translate-y-0.5 data-[side=left]:-rotate-90">
                <Arrow
                  filled={invert ?? false}
                  variant={variant ?? Variant.Default}
                  className="block h-1.5 w-3"
                  preserveAspectRatio="none"
                />
              </TooltipPrimitive.Arrow>
              {content}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
