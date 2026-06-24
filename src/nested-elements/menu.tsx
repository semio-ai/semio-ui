import { Fragment, useMemo } from "react";
import { DropdownMenu, ContextMenu, Collapsible } from "radix-ui";
import { clsx } from "clsx";
import { Icon, resolveIcon } from "../icons/registry";
import { ScrollArea } from "../layouts/scroll-area";
import { useLayoutState } from "../hooks/use-layout-state";
import { NestedParent, type NestedMenuProps } from "./types";
import { useNestedParent } from "./context";
import { NestedLabel } from "./label";

/**
 * A component that renders a nested menu with optional sub-menus.
 *
 * @param props - The props for the NestedMenu component ({@link NestedMenuProps}).
 * @returns The rendered NestedMenu component.
 */
export function NestedMenu({
  left,
  children,
  label,
  variant,
  disabled,
  hideHeader,
}: NestedMenuProps) {
  const parent = useNestedParent();
  const { desktop } = useLayoutState();

  const heightClass =
    parent === NestedParent.Dropdown
      ? "max-h-[calc(var(--radix-dropdown-menu-content-available-height)-4px)]"
      : "max-h-[calc(var(--radix-context-menu-content-available-height)-4px)]";

  const [SubComponent, SubTriggerComponent, PortalComponent, SubContentComponent, props] =
    useMemo(() => {
      // In the case of a mobile device, render the sub-menu as a collapsible element
      if (!desktop)
        return [Collapsible.Root, Collapsible.Trigger, Fragment, Collapsible.Content, {}];
      else if (parent === NestedParent.Dropdown)
        return [
          DropdownMenu.Sub,
          DropdownMenu.SubTrigger,
          DropdownMenu.Portal,
          DropdownMenu.SubContent,
          { side: "right" },
        ];
      else
        return [
          ContextMenu.Sub,
          ContextMenu.SubTrigger,
          ContextMenu.Portal,
          ContextMenu.SubContent,
          { side: "right" },
        ];
    }, [desktop, parent]);

  return (
    <SubComponent>
      <SubTriggerComponent
        disabled={disabled}
        className={clsx(
          "group/item flex items-center rounded-xs leading-none",
          "relative h-7 w-full px-1.25 pl-7.5 text-sm outline-hidden select-none",
          "data-disabled:pointer-events-none",
          "responsive highlight-list-item",
          variant,
        )}
      >
        {left && (
          <div
            className={clsx(
              "absolute top-1/2 left-1 inline-flex -translate-y-1/2 items-center justify-center",
              "responsive list-item-extra highlight-list-item",
              variant,
            )}
          >
            {/* Shared `.list-item-icon` normalization, matching NestedItem — so submenu
                -trigger left icons align with regular item icons regardless of set.
                resolveIcon lets `left` be a registry key or a node. */}
            <span className="list-item-icon">{resolveIcon(left)}</span>
          </div>
        )}

        {label}

        <div
          className={clsx(
            "absolute top-1/2 right-1 inline-flex -translate-y-1/2 items-center justify-center",
            "responsive list-item-extra",
            variant,
          )}
        >
          <Icon
            name="submenu"
            className={clsx(
              "rotate-0 transition-transform",
              !desktop && "group-data-[state=open]/item:rotate-90",
            )}
          />
        </div>
      </SubTriggerComponent>
      <PortalComponent>
        <SubContentComponent {...props}>
          <div
            className={clsx(
              variant,
              !desktop &&
                "mb-0.5 w-full rounded-b-xs bg-neutral-400/30 py-0.5 pr-0.5 pl-2 dark:bg-black/30",
              desktop && "responsive card dropdown-content",
              "min-w-55",
              desktop && heightClass,
              desktop && parent === NestedParent.Dropdown
                ? "w-[calc(var(--radix-dropdown-menu-trigger-width)+10px)]"
                : "w-[calc(var(--radix-context-menu-trigger-width)+10px)]",
            )}
          >
            {!desktop && (
              <>
                {!hideHeader && desktop && (
                  <NestedLabel key={`header-${label || ""}`}>{label}</NestedLabel>
                )}
                {children}
              </>
            )}
            {desktop && (
              <ScrollArea
                shrinkHeight
                wrapperClassName={heightClass}
                className={clsx("p-0.5", heightClass)}
              >
                {!hideHeader && desktop && (
                  <NestedLabel key={`header-${label || ""}`}>{label}</NestedLabel>
                )}
                {children}
              </ScrollArea>
            )}
          </div>
        </SubContentComponent>
      </PortalComponent>
    </SubComponent>
  );
}
