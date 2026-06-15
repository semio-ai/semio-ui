import { DropdownMenu as DropdownPrimitive } from "radix-ui";
import { clsx } from "clsx";
import {
  ReactNode,
  ForwardedRef,
  forwardRef,
  CSSProperties,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Variant } from "../types";
import { NestedParent } from "../nested-elements/types";
import { NestedParentProvider } from "../nested-elements/context";
import { ScrollArea } from "../layouts/scroll-area";
import { Arrow } from "./arrow";
import { takeDropdownOpenLock, releaseDropdownOpenLock } from "./dropdown-coordinator";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
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
}

const Dropdown = forwardRef(
  (
    {
      header,
      trigger,
      children,
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
    }: DropdownProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    // Always drive `DropdownPrimitive.Root` from a state we own so the
    // module-scoped coordinator can close us if another Dropdown opens
    // (see `dropdown-coordinator.ts`). When the consumer passes a
    // controlled `open` prop we mirror it; otherwise our internal state
    // is the source of truth and `onOpenChange` is still fired so any
    // listener observes transitions normally.
    const isControlled = open !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const actualOpen = isControlled ? (open ?? false) : internalOpen;

    // A stable handle the coordinator uses to ask this dropdown to close.
    // Re-binding `current` each render keeps it in sync with the latest
    // controlled/uncontrolled mode and onOpenChange callback without
    // invalidating the lock entry.
    const closeRef = useRef<() => void>(() => {});
    closeRef.current = () => {
      if (!isControlled) setInternalOpen(false);
      onOpenChange?.(false);
    };

    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    // Take or release the open lock whenever our open state changes.
    // Taking the lock synchronously calls the previous holder's
    // closeRef, which propagates back into its own state via the same
    // mechanism — exactly one dropdown ends up open.
    useEffect(() => {
      const close = closeRef.current;
      if (actualOpen) {
        takeDropdownOpenLock(close);
      } else {
        releaseDropdownOpenLock(close);
      }
    }, [actualOpen]);

    // Belt and braces: if this Dropdown unmounts while open, release
    // the lock so a future Dropdown isn't blocked by a dead reference.
    useEffect(() => {
      const close = closeRef.current;
      return () => releaseDropdownOpenLock(close);
    }, []);

    return (
      <NestedParentProvider value={NestedParent.Dropdown}>
        <DropdownPrimitive.Root open={actualOpen} onOpenChange={handleOpenChange}>
          <DropdownPrimitive.Trigger
            ref={ref}
            asChild
            disabled={disabled}
            className="group/trigger"
            onDoubleClick={onTriggerDoubleClick}
          >
            {trigger}
          </DropdownPrimitive.Trigger>
          <DropdownPrimitive.Portal>
            <DropdownPrimitive.Content
              align="center"
              side={side}
              collisionPadding={2}
              sideOffset={3}
              arrowPadding={2}
              style={color ? ({ "--custom-color": color } as CSSProperties) : {}}
              className={clsx(
                color ? "custom-color" : variant,
                "responsive card dropdown-content m-0.5 min-w-55",
                "max-h-[calc(var(--radix-dropdown-menu-content-available-height)-4px)]",
                matchTriggerWidth &&
                  "desktop:w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]",
                "w-[calc(var(--radix-dropdown-menu-content-available-width)-4px)]",
                contentClassName,
              )}
            >
              <DropdownPrimitive.Arrow asChild width={12} height={6}>
                <Arrow filled={false} variant={variant ?? Variant.Default} color={color} />
              </DropdownPrimitive.Arrow>

              <ScrollArea
                header={header}
                shrinkHeight
                orientation={scrollOrientation}
                wrapperClassName="max-h-[calc(var(--radix-dropdown-menu-content-available-height)-4px)]"
                className={clsx(
                  "flex max-h-[calc(var(--radix-dropdown-menu-content-available-height)-6px)] flex-col gap-0.5 p-0.5",
                )}
              >
                {children}
              </ScrollArea>
            </DropdownPrimitive.Content>
          </DropdownPrimitive.Portal>
        </DropdownPrimitive.Root>
      </NestedParentProvider>
    );
  },
);

Dropdown.displayName = "Dropdown";

export { Dropdown };
