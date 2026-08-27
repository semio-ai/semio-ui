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
  /**
   * Widen the menu's floor, for items that carry a second line of text.
   *
   * A menu is normally floored at `min-w-55` (220px) and otherwise tracks its
   * trigger, which is right for a list of bare labels: the menu reads as belonging to
   * the control that opened it. It is wrong once an item has a description under its
   * label, because a trigger can be very narrow — a rung control in a table cell is
   * around 112px — so the floor, not the trigger, decides the width.
   *
   * **This is headroom, not a repair, and the measurement is the reason.** At the
   * 220px floor a description gets a 177px box, and the longest rung description in
   * the product measures 166px — it clears by 11px, under two characters. It fits by
   * accident: one more word, a longer rung name, or a font whose metrics differ by a
   * hair wraps it, and because the items are different lengths they wrap to different
   * heights, which reads as ragged rather than as a list. At `min-w-72` the box is
   * 245px, so the same string clears by 79px. Descriptions still have a budget, and
   * `select-option-description.browser.tsx` is what holds them to it.
   *
   * Expressed as **one flag choosing between two floors**, rather than as a second
   * `min-w-*` passed through `contentClassName`. Two utilities from the same family
   * would both apply, and which won would be decided by their order in the compiled
   * stylesheet rather than by the order they appear in the class attribute — a
   * silent dependency on Tailwind's sort.
   */
  wide?: boolean;
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
      wide = false,
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

    // The coordinator uses this callback's identity as the lock key, so
    // it MUST be stable across renders — otherwise the take/release pair
    // would use different references and the release would no-op,
    // leaving a stale entry that re-closes this dropdown the next time
    // it opens. The stable `close` reads the latest controlled-mode /
    // onOpenChange via refs.
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const close = useCallback(() => {
      if (!isControlledRef.current) setInternalOpen(false);
      onOpenChangeRef.current?.(false);
    }, []);

    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    // Take or release the open lock whenever our open state changes.
    // Taking the lock synchronously calls the previous holder's close,
    // which propagates back into its own state via the same mechanism
    // — exactly one dropdown ends up open.
    useEffect(() => {
      if (actualOpen) {
        takeDropdownOpenLock(close);
      } else {
        releaseDropdownOpenLock(close);
      }
    }, [actualOpen, close]);

    // Belt and braces: if this Dropdown unmounts while open, release
    // the lock so a future Dropdown isn't blocked by a dead reference.
    useEffect(() => {
      return () => releaseDropdownOpenLock(close);
    }, [close]);

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
                "responsive card dropdown-content m-0.5",
                wide ? "min-w-72" : "min-w-55",
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
