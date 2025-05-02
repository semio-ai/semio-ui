import type {
  MutableRefObject,
  ReactNode,
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ForwardedRef,
} from "react";
import { forwardRef, isValidElement, memo, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence, TargetAndTransition } from "motion/react";
import { useGesture } from "@use-gesture/react";
import {
  IconArrowBackUp,
  IconArrowBigUp,
  IconArrowForwardUp,
  IconBuildingStore,
  IconChevronRightPipe,
  IconCommand,
  IconDeviceFloppy,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFile,
  IconLayoutDashboard,
  IconLetterZ,
  IconLogout,
  IconMenu2,
  IconMoon,
  IconRotate,
  IconShoppingBag,
  IconSquare,
  IconSun,
  IconSunMoon,
  IconUserEdit,
} from "@tabler/icons-react";
import useMeasure, { RectReadOnly } from "react-use-measure";
import { Button } from "../buttons/button";
import { IconHome } from "../icons/home";
import { MenuItemClickFn, PaneRegion, Size, Theme, ToolbarWidget, Variant } from "../types";
import { Status } from "../status";
import { Tooltip } from "../floating/tooltip";
import { Search } from "../inputs/search";
import { Avatar } from "../avatar";
import { Dropdown } from "../floating/dropdown";
import { NestedLabel } from "../nested-elements/label";
import { NestedChild } from "../nested-elements/configured-render";
import { HeaderButton } from "../buttons/header-button";
import { IconFileTypeMod } from "../icons/file-type-mod";
import { IconFileTypeVizij } from "../icons/file-type-vizij";
import { useTheme } from "../hooks/use-theme";
import { IconFileTypeAni } from "../icons/file-type-ani";
import { NestedItem } from "../nested-elements/item";
import { useLayoutState } from "../hooks/use-layout-state";
import { useLayoutActions } from "../hooks/use-layout-actions";
import {
  useActionItems,
  useActiveLeftPane,
  useActiveRightPane,
  useDesktopState,
  useFooterRegionActive,
  useHomeActionItem,
  useLeftMenuItems,
  useMenuState,
  usePanes,
  useRightMenuItems,
  useToolbarItems,
} from "../hooks/layout-atoms";
import { ScrollArea } from "./scroll-area";

export interface LayoutNewProps {
  className?: string;
  children?: ReactNode | ((contentBounds: RectReadOnly) => ReactNode);
  homeIcon?: ReactNode;
  homeText?: string;
  homeClassName?: string;
}

function TestPane() {
  const footerRegionActive = useFooterRegionActive();
  const { togglePaneRegion } = useLayoutActions();

  return (
    <div className="w-full h-full bg-secondary-500/30 flex flex-col p-3">
      <div>Pane 2 Content</div>
      <Button onClick={() => togglePaneRegion(PaneRegion.Footer, "footer")}>
        {footerRegionActive ? "Close Footer" : "Open Footer"}
      </Button>
    </div>
  );
}

/**
 * Renders the inner layout of the application.
 *
 * TODO: Update with resizeable panes and pop out windows.
 *
 * @param className - The class name applied to the root element.
 */
export function InnerLayoutNew({
  className,
  homeIcon,
  homeText,
  children,
  homeClassName,
}: LayoutNewProps) {
  const root = useRef<HTMLDivElement>();
  const [contentRef, contentBounds] = useMeasure();

  const {
    desktop,
    contentWidth,
    leftWidth,
    rightWidth,
    menuExpanded,
    leftRegionActive,
    rightRegionActive,
    footerRegionActive,
  } = useLayoutState();

  const leftMenuItems = useLeftMenuItems();
  const rightMenuItems = useRightMenuItems();

  const toolbarItems = useToolbarItems();
  const actionItems = useActionItems();
  const homeActionItem = useHomeActionItem();

  const {
    setPanes,
    toggleMenu,
    togglePaneRegion,
    setToolbarItems,
    setActionItems,
    setHomeActionItem,
  } = useLayoutActions();

  const activeLeftPaneId = useActiveLeftPane();
  const activeRightPaneId = useActiveRightPane();

  const { explicitTheme, setExplicitTheme } = useTheme();

  useEffect(() => {
    setPanes([
      {
        id: "one",
        name: "Pane 1",
        content: (
          <div className="w-full desktop:w-[200px] h-full bg-primary-500/30">Pane 1 Content</div>
        ),
        size: "auto",
      },
      {
        id: "two",
        name: "Pane 2",
        content: <TestPane />,
        size: "full",
      },
      {
        id: "inspect",
        name: "Inspector",
        content: <div className="w-[250px] h-full bg-info-500/30">Inspector Content</div>,
        size: "auto",
        inRightMenu: true,
        inLeftMenu: false,
      },
      {
        id: "details",
        name: "Details",
        content: <div className="w-[250px] h-full bg-violet-500/30">Details Content</div>,
        size: "auto",
        inRightMenu: true,
        inLeftMenu: false,
      },
      {
        id: "footer",
        name: "Footer",
        content: <div className="w-full desktop:h-50 h-20 bg-info-500/30">Footer Content</div>,
        size: "auto",
        inRightMenu: false,
        inLeftMenu: false,
      },
    ]);
    setToolbarItems([
      {
        id: "search",
        type: "toolbar-widget",
        component: (
          <Search
            key="search"
            placeholder="Search..."
            size={Size.Md}
            bg
            wrapperClassName="backdrop-blur-lg"
          />
        ),
        mobileConfig: {
          location: "header",
          component: (
            <Search
              key="search"
              placeholder="Search..."
              size={Size.Sm}
              bg
              wrapperClassName="backdrop-blur-lg flex-1 min-w-10"
            />
          ),
        },
      },
      {
        id: "save",
        type: "toolbar-widget",
        component: (
          <HeaderButton
            key="save"
            label="Save"
            size={Size.Md}
            icon={<IconDeviceFloppy className="w-3/5 h-3/5" />}
          />
        ),
        mobileConfig: {
          location: "header",
          component: (
            <HeaderButton
              key="save"
              label="Save"
              size={Size.Sm}
              icon={<IconDeviceFloppy className="w-3/5 h-3/5" />}
              className="flex-none"
            />
          ),
        },
      },
      {
        id: "studio-actions",
        type: "toolbar-widget",
        component: (
          <div key="actions" className="flex flex-row gap-1 z-0">
            <HeaderButton
              label="Undo"
              size={Size.Md}
              icon={<IconArrowBackUp className="w-3/5 h-3/5" />}
            />
            <HeaderButton
              disabled
              label="Redo"
              size={Size.Md}
              icon={<IconArrowForwardUp className="w-3/5 h-3/5" />}
            />
          </div>
        ),
        mobileConfig: {
          location: "menu",
          component: (
            <>
              <NestedItem
                key="undo"
                left={<IconArrowBackUp className="w-3/5 h-3/5" />}
                right={
                  <div className="flex flex-row items-center justify-end gap-0 h-5">
                    <IconCommand className="w-3 h-3" />
                    <IconLetterZ className="w-3 h-3" />
                  </div>
                }
              >
                Undo
              </NestedItem>
              <NestedItem
                key="redo"
                left={<IconArrowForwardUp className="w-3/5 h-3/5" />}
                right={
                  <div className="flex flex-row items-center justify-end gap-0 h-5">
                    <IconArrowBigUp className="w-3 h-3" />
                    <IconCommand className="w-3 h-3" />
                    <IconLetterZ className="w-3 h-3" />
                  </div>
                }
              >
                Redo
              </NestedItem>
            </>
          ),
        },
      },
      {
        id: "spacer-1",
        type: "toolbar-spacer",
      },
    ]);
    setHomeActionItem({
      id: "home",
      children: [
        {
          id: "file",
          type: "menu",
          label: "File",
          left: <IconFile className="w-3/5 h-3/5" />,
          children: [],
        },
        {
          id: "edit",
          type: "menu",
          label: "Edit",
          left: <IconEdit className="w-3/5 h-3/5" />,
          children: [],
        },
        {
          id: "view",
          type: "menu",
          label: "View",
          left: <IconEye className="w-3/5 h-3/5" />,
          children: [],
        },
        {
          id: "versions",
          type: "menu",
          label: "Versions",
          left: <IconRotate className="w-3/5 h-3/5" />,
          children: [],
        },
        {
          id: "exit",
          type: "menu",
          label: "Exit",
          left: <IconExternalLink className="w-3/5 h-3/5" />,
          children: [],
        },
      ],
    });
    setActionItems([
      {
        id: "home",
        label: "Home",
        left: <IconHome className="w-3/5 h-3/5" />,
        children: [
          {
            id: "go-to-dashboard",
            type: "item",
            children: "Go to Dashboard",
            onClick: () => console.log("go-to-dashboard clicked"),
            right: <IconExternalLink className="w-3/5 h-3/5" />,
          },
          {
            id: "home",
            type: "item",
            children: "Dashboard Home",
            left: <IconLayoutDashboard className="w-3/5 h-3/5" />,
            onClick: () => console.log("home clicked"),
          },
          {
            id: "home/models",
            type: "item",
            children: "Models",
            left: <IconFileTypeMod className="w-3/5 h-3/5" />,
            onClick: () => console.log("home/models clicked"),
          },
          {
            id: "home/vizij",
            type: "item",
            children: "Faces",
            left: <IconFileTypeVizij className="w-3/5 h-3/5" />,
            onClick: () => console.log("home/vizij clicked"),
          },
          {
            id: "home/animations",
            type: "item",
            children: "Animations",
            left: <IconFileTypeAni className="w-3/5 h-3/5" />,
            onClick: () => console.log("home/animations clicked"),
          },
        ],
      },
      {
        id: "marketplace",
        label: "Marketplace",
        left: <IconShoppingBag className="w-3/5 h-3/5" />,
        children: [
          {
            id: "go-to-marketplace",
            type: "item",
            children: "Go to Marketplace",
            onClick: () => console.log("go-to-marketplace clicked"),
            right: <IconExternalLink className="w-3/5 h-3/5" />,
          },
          {
            id: "marketplace",
            type: "item",
            children: "Marketplace Home",
            left: <IconBuildingStore className="w-3/5 h-3/5" />,
            onClick: () => console.log("marketplace clicked"),
          },
          {
            id: "marketplace/models",
            type: "item",
            children: "Models",
            left: <IconFileTypeMod className="w-3/5 h-3/5" />,
            onClick: () => console.log("marketplace/models clicked"),
          },
          {
            id: "marketplace/vizij",
            type: "item",
            children: "Faces",
            left: <IconFileTypeVizij className="w-3/5 h-3/5" />,
            onClick: () => console.log("marketplace/vizij clicked"),
          },
          {
            id: "marketplace/animations",
            type: "item",
            children: "Animations",
            left: <IconFileTypeAni className="w-3/5 h-3/5" />,
            onClick: () => console.log("marketplace/animations clicked"),
          },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        left: (
          <Avatar
            src="https://avatars.githubusercontent.com/u/5341396?v=4&size=64"
            alt="Andy"
            size={Size.Xs}
            status={{
              variant: Variant.Success,
              placement: "bottom-right",
            }}
            onClick={() => {}}
          />
        ),
        children: [
          {
            id: "settings/profile",
            type: "item",
            children: "Edit Profile",
            left: <IconUserEdit className="w-3/5 h-3/5" />,
            onClick: () => console.log("settings/profile clicked"),
          },
          {
            id: "settings/signinout",
            type: "item",
            children: "Sign Out",
            left: <IconLogout className="w-3/5 h-3/5" />,
            onClick: () => console.log("settings/signinout clicked"),
          },
          {
            id: "settings/sep1",
            type: "separator",
          },
          {
            id: "settings/theme-label",
            type: "label",
            children: "Theme",
          },
          {
            id: "settings/theme-selector",
            type: "radio",
            value: explicitTheme as string,
            options: [
              {
                value: "light",
                label: "Light",
                icon: <IconSun size="13px" />,
                color: "#F99600",
              },
              {
                value: "dark",
                label: "Dark",
                icon: <IconMoon size="13px" />,
                color: "#34B9AB",
              },
              {
                value: "system",
                label: "System",
                icon: <IconSunMoon size="13px" />,
              },
            ],
            onChange: (value) => setExplicitTheme(value as Theme),
          },
        ],
      },
    ]);
  }, [
    setPanes,
    setToolbarItems,
    setActionItems,
    setHomeActionItem,
    setExplicitTheme,
    explicitTheme,
  ]);

  useGesture(
    {
      onPinch: ({ event }) => {
        event.preventDefault();
        event.stopPropagation();
      },
    },
    {
      target: root as MutableRefObject<EventTarget>,
      eventOptions: { passive: false },
    },
  );

  const mobileMenuItems = toolbarItems.filter(
    (item) => item.type === "toolbar-widget" && item.mobileConfig?.location === "menu",
  ) as ToolbarWidget[];

  return (
    <div
      style={
        {
          "--content-size": contentWidth,
          "--left-size": leftWidth,
          "--right-size": rightWidth,
          "--content-left-gap": leftRegionActive && !leftWidth.includes("1fr") ? "4px" : "0px",
          "--content-footer-gap": footerRegionActive ? "4px" : "0px",
        } as CSSProperties
      }
      ref={root as MutableRefObject<HTMLDivElement>}
      className={clsx(
        "relative top-0 left-0 h-dvh right-0 flex select-none",
        "bg-layout-light-base dark:bg-layout-dark-base",
        "app-layout",
        className,
      )}
    >
      {/* The backdrop/background element is a child of the layout component */}
      {children && (
        <div className="absolute top-0 left-0 bottom-0 right-0">
          {isValidElement(children) && children}
          {!isValidElement(children) && typeof children === "function" && children(contentBounds)}
        </div>
      )}

      {/* Menu (thin left bar)*/}
      <div
        data-ui={menuExpanded ? "expanded" : ""}
        className={clsx("grid-area-menu h-full w-full z-0", "group/menu")}
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
                  side="right"
                  trigger={
                    <span>
                      <MenuBarButton
                        key="menu-home-toggle"
                        icon={homeIcon ?? <IconHome />}
                        className="font-bold"
                        textClassName={homeClassName}
                      >
                        {homeText ?? "Home"}
                      </MenuBarButton>
                    </span>
                  }
                >
                  <NestedLabel key="menu-home-toggle">Home</NestedLabel>
                  {homeActionItem?.children.map((child) => (
                    <NestedChild key={child.id} {...child} />
                  ))}
                  <NestedItem
                    left={
                      <IconChevronRightPipe
                        className={clsx(
                          "transition-transform w-3/5 h-3/5 ease-in-out duration-100",
                          menuExpanded ? "rotate-180" : "rotate-360",
                        )}
                      />
                    }
                    onClick={(e) => {
                      toggleMenu();
                      e.stopPropagation();
                    }}
                  >
                    {menuExpanded ? "Collapse" : "Expand"}
                  </NestedItem>
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
                        <MenuBarButton
                          key={actionItem.id}
                          variant={actionItem.variant}
                          icon={actionItem.left}
                          hoverable
                        >
                          {actionItem.label ?? "Action"}
                        </MenuBarButton>
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
              <MenuBarButton
                key={leftMenuItem.id}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  const callFn = async (event: MouseEvent<HTMLButtonElement>) => {
                    await (leftMenuItem.clickFn as MenuItemClickFn | undefined)?.(
                      leftMenuItem.id,
                      event,
                    );
                    togglePaneRegion(PaneRegion.Left, leftMenuItem.id);
                  };
                  void callFn(e);
                }}
                hoverable
                variant={Variant.Primary}
                icon={leftMenuItem.icon}
                active={leftMenuItem.id === activeLeftPaneId}
              >
                {leftMenuItem.name}
              </MenuBarButton>
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((item) => (
              <MenuBarButton
                key={item}
                hoverable
                variant={Variant.Primary}
                icon={<IconSquare className="w-3/5 h-3/5" />}
              >
                {`Pane ${item.toString()}`}
              </MenuBarButton>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Header */}
      <div className="grid-area-header w-full h-full z-0">
        <div
          className={clsx(
            "h-10 flex items-center justify-stretch",
            "flex-row w-full gap-2 desktop:gap-1 pl-1 pr-1 desktop:pr-0",
          )}
        >
          <span className="grid desktop:hidden place-items-center flex-none">
            <Dropdown
              side="bottom"
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
              <NestedItem
                left={
                  <IconChevronRightPipe
                    className={clsx(
                      "transition-transform w-3/5 h-3/5 ease-in-out duration-100",
                      menuExpanded ? "rotate-180" : "rotate-360",
                    )}
                  />
                }
                onClick={(e) => {
                  toggleMenu();
                  e.stopPropagation();
                }}
              >
                {menuExpanded ? "Collapse" : "Expand"}
              </NestedItem>
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

          <Dropdown
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
            {actionItems.map((item) => (
              <NestedChild key={item.id} type="menu" {...item} />
            ))}
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

      {/* Left Sidebar */}
      <div className={clsx("grid-area-left w-full h-full overflow-clip transition-[width,height]")}>
        <PanelContent region={PaneRegion.Left} />
      </div>

      {/* Right Sidebar */}
      <div
        className={clsx("grid-area-right w-full h-full overflow-clip transition-[width,height]")}
      >
        <PanelContent region={PaneRegion.Right} />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={clsx("grid-area-content w-full h-full overflow-hidden -z-1")}
      >
        <div className={clsx("h-full w-full bg-transparent pointer-events-none")} />
      </div>

      {/* Footer */}
      <div className={clsx("grid-area-footer w-full h-full overflow-hidden")}>
        <PanelContent region={PaneRegion.Footer} />
      </div>
    </div>
  );
}

interface MenuBarButtonProps {
  children: string;
  altText?: string;
  icon: ReactNode;
  onClick?: MouseEventHandler;
  active?: boolean;
  hoverable?: boolean;
  variant?: Variant;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
  className?: string;
  textClassName?: string;
}

function InnerMenuBarButton(
  {
    children,
    altText,
    icon,
    onClick,
    active,
    hoverable,
    status,
    variant,
    className,
    textClassName,
  }: MenuBarButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const menuOpen = useMenuState();
  const desktop = useDesktopState();
  const Wrapper = status ? Status : "div";
  const wrapperProps = status
    ? {
        variant: status.variant,
        placement: status.placement,
        text: status.text,
        className: clsx(
          "responsive",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
        ),
      }
    : {
        className: clsx(
          "responsive",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          "w-9 h-9 grid place-items-center",
        ),
      };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={active}
      className={clsx(
        variant,
        "w-9 group/tab h-9 overflow-hidden",
        desktop && "group-data-expanded/menu:w-[188px]",
        "overflow-hidden transition-all",
        "grid place-items-center grid-cols-[36px_1fr] grid-rows-1 gap-[6px]",
        className,
      )}
      onClick={onClick}
    >
      <Tooltip
        invert
        variant={active ? variant : Variant.Default}
        controlledState={menuOpen ? [false, () => {}] : undefined}
        content={altText ?? children}
        side={desktop ? "right" : "top"}
      >
        <Wrapper {...wrapperProps}>{icon}</Wrapper>
      </Tooltip>
      <span
        className={clsx(
          "responsive",
          desktop && "group-data-expanded/menu:opacity-100",
          "opacity-0 text-left w-[150px]",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          textClassName,
        )}
      >
        {children}
      </span>
    </button>
  );
}

export const MenuBarButton = forwardRef(InnerMenuBarButton);

export const LayoutNew = memo(InnerLayoutNew);

export function PanelContent({ region }: { region: PaneRegion }) {
  const panes = usePanes();
  const desktop = useDesktopState();
  const { completePanesClose, togglePaneRegion } = useLayoutActions();

  return (
    <AnimatePresence mode="wait" onExitComplete={completePanesClose}>
      {panes.map((pane) => {
        if (pane.region === region && !pane.shouldClose) {
          const variants = getVariants(
            !desktop ? PaneRegion.Footer : region,
            pane?.size === "full",
          );
          return (
            <motion.div
              layout
              key={pane.id}
              initial={variants[0]}
              animate={variants[1]}
              exit={variants[0]}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className={clsx(
                "relative w-full overflow-clip",
                "responsive card-transparent h-full",
              )}
            >
              {pane.region === PaneRegion.Right && (
                <HeaderButton
                  className={clsx("absolute top-1 right-1")}
                  variant={Variant.Default}
                  size={Size.Md}
                  label="Toggle Menu"
                  icon={
                    <IconChevronRightPipe
                      className={clsx(
                        "transition-transform w-3/5 h-3/5 ease-in-out duration-100",
                        !pane.shouldClose ? "rotate-360" : "rotate-180",
                      )}
                    />
                  }
                  onClick={() => togglePaneRegion(PaneRegion.Right, pane.id)}
                />
              )}
              {pane.content}
            </motion.div>
          );
        } else return null;
      })}
    </AnimatePresence>
  );
}

function getVariants(
  region: PaneRegion,
  full: boolean,
): [TargetAndTransition, TargetAndTransition] {
  if (full) {
    return [
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1 },
    ];
  }
  switch (region) {
    case PaneRegion.Left:
      return [
        { opacity: 0, translateX: -50 },
        { opacity: 1, translateX: 0 },
      ];
    case PaneRegion.Right:
      return [
        { opacity: 0, translateX: 50 },
        { opacity: 1, translateX: 0 },
      ];
    case PaneRegion.Footer:
      return [
        { opacity: 0, translateY: 50 },
        { opacity: 1, translateY: 0 },
      ];
  }
}
