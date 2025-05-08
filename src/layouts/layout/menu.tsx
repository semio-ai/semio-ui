import { memo, MouseEvent, ReactNode } from "react";
import { clsx } from "clsx";
import { IconChevronRightPipe } from "@tabler/icons-react";
import {
  useActionItems,
  useActiveLeftPane,
  useDesktopState,
  useHomeActionItem,
  useLeftMenuItems,
  useMenuState,
} from "../../hooks/layout-atoms";
import { ScrollArea } from "../scroll-area";
import { Dropdown } from "../../floating/dropdown";
import { MenuButton } from "../../buttons/menu-button";
import { NestedLabel } from "../../nested-elements/label";
import { NestedChild } from "../../nested-elements/configured-render";
import { IconHome } from "../../icons/home";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { MenuItemClickFn, PaneRegion, Variant } from "../../types";
import { ContextMenu } from "../../floating/context-menu";
import { NestedSelect } from "../../nested-elements/select";
import { NestedRadio } from "../../nested-elements/radio";

function InnerMenu({
  homeIcon,
  homeText,
  homeClassName,
}: {
  homeIcon?: ReactNode;
  homeText?: string;
  homeClassName?: string;
}) {
  const menuState = useMenuState();
  const desktop = useDesktopState();
  const homeActionItem = useHomeActionItem();
  const actionItems = useActionItems();
  const { togglePaneRegion, toggleMenu } = useLayoutActions();
  const leftMenuItems = useLeftMenuItems();
  const activeLeftPaneId = useActiveLeftPane();

  return (
    <ContextMenu
      content={
        <>
          <NestedRadio
            value={activeLeftPaneId}
            onChange={(value) => {
              const clickFn = leftMenuItems.find((item) => item.id === value)?.clickFn;
              const preventClose = leftMenuItems.find((item) => item.id === value)?.preventClose;
              const callFn = async () => {
                await (clickFn as MenuItemClickFn | undefined)?.(value);
                togglePaneRegion(PaneRegion.Left, value, preventClose);
              };
              void callFn();
            }}
            options={leftMenuItems.map((item) => ({
              label: item.name,
              value: item.id,
              icon: item.icon,
            }))}
          />
          <NestedSelect
            values={menuState ? ["open"] : []}
            options={[
              {
                label: menuState ? "Collapse Menu" : "Expand Menu",
                value: "open",
                icon: (
                  <IconChevronRightPipe
                    className={clsx(
                      "w-3/5 h-3/5 transition-transform",
                      menuState ? "rotate-180" : "rotate-360",
                    )}
                  />
                ),
              },
            ]}
            onChange={() => {
              toggleMenu();
            }}
          />
        </>
      }
    >
      <div
        data-ui={menuState ? "expanded" : ""}
        // The classname 'grid-area-menu' places the menu in the correct grid area.
        className={clsx("grid-area-menu h-full w-full z-0", "group/menu")}
        onDoubleClick={toggleMenu}
      >
        <ScrollArea
          wrapperClassName={clsx(
            "responsive card-transparent flex",
            "h-10 w-full justify-center align-middle",
            "desktop:h-full desktop:w-10 desktop:group-data-expanded/menu:w-fit desktop:justify-start",
          )}
          className="desktop:pl-0.5"
          orientation={desktop ? "vertical" : "horizontal"}
          headerClassName="dark:bg-layout-dark-inset bg-layout-light-inset pl-0.5"
          footerClassName="dark:bg-layout-dark-inset bg-layout-light-inset pl-0.5"
          header={
            desktop ? (
              <div className="flex flex-col">
                <Dropdown
                  disabled={!homeActionItem || homeActionItem.children.length === 0}
                  side="right"
                  trigger={
                    <span>
                      <MenuButton
                        key="menu-home-toggle"
                        icon={homeIcon ?? <IconHome />}
                        className="font-bold"
                        textClassName={homeClassName}
                      >
                        {homeText ?? "Home"}
                      </MenuButton>
                    </span>
                  }
                >
                  {homeActionItem?.children.map((child) => (
                    <NestedChild key={child.id} {...child} />
                  ))}
                </Dropdown>
              </div>
            ) : undefined
          }
          footer={
            desktop && actionItems.length > 0 ? (
              <div className="flex flex-col">
                {actionItems.map((actionItem) => (
                  <Dropdown
                    side="right"
                    key={actionItem.id}
                    variant={actionItem.variant}
                    trigger={
                      <span>
                        <MenuButton
                          key={actionItem.id}
                          variant={actionItem.variant}
                          icon={actionItem.left}
                          hoverable
                        >
                          {actionItem.label ?? "Action"}
                        </MenuButton>
                      </span>
                    }
                  >
                    <NestedLabel key={actionItem.id}>{actionItem.label ?? "Action"}</NestedLabel>
                    {actionItem.children.map((child) => (
                      <NestedChild key={child.id} {...child} />
                    ))}
                  </Dropdown>
                ))}
              </div>
            ) : undefined
          }
        >
          <div className="w-full h-full flex flex-row justify-center desktop:justify-start desktop:flex-col">
            {leftMenuItems.map((leftMenuItem) => (
              <MenuButton
                key={leftMenuItem.id}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  const callFn = async (event: MouseEvent<HTMLButtonElement>) => {
                    await (leftMenuItem.clickFn as MenuItemClickFn | undefined)?.(
                      leftMenuItem.id,
                      event,
                    );
                    togglePaneRegion(PaneRegion.Left, leftMenuItem.id, leftMenuItem.preventClose);
                  };
                  void callFn(e);
                }}
                hoverable
                variant={Variant.Primary}
                icon={leftMenuItem.icon}
                active={leftMenuItem.id === activeLeftPaneId}
              >
                {leftMenuItem.name}
              </MenuButton>
            ))}
          </div>
        </ScrollArea>
      </div>
    </ContextMenu>
  );
}

export const Menu = memo(InnerMenu);
