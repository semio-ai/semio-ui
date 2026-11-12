import { Menu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import {
  isValidElement,
  useState,
  useRef,
  type ReactNode,
  type Ref,
  type CSSProperties,
  type MouseEventHandler,
} from "react";
import { mergeRefs } from "react-merge-refs";
import { Variant } from "../types";
import { ScrollArea } from "../layouts/scroll-area";
import { useNotificationEscape } from "./overlay-interaction";
import { Arrow } from "./arrow";
import {
  MenuActionProvider,
  useMenuActionHandoff,
  preserveMenuInteraction,
  renderMenuTrigger,
  useMenuShiftTabExit,
  menuTriggerFocusTarget,
  menuContainsFocus,
  keepMenuNavigationKeys,
} from "./menu-action";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  /** Whether the trigger renders a native button. Inferred for intrinsic elements. */
  nativeButton?: boolean;
  variant?: Variant;
  color?: string;
  header?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTriggerDoubleClick?: MouseEventHandler<HTMLElement>;
  contentClassName?: string;
  scrollOrientation?: "vertical" | "horizontal" | "both";
  matchTriggerWidth?: boolean;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

export function Dropdown({
  header,
  trigger,
  children,
  ref,
  nativeButton,
  variant,
  color,
  side,
  disabled,
  open,
  onOpenChange,
  onTriggerDoubleClick,
  contentClassName,
  scrollOrientation = "vertical",
  matchTriggerWidth = true,
  portalContainer,
}: DropdownProps) {
  const handoff = useMenuActionHandoff();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);
  const closeHandled = useRef(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = open ?? internalOpen;
  const changeOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  useNotificationEscape(actualOpen, () => changeOpen(false));
  useMenuShiftTabExit(actualOpen, popupRef, () => {
    closeHandled.current = true;
    returnFocus.current = true;
    menuTriggerFocusTarget(triggerRef.current)?.focus({ preventScroll: true });
    changeOpen(false);
  });
  const isNativeButton =
    nativeButton ??
    !(isValidElement(trigger) && typeof trigger.type === "string" && trigger.type !== "button");
  return (
    <Menu.Root
      onOpenChangeComplete={handoff.onOpenChangeComplete}
      open={actualOpen}
      loopFocus={false}
      onOpenChange={(next, details) => {
        if (!next && preserveMenuInteraction(details)) return;
        closeHandled.current = !next;
        returnFocus.current =
          !next &&
          details.reason !== "focus-out" &&
          !(details.event instanceof KeyboardEvent && details.event.key === "Tab") &&
          menuContainsFocus(popupRef.current);
        // Restore before popup removal so a surrounding Modal never sees focus fall
        // to body and claims it. Tab retains Base UI's surrounding tab-order handoff.
        if (returnFocus.current)
          menuTriggerFocusTarget(triggerRef.current)?.focus({ preventScroll: true });
        changeOpen(next);
      }}
    >
      <Menu.Trigger
        ref={mergeRefs([ref, triggerRef])}
        nativeButton={isNativeButton}
        disabled={disabled}
        className="group/trigger"
        onDoubleClick={onTriggerDoubleClick}
        onMouseDown={(event) => {
          if (!actualOpen && event.button === 0) event.preventDefault();
        }}
        render={(props, state) => renderMenuTrigger(trigger, props, state.open)}
      />
      <Menu.Portal container={portalContainer ?? undefined}>
        <Menu.Positioner
          align="center"
          side={side}
          collisionPadding={2}
          sideOffset={9}
          arrowPadding={2}
        >
          <Menu.Popup
            onKeyDown={keepMenuNavigationKeys}
            ref={popupRef}
            finalFocus={() => {
              const handled = closeHandled.current;
              closeHandled.current = false;
              const target = menuTriggerFocusTarget(triggerRef.current);
              if (handled) return returnFocus.current ? target : false;
              // A close through the `open` prop skips onOpenChange. Return focus when it
              // was in the menu or has fallen to the body with the removed popup.
              const active = document.activeElement;
              return !active || active === document.body || menuContainsFocus(popupRef.current)
                ? target
                : false;
            }}
            render={(props, state) => (
              <div {...props} data-state={state.open ? "open" : "closed"} />
            )}
            style={color ? ({ "--custom-color": color } as CSSProperties) : {}}
            className={clsx(
              color ? "custom-color" : variant,
              "variant-scope card-overlay dropdown-content m-0.5 min-w-55 [outline:none]",
              "max-h-[calc(var(--available-height)-4px)]",
              matchTriggerWidth && "desktop:w-[calc(var(--anchor-width)+10px)]",
              "w-[calc(var(--available-width)-4px)]",
              contentClassName,
            )}
          >
            {/* The six-pixel caret fills part of the nine-pixel side offset. */}
            {/* Positioner measures without Popup's margin. Remove that margin on the
                cross axis; stretch the SVG viewBox like Radix's 12 by 6 arrow. */}
            <Menu.Arrow className="data-[side=bottom]:-top-1.5 data-[side=bottom]:-translate-x-0.5 data-[side=bottom]:rotate-180 data-[side=top]:-bottom-1.5 data-[side=top]:-translate-x-0.5 data-[side=right]:-left-2.25 data-[side=right]:-translate-y-0.5 data-[side=right]:rotate-90 data-[side=left]:-right-2.25 data-[side=left]:-translate-y-0.5 data-[side=left]:-rotate-90">
              <Arrow
                filled={false}
                variant={variant ?? Variant.Default}
                className="block h-1.5 w-3"
                preserveAspectRatio="none"
              />
            </Menu.Arrow>
            <ScrollArea
              focusableViewport={false}
              header={header}
              shrinkHeight
              orientation={scrollOrientation}
              wrapperClassName="max-h-[calc(var(--available-height)-4px)]"
              className="flex max-h-[calc(var(--available-height)-6px)] flex-col gap-0.5 p-0.5"
            >
              <MenuActionProvider value={handoff.enqueue}>{children}</MenuActionProvider>
            </ScrollArea>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
