import { Fragment, useMemo } from "react";
import { DropdownMenu, ContextMenu, Collapsible } from "radix-ui";
import { IconChevronRight } from "@tabler/icons-react";
import { clsx } from "clsx";
import { ICON_CLASS_NAME } from "../constants/icon";
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
          "leading-none flex items-center rounded-xs group/item",
          "h-7 w-full text-sm px-1.25 relative pl-7.5 select-none outline-hidden",
          "data-disabled:pointer-events-none",
          "responsive highlight-list-item",
          variant,
        )}
      >
        {left && (
          <div
            className={clsx(
              "absolute left-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
              "responsive list-item-extra highlight-list-item",
              variant,
            )}
          >
            {left}
          </div>
        )}

        {label}

        <div
          className={clsx(
            "absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
            "responsive list-item-extra",
            variant,
          )}
        >
          <IconChevronRight
            className={clsx(
              ICON_CLASS_NAME,
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
                "w-full pl-2 py-0.5 pr-0.5 mb-0.5 rounded-b-xs dark:bg-black/30 bg-neutral-400/30",
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
