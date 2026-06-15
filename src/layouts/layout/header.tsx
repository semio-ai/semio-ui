import { memo, ReactNode } from "react";
import { clsx } from "clsx";
import { IconChevronRightPipe } from "@tabler/icons-react";
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
import { ICON_CLASS_NAME } from "../../constants/icon";
import { Icon } from "../../icons/registry";
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
    <div className="grid-area-header z-0 h-full w-full">
      <div
        className={clsx(
          "flex h-10 items-center justify-stretch",
          "desktop:gap-1 desktop:pl-0 w-full flex-row gap-2 pr-1 pl-1",
        )}
      >
        <span className="desktop:hidden grid flex-none place-items-center">
          <Dropdown
            side="bottom"
            disabled={
              !homeActionItem ||
              isPlaceholder(homeActionItem) ||
              homeActionItem.children.length + actionItems.length === 0
            }
            trigger={
              <span>
                <button
                  type="button"
                  role="tab"
                  className={clsx("grid h-9 w-9 place-items-center")}
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

        <div className="desktop:hidden flex h-9 flex-1" />

        <Dropdown
          disabled={mobileMenuItems.length + actionItems.length === 0}
          trigger={
            <HeaderButton
              className="desktop:hidden grid flex-none"
              variant={Variant.Default}
              size={Size.Sm}
              label="Toggle Menu"
              icon={<Icon name="menu2" />}
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

        <div className="desktop:flex hidden h-9 flex-1" />

        <HeaderButton
          className={clsx("flex-none", !desktop || rightRegionActive ? "hidden" : "grid")}
          variant={Variant.Default}
          size={Size.Md}
          label="Toggle Menu"
          icon={
            <IconChevronRightPipe
              className={clsx(
                ICON_CLASS_NAME,
                "transition-transform duration-100 ease-in-out",
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
