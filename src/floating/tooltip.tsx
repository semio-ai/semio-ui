import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { clsx } from "clsx";
import {
  type ReactNode,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type RefObject,
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

// Native events consumed by an explanation must leave its menu open. Weak keys
// retain the mark for every layer handling the same event without cleanup.
const consumedEscapes = new WeakSet<Event>();
export function isEscapeConsumedByTooltip(event: Event) {
  return consumedEscapes.has(event);
}

/** Run Base UI's Escape handler before a containing menu's bubble handlers. */
function TooltipEscapeCapture({
  open,
  triggerRef,
  onKeyDown,
  children,
}: {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  children: ReactElement;
}) {
  useEffect(() => {
    const doc = triggerRef.current?.ownerDocument;
    if (!open || !doc || !onKeyDown) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // useDismiss accepts native and React events. Calling its rendered handler
      // in capture retains its composition guard, escape-key reason and internal
      // hover/focus dismissal state, even when focus is elsewhere in the menu.
      onKeyDown(event as unknown as ReactKeyboardEvent<HTMLElement>);
    };
    doc.addEventListener("keydown", onEscape, true);
    return () => doc.removeEventListener("keydown", onEscape, true);
  }, [open, triggerRef, onKeyDown]);
  return children;
}

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
  const changeOpen = useCallback(
    (value: boolean) => {
      if (controlledState) controlledState[1](value);
      else setInternalOpen(value);
    },
    [controlledState],
  );
  const handleOpenChange = useCallback(
    (value: boolean, details: TooltipPrimitive.Root.ChangeEventDetails) => {
      const trigger = triggerRef.current;
      // Base UI can request either a trigger or outside press close. Only a press
      // inside this aria-disabled trigger should keep its explanation visible.
      if (
        !value &&
        (details.reason === "trigger-press" || details.reason === "outside-press") &&
        trigger?.getAttribute("aria-disabled") === "true" &&
        details.event.target instanceof Node &&
        trigger.contains(details.event.target)
      ) {
        details.cancel();
        return;
      }
      if (!value && details.reason === "escape-key") consumedEscapes.add(details.event);
      changeOpen(value);
    },
    [changeOpen],
  );

  useEffect(() => {
    if (!open || disabled) return;
    const doc = triggerRef.current?.ownerDocument;
    if (!doc) return;
    const onScroll = (event: Event) => {
      // ScrollArea dispatches scroll for measurement on pointer entry. Only an
      // actual scroll of an ancestor moves the trigger and dismisses its hint.
      if (
        event.isTrusted &&
        event.target instanceof Node &&
        event.target.contains(triggerRef.current)
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
            // descendants of this trigger should open its explanation.
            if (!event.currentTarget.contains(event.target)) event.preventBaseUIHandler();
          }}
          render={(props, state) => {
            const trigger = renderMenuTrigger(children, props, state.open);
            return (
              <TooltipEscapeCapture
                open={state.open}
                triggerRef={triggerRef}
                onKeyDown={props.onKeyDown}
              >
                {cloneElement(trigger, {
                  // The open explanation describes the trigger, unless the trigger already
                  // names its own description: a disabled menu entry's reason is both that
                  // description and this tooltip's text, and is announced once.
                  "aria-describedby":
                    trigger.props["aria-describedby"] ?? (open ? popupId : undefined),
                })}
              </TooltipEscapeCapture>
            );
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
