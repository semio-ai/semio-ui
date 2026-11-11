import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { clsx } from "clsx";
import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { Variant } from "../types";
import { ScrollArea } from "../layouts/scroll-area";
import {
  MenuActionProvider,
  useMenuActionHandoff,
  preserveMenuInteraction,
  useMenuTabContainment,
  renderMenuTrigger,
  useNotificationMenuEscape,
  menuContainsFocus,
  keepMenuNavigationKeys,
} from "./menu-action";

export interface ContextMenuProps {
  content: ReactNode;
  children: ReactNode;
  variant?: Variant;
  color?: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

export function ContextMenu({
  content,
  children,
  variant,
  color,
  disabled,
  onOpenChange,
  portalContainer,
}: ContextMenuProps) {
  const handoff = useMenuActionHandoff();
  const popupRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const returnFocus = useRef(false);
  const [open, setOpen] = useState(false);
  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  useNotificationMenuEscape(open, () => changeOpen(false));
  useMenuTabContainment(open, popupRef);
  return (
    <ContextMenuPrimitive.Root
      onOpenChangeComplete={handoff.onOpenChangeComplete}
      open={open}
      loopFocus={false}
      onOpenChange={(next, details) => {
        // Disabling blocks opening without disabling navigation in a mounted menu.
        if ((next && disabled) || (!next && preserveMenuInteraction(details))) {
          details.cancel();
          return;
        }
        if (next) previousFocus.current = document.activeElement as HTMLElement | null;
        returnFocus.current = !next && menuContainsFocus(popupRef.current);
        // Context menus return to the element focused before invocation, which can
        // differ from the row that received the context press.
        if (returnFocus.current) previousFocus.current?.focus({ preventScroll: true });
        changeOpen(next);
      }}
    >
      <ContextMenuPrimitive.Trigger
        render={(props, state) => renderMenuTrigger(children, props, state.open)}
      />
      <ContextMenuPrimitive.Portal container={portalContainer ?? undefined}>
        {/* Below the press point, its top-left corner just past the pointer, so it
            enters with the same vertical slide as a Dropdown and flips above the
            pointer where there is no room below. */}
        <ContextMenuPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={0}
          alignOffset={2}
          collisionPadding={2}
        >
          <ContextMenuPrimitive.Popup
            onKeyDown={keepMenuNavigationKeys}
            ref={popupRef}
            finalFocus={() => (returnFocus.current ? previousFocus.current : false)}
            // Base UI's ContextMenu keeps focus inside the open menu, Tab included, and
            // hides the page from assistive technology until the menu closes.
            render={(props, state) => (
              <div {...props} data-state={state.open ? "open" : "closed"} />
            )}
            style={color ? ({ "--custom-color": color } as CSSProperties) : {}}
            className={clsx(
              color ? "custom-color" : variant,
              "variant-scope card-overlay dropdown-content m-0.5 min-w-55 [outline:none]",
              "max-h-[calc(var(--available-height)-4px)]",
              "desktop:w-[calc(var(--anchor-width)+10px)]",
              "w-[calc(var(--available-width)-4px)]",
            )}
          >
            <ScrollArea
              shrinkHeight
              focusableViewport={false}
              className="max-h-[calc(var(--available-height)-4px)] p-0.5"
            >
              <MenuActionProvider value={handoff.enqueue}>{content}</MenuActionProvider>
            </ScrollArea>
          </ContextMenuPrimitive.Popup>
        </ContextMenuPrimitive.Positioner>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}
