import { memo, ReactNode } from "react";
import { clsx } from "clsx";
import { IconChevronRightPipe, IconMenu2 } from "@tabler/icons-react";
import {
  useActionItems,
  useActiveRightPane,
  useDesktopState,
  useHomeActionItem,
  useRightMenuItems,
  useRightRegionActive,
  useToolbarItems,
} from "../../hooks/layout-atoms";
import { Dropdown } from "../../floating/dropdown";
import { NestedLabel } from "../../nested-elements/label";
import { NestedChild } from "../../nested-elements/configured-render";
import { IconHome } from "../../icons/home";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { PaneRegion, Size, ToolbarWidget, Variant } from "../../types";
import { HeaderButton } from "../../buttons/header-button";
import { isPlaceholder } from "./types";

function InnerHeader({ homeIcon }: { homeIcon?: ReactNode }) {
  const desktop = useDesktopState();
  const toolbarItems = useToolbarItems();
  const homeActionItem = useHomeActionItem();
  const actionItems = useActionItems();
  const { toggleMenu, togglePaneRegion } = useLayoutActions();
  const rightMenuItems = useRightMenuItems();
  const rightRegionActive = useRightRegionActive();
  const activeRightPaneId = useActiveRightPane();

  const mobileMenuItems = toolbarItems.filter(
    (item) => item.type === "toolbar-widget" && item.mobileConfig?.location === "menu",
  ) as ToolbarWidget[];

  return (
    <div className="grid-area-header w-full h-full z-0">
      <div
        className={clsx(
          "h-10 flex items-center justify-stretch",
          "flex-row w-full gap-2 desktop:gap-1 pl-1 pr-1 desktop:pl-0",
        )}
      >
        <span className="grid desktop:hidden place-items-center flex-none">
          <Dropdown
            side="bottom"
            disabled={
              !homeActionItem ||
              isPlaceholder(homeActionItem) ||
              homeActionItem.children.length === 0
            }
            trigger={
              <span>
                <button
                  type="button"
                  role="tab"
                  className={clsx("w-9 h-9 grid place-items-center")}
                  onClick={() => {
                    toggleMenu();
                  }}
                >
                  {homeIcon ?? <IconHome />}
                </button>
              </span>
            }
          >
            {homeActionItem &&
              !isPlaceholder(homeActionItem) &&
              homeActionItem?.children.map((child) => <NestedChild key={child.id} {...child} />)}
          </Dropdown>
        </span>

        {toolbarItems.map((item) => {
          const showMobile =
            item.type === "toolbar-widget" && item.mobileConfig?.location === "header";
          if (item.type === "toolbar-spacer" && desktop)
            return <div key={item.id} className="flex-1" />;
          else if (!desktop && showMobile) return item.mobileConfig?.component ?? item.component;
          else if (desktop && item.type === "toolbar-widget") return item.component;
          return null;
        })}

        <div className="h-9 flex desktop:hidden flex-1" />

        <Dropdown
          disabled={mobileMenuItems.length + actionItems.length === 0}
          trigger={
            <HeaderButton
              className="grid desktop:hidden flex-none"
              variant={Variant.Default}
              size={Size.Sm}
              label="Toggle Menu"
              icon={<IconMenu2 className={clsx("w-3/5 h-3/5")} />}
            />
          }
        >
          {mobileMenuItems.length > 0 && (
            <>
              <NestedLabel className="flex sm:hidden">Actions</NestedLabel>
              {mobileMenuItems.map(
                (item: ToolbarWidget) =>
                  (item as ToolbarWidget).mobileConfig?.component ?? item.component,
              )}
            </>
          )}
          {actionItems.map(
            (item) => !isPlaceholder(item) && <NestedChild key={item.id} type="menu" {...item} />,
          )}
        </Dropdown>

        <div className="h-9 hidden desktop:flex flex-1" />

        <HeaderButton
          className={clsx("flex-none", !desktop || rightRegionActive ? "hidden" : "grid")}
          variant={Variant.Default}
          size={Size.Md}
          label="Toggle Menu"
          icon={
            <IconChevronRightPipe
              className={clsx(
                "transition-transform w-3/5 h-3/5 ease-in-out duration-100",
                rightRegionActive ? "rotate-360" : "rotate-180",
              )}
            />
          }
          disabled={
            rightMenuItems.length === 0 ||
            rightMenuItems.filter((item) => !item.disabled).length === 0
          }
          onClick={() =>
            togglePaneRegion(PaneRegion.Right, activeRightPaneId ?? rightMenuItems[0]?.id)
          }
        />
      </div>
    </div>
  );
}

export const Header = memo(InnerHeader);
