import { Menu } from "@base-ui/react/menu";
import { Collapsible } from "@base-ui/react/collapsible";
import { useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon } from "../icons/registry";
import { ScrollArea } from "../layouts/scroll-area";
import { useLayoutState } from "../hooks/use-layout-state";
import { preserveMenuInteraction, keepMenuNavigationKeys } from "../floating/menu-action";
import type { NestedMenuProps } from "./types";
import { NestedLabel } from "./label";

/** A submenu on desktop and an inline disclosure on mobile. */
export function NestedMenu({
  left,
  right,
  children,
  label,
  variant,
  disabled,
  hideHeader,
}: NestedMenuProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();
  const { desktop } = useLayoutState();
  const triggerClass = clsx(
    "group/item flex items-center rounded-xs leading-none",
    "relative h-7 w-full px-1.25 pl-7.5 text-sm outline-hidden select-none",
    "variant-scope highlight-list-item",
    variant,
  );
  const triggerContent = (
    <>
      {left && (
        <div
          className={clsx(
            "absolute top-1/2 left-1 inline-flex -translate-y-1/2 items-center justify-center",
            "variant-scope list-item-extra highlight-list-item",
            variant,
          )}
        >
          {/* Shared `.list-item-icon` normalization, matching NestedItem — so submenu
                -trigger left icons align with regular item icons regardless of set.
                resolveIcon lets `left` be a registry key or a node. */}
          <span className="list-item-icon">{resolveIcon(left)}</span>
        </div>
      )}
      {right ? <span className="pr-12">{label}</span> : label}
      <div
        className={clsx(
          "absolute top-1/2 right-1 inline-flex -translate-y-1/2 items-center justify-center",
          "variant-scope list-item-extra",
          variant,
        )}
      >
        {right}
        {/* The glyph is sized as a fraction of its parent, so it gets a box of its
              own. Sized against the shared slot, it would grow with `right` and take
              the width `right` needs, squeezing a fixed-size indicator. */}
        <span className="inline-flex h-5 items-center justify-center">
          <Icon
            name="submenu"
            className={clsx(
              "rotate-0 transition-transform",
              !desktop && "group-data-[state=open]/item:rotate-90",
            )}
          />
        </span>
      </div>
    </>
  );
  const heightClass = "max-h-[calc(var(--available-height)-4px)]";
  if (!desktop)
    return (
      <Collapsible.Root disabled={disabled} open={mobileOpen} onOpenChange={setMobileOpen}>
        <Menu.Item
          disabled={disabled}
          closeOnClick={false}
          className={triggerClass}
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          // Menu.Item owns pointer, Enter and Space activation. Composing a second
          // button keyboard handler here would synthesize a second Space click.
          onClick={() => setMobileOpen((value) => !value)}
          render={(props) => <div {...props} data-state={mobileOpen ? "open" : "closed"} />}
        >
          {triggerContent}
        </Menu.Item>
        <Collapsible.Panel
          id={panelId}
          keepMounted
          render={(props, state) => <div {...props} data-state={state.open ? "open" : "closed"} />}
        >
          <div
            className={clsx(
              variant,
              "mb-0.5 w-full min-w-55 rounded-b-xs bg-neutral-400/30 py-0.5 pr-0.5 pl-2 dark:bg-black/30",
            )}
          >
            {children}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  return (
    <Menu.SubmenuRoot
      loopFocus={false}
      onOpenChange={(next, details) => {
        if (!next && preserveMenuInteraction(details)) return;
        // A submenu that closes with focus inside (Escape, ArrowLeft) returns it to its
        // trigger; one closed by the pointer moving to another entry leaves focus there.
        returnFocus.current = !next && !!popupRef.current?.contains(document.activeElement);
      }}
    >
      <Menu.SubmenuTrigger
        ref={triggerRef}
        disabled={disabled}
        className={triggerClass}
        render={(props, state) => <div {...props} data-state={state.open ? "open" : "closed"} />}
      >
        {triggerContent}
      </Menu.SubmenuTrigger>
      <Menu.Portal>
        <Menu.Positioner side="right" collisionPadding={0}>
          <Menu.Popup
            onKeyDown={keepMenuNavigationKeys}
            ref={popupRef}
            className="[outline:none]"
            finalFocus={() => (returnFocus.current ? triggerRef.current : false)}
            render={(props, state) => (
              <div {...props} data-state={state.open ? "open" : "closed"} />
            )}
          >
            <div
              className={clsx(
                variant,
                "variant-scope card-overlay dropdown-content min-w-55 w-[calc(var(--anchor-width)+10px)]",
                heightClass,
              )}
            >
              <ScrollArea
                focusableViewport={false}
                shrinkHeight
                wrapperClassName={heightClass}
                className={clsx("p-0.5", heightClass)}
              >
                {!hideHeader && <NestedLabel>{label}</NestedLabel>}
                {children}
              </ScrollArea>
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}
