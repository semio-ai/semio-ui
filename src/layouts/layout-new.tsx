import type {
  MutableRefObject,
  ReactNode,
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
} from "react";
import { isValidElement, memo, useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence, TargetAndTransition } from "motion/react";
import { useGesture } from "@use-gesture/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { observe } from "jotai-effect";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronRightPipe,
  IconDashboard,
  IconDeviceFloppy,
  IconShoppingBag,
  IconSquare,
} from "@tabler/icons-react";
import useMeasure, { RectReadOnly } from "react-use-measure";
import { Button } from "../buttons/button";
import { IconHome } from "../icons/home";
import { Select } from "../floating/select";
import { Size, Variant } from "../types";
import { Status } from "../status";
import { Tooltip } from "../floating/tooltip";
import { Search } from "../inputs/search";
import { ToggleGroup } from "../inputs/toggle-group";
import { Avatar } from "../avatar";
import { IconProject } from "../icons/project";

export type MenuItemClickFn = (id: string, event: MouseEvent) => Promise<void> | void;

export enum PaneRegion {
  Footer = "footer",
  Left = "left",
  Right = "Right",
}

export interface PaneSpec {
  id: string;
  name: string;
  icon: ReactNode;
  size: string | number;
  clickFn?: MenuItemClickFn;
  content: ReactNode;
  inLeftMenu: boolean;
  inRightMenu: boolean;
  disabled?: boolean;
  region?: PaneRegion;
  shouldClose?: boolean;
}

export interface LayoutNewProps {
  className?: string;
  children?: ReactNode | ((contentBounds: RectReadOnly) => ReactNode);
  homeIcon?: ReactNode;
  homeText?: string;
  homeClassName?: string;
}

function TestPane() {
  const footerRegionActive = useAtomValue(footerRegionActiveAtom);
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

function TestToggleGroup() {
  const [value, setValue] = useState<"mode 1" | "mode 2" | "mode 3">("mode 1");

  return (
    <div className="flex flex-row items-center gap-2 pr-1">
      <ToggleGroup
        bg={false}
        size={Size.Md}
        visuals="icons"
        value={value}
        onChange={(v) => setValue(v as "mode 1" | "mode 2" | "mode 3")}
        options={[
          {
            label: "Studio",
            value: "mode 1",
            icon: <IconProject className="w-3/5 h-3/5" />,
            // variant: Variant.Primary,
          },
          {
            label: "Dashboard",
            value: "mode 2",
            icon: <IconDashboard className="w-3/5 h-3/5" />,
            // variant: Variant.Secondary,
          },
          {
            label: "Marketplace",
            value: "mode 3",
            icon: <IconShoppingBag className="w-3/5 h-3/5" />,
            // variant: Variant.Tertiary,
          },
        ]}
        className="backdrop-blur-lg dark:bg-layout-dark-inset/40 bg-layout-light-inset/40"
      />
      <Avatar
        src="https://avatars.githubusercontent.com/u/5341396?v=4&size=64"
        alt="Andy"
        size={Size.Md}
        status={{
          variant: Variant.Success,
          placement: "bottom-right",
        }}
      />
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

  const { contentWidth, leftWidth, rightWidth, leftMenuItems, rightMenuItems, menuExpanded } =
    useLayoutState();

  const desktop = useAtomValue(desktopAtom);
  const leftRegionActive = useAtomValue(leftRegionActiveAtom);
  const rightRegionActive = useAtomValue(rightRegionActiveAtom);
  const footerRegionActive = useAtomValue(footerRegionActiveAtom);
  const toolbarItems = useAtomValue(toolbarItemsAtom);

  const { setPanes, toggleMenu, togglePaneRegion, setToolbarItems } = useLayoutActions();

  const activeLeftPaneId = useAtomValue(activeLeftPaneAtom);
  const activeRightPaneId = useAtomValue(activeRightPaneAtom);

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
          <div className="pl-1">
            <Search placeholder="Search..." size={Size.Md} bg className="backdrop-blur-lg" />
          </div>
        ),
        desktopSizing: "fit",
      },
      {
        id: "studio-actions",
        type: "toolbar-widget",
        component: (
          <div className="flex flex-row gap-1 px-1 z-0">
            <Button
              invert
              size={Size.Md}
              leftIcon={<IconArrowBackUp className="w-3/5 h-3/5" />}
              className="backdrop-blur-lg"
              // variant={Variant.Info}
            />
            <Button
              invert
              disabled
              size={Size.Md}
              leftIcon={<IconArrowForwardUp className="w-3/5 h-3/5" />}
              className="backdrop-blur-lg"
            />
            <Button
              invert
              size={Size.Md}
              leftIcon={<IconDeviceFloppy className="w-3/5 h-3/5" />}
              className="backdrop-blur-lg"
            />
          </div>
        ),
        desktopSizing: "fit",
      },
      {
        id: "spacer-1",
        type: "toolbar-spacer",
        desktopSizing: "flex",
      },
      {
        id: "nav",
        type: "toolbar-widget",
        component: <TestToggleGroup />,
        desktopSizing: "fit",
      },
    ]);
  }, [setPanes, setToolbarItems]);

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
        "relative top-0 left-0 h-dvh w-dvw flex select-none",
        "bg-layout-light-base dark:bg-layout-dark-base",
        "app-layout",
        className,
      )}
    >
      {children && (
        <div className="absolute top-0 left-0 bottom-0 right-0 z-0">
          {isValidElement(children) && children}
          {!isValidElement(children) && typeof children === "function" && children(contentBounds)}
        </div>
      )}
      {/* Menu (thin left bar)*/}
      <div
        data-ui={menuExpanded ? "expanded" : ""}
        className={clsx("grid-area-menu h-full w-full", "group/menu")}
      >
        <div
          className={clsx(
            "responsive card-transparent h-full flex items-center",
            "flex-row justify-center desktop:justify-start w-full desktop:transition-[width]",
            "desktop:w-10 desktop:group-data-expanded/menu:w-48 desktop:flex-col desktop:justify-start",
          )}
        >
          {desktop && (
            <MenuBarButton
              key="menu-home-toggle"
              onClick={() => {
                toggleMenu();
              }}
              icon={homeIcon ?? <IconHome />}
              className="font-bold"
              textClassName={homeClassName}
            >
              {homeText ?? "Home"}
            </MenuBarButton>
          )}
          {leftMenuItems.map((leftMenuItem) => (
            <MenuBarButton
              key={leftMenuItem.id}
              onClick={(e) => {
                const callFn = async (event: MouseEvent) => {
                  await leftMenuItem.clickFn?.(leftMenuItem.id, event);
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
        </div>
      </div>

      {/* Header */}
      <div className="grid-area-header w-full h-full">
        <div className={clsx("h-10 flex items-center gap-1", "flex-row justify-start")}>
          <button
            type="button"
            role="tab"
            className={clsx("grid desktop:hidden w-10 h-10 place-items-center")}
            onClick={() => {
              toggleMenu();
            }}
          >
            {homeIcon ?? <IconHome />}
          </button>
          <p
            className={clsx(
              "desktop:hidden responsive default font-bold variant-static-text",
              homeClassName,
            )}
          >
            {homeText ?? "Home"}
          </p>
          {desktop && (
            <>
              {toolbarItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      "h-10 flex items-center",
                      item.type === "toolbar-widget" ? "responsive" : "pointer-events-none",
                      item.desktopSizing === "flex" ? "flex flex-1" : "w-auto",
                    )}
                  >
                    {item.type === "toolbar-widget" && item.component}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Left Sidebar */}
      <div
        className={clsx(
          "grid-area-left w-full h-full overflow-clip transition-[width,height]",

          // footerRegionActive ? "pt-0.5 pb-0.5" : "pt-0.5 pb-0.5 desktop:pb-0",
        )}
      >
        <PanelContent region={PaneRegion.Left} />
      </div>

      {/* Right Sidebar */}
      <div className="grid-area-right w-full h-full min-h-10 min-w-10 hidden desktop:flex">
        <div
          data-ui={rightRegionActive ? "expanded" : ""}
          className={clsx(
            "responsive card-transparent group/right overflow-clip",
            "min-h-[40px] min-w-[40px]",
            "place-items-center grid",
            // "grid grid-rows-2 grid-columns-2",

            "h-[36px] data-expanded:h-auto grid-rows-[36px_0fr] data-expanded:grid-rows-[36px_auto]",
            "grid-cols-[0fr_36px] data-expanded:grid-cols-[1fr_36px]",
            // "grid-rows-[40px_0fr] data-expanded:h-auto data-expanded:grid-rows-[40px_auto]",
            // "min-h-10 min-w-10 h-auto transition-[height] place-items-center",
          )}
        >
          <div
            className={clsx(
              "p-1 w-0 h-0 group-data-expanded/right:h-[36px] group-data-expanded/right:flex hidden",
              "flex-row group-data-expanded/right:w-full grid align-middle justify-start",
              "bg-transparent group-data-expanded/right:bg-neutral-50/20 dark:group-data-expanded/right:bg-neutral-950/20",
            )}
          >
            {rightMenuItems.length === 1 && rightMenuItems[0]?.name}
            {rightMenuItems.length > 1 && (
              <Select
                size={Size.Sm}
                options={rightMenuItems.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                onChange={(value) => {
                  const selected = rightMenuItems.find((item) => item.id === value);
                  if (selected) {
                    togglePaneRegion(PaneRegion.Right, selected.id, true);
                  }
                }}
                value={rightMenuItems.find((item) => item.region === PaneRegion.Right)?.id}
              />
            )}
          </div>
          <div
            className={clsx(
              "h-[36px] w-[36px] grid place-items-center transition-colors",
              "bg-transparent group-data-expanded/right:bg-neutral-50/20 dark:group-data-expanded/right:bg-neutral-950/20",
            )}
          >
            <Button
              variant={Variant.Default}
              size={Size.Md}
              invert
              role="tab"
              leftIcon={
                <IconChevronRightPipe
                  className={clsx(
                    "transition-transform w-3/5 h-3/5 ease-in-out duration-100",
                    "rotate-180 group-data-expanded/right:rotate-360",
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

          <div className="col-span-2 h-0 group-data-expanded/right:h-full group-data-expanded/right:flex hidden">
            <PanelContent region={PaneRegion.Right} />
          </div>
        </div>
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

function MenuBarButton({
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
}: MenuBarButtonProps) {
  const menuOpen = useAtomValue(menuStateAtom);
  const desktop = useAtomValue(desktopAtom);
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
        ),
      };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={clsx(
        variant,
        "w-10 group/tab h-10 overflow-hidden",
        desktop && "group-data-expanded/menu:w-48",
        "overflow-hidden transition-all",
        "grid place-items-center grid-cols-[40px_1fr] grid-rows-1 gap-[6px]",
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

export interface ToolbarWidget {
  id: string;
  type: "toolbar-widget";
  component: ReactNode;
  mobile?: ReactNode;
  desktopSizing: "fit" | "flex";
}

export interface ToolbarSpacer {
  id: string;
  type: "toolbar-spacer";
  desktopSizing: "fit" | "flex";
}

export type ToolbarItem = ToolbarWidget | ToolbarSpacer;

export interface LayoutState {
  desktop: boolean;
  menuExpanded: boolean;
  panes: PaneSpec[];
  leftWidth: string;
  rightWidth: string;
  contentWidth: string;
  leftMenuItems: PaneSpec[];
  rightMenuItems: PaneSpec[];
}

export interface LayoutActions {
  setPane: (pane: PaneSpec | Partial<PaneSpec>) => void;
  setPanes: (panes: (PaneSpec | Partial<PaneSpec>)[]) => void;
  removePane: (id: string) => void;
  setToolbarItem: (
    item: Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" },
  ) => void;
  setToolbarItems: (
    items: (Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" })[],
  ) => void;
  removeToolbarItem: (id: string) => void;
  toggleMenu: () => void;
  togglePaneRegion: (pane: PaneRegion, id: string, preventSameClose?: boolean) => void;
  completePanesClose: () => void;
}

const menuStateAtom = atom<boolean>(false);
const panesAtom = atom<PaneSpec[]>([]);
const toolbarItemsAtom = atom<ToolbarItem[]>([]);
const desktopAtom = atom<boolean>(false);

const activeLeftPaneAtom = atom<string | undefined>((get) => {
  const panes = get(panesAtom);
  const active = panes.find((p) => p.region === PaneRegion.Left && !p.shouldClose);
  return active?.id;
});

const activeRightPaneAtom = atom<string | undefined>((get) => {
  const panes = get(panesAtom);
  const active = panes.find((p) => p.region === PaneRegion.Right && !p.shouldClose);
  return active?.id;
});

const leftRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Left) !== undefined;
});

const rightRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Right) !== undefined;
});

const footerRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Footer) !== undefined;
});

function formatSize(val: string | number): string {
  if (typeof val === "string") return val;
  return `${val.toString()}px`;
}

const leftWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const left = panes.filter((pane) => pane.region === PaneRegion.Left);
  if (left.length === 0) return "0fr";
  if (left.find((l) => l.size === "full")) return "1fr";
  if (left.length === 1) {
    return formatSize(left[0].size);
  }
  return `max(${left.map((l) => formatSize(l.size)).join(",")})`;
});

const rightWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const right = panes.filter((pane) => pane.region === PaneRegion.Right);
  if (right.length === 0) return "0fr";
  if (right.find((l) => l.size === "full")) return "1fr";
  if (right.length === 1) {
    return formatSize(right[0].size);
  }
  return `max(${right.map((l) => formatSize(l.size)).join(",")})`;
});

const contentWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const leftFull = panes.find((pane) => pane.region === PaneRegion.Left && pane.size === "full");
  const rightFull = panes.find((pane) => pane.region === PaneRegion.Right && pane.size === "full");
  if (leftFull || rightFull) return "0fr";
  return `1fr`;
});

const leftMenuItemsAtom = atom<PaneSpec[]>((get) => get(panesAtom).filter((p) => p.inLeftMenu));
const rightMenuItemsAtom = atom<PaneSpec[]>((get) => get(panesAtom).filter((p) => p.inRightMenu));

export function useLayoutActions(): LayoutActions {
  const menuExpandedRef = useRef<boolean>(false);
  const panesRef = useRef<PaneSpec[]>([]);
  const toolbarItemsRef = useRef<ToolbarItem[]>([]);
  const setMenuExpanded = useSetAtom(menuStateAtom);
  const setPanes = useSetAtom(panesAtom);
  const setToolbarItems = useSetAtom(toolbarItemsAtom);

  useEffect(() => {
    const expandedUnsub = observe((get) => {
      menuExpandedRef.current = get(menuStateAtom);
    });
    const panesUnsub = observe((get) => {
      panesRef.current = get(panesAtom);
    });
    const toolbarItemsUnsub = observe((get) => {
      toolbarItemsRef.current = get(toolbarItemsAtom);
    });
    return () => {
      expandedUnsub();
      panesUnsub();
      toolbarItemsUnsub();
    };
  });

  const setPane = useCallback(
    (pane: PaneSpec | Partial<PaneSpec>) => {
      const existingPane = panesRef.current.find((p) => p.id === pane.id);
      const newPanes = existingPane
        ? panesRef.current.map((p) => (p.id === pane.id ? { ...p, ...pane } : p))
        : [...panesRef.current, { ...createPane(), ...pane }];
      setPanes(newPanes);
    },
    [panesRef, setPanes],
  );

  const setPanesNice = useCallback(
    (panes: (PaneSpec | Partial<PaneSpec>)[]) => {
      panes.forEach(setPane);
    },
    [setPane],
  );

  const removePane = useCallback(
    (id: string) => {
      const newPanes = panesRef.current.filter((p) => p.id !== id);
      setPanes(newPanes);
    },
    [setPanes, panesRef],
  );

  const setToolbarItem = useCallback(
    (item: Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" }) => {
      const existingItem = toolbarItemsRef.current.find((i) => i.id === item.id);
      if (existingItem) {
        const newItems: ToolbarItem[] = toolbarItemsRef.current.map((i) =>
          i.id === item.id && item.type === i.type ? { ...i, ...item } : (i as ToolbarItem),
        ) as ToolbarItem[];
        setToolbarItems(newItems);
      } else if (item.type === "toolbar-spacer") {
        setToolbarItems([...toolbarItemsRef.current, { desktopSizing: "fit", ...item }]);
      } else if (item.type === "toolbar-widget") {
        setToolbarItems([
          ...toolbarItemsRef.current,
          { desktopSizing: "fit", component: "null", ...item },
        ]);
      }
    },
    [setToolbarItems, toolbarItemsRef],
  );

  const setToolbarItemsNice = useCallback(
    (
      items: (Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" })[],
    ) => {
      items.forEach(setToolbarItem);
    },
    [setToolbarItem],
  );

  const removeToolbarItem = useCallback(
    (id: string) => {
      const newItems = toolbarItemsRef.current.filter((i) => i.id !== id);
      setToolbarItems(newItems);
    },
    [setToolbarItems, toolbarItemsRef],
  );

  const completePanesClose = useCallback(() => {
    const newPanes = panesRef.current.map((p) =>
      p.shouldClose ? { ...p, shouldClose: undefined, region: undefined } : p,
    );
    setPanes(newPanes);
  }, [panesRef, setPanes]);

  const toggleMenu = useCallback(() => {
    setMenuExpanded(!menuExpandedRef.current);
  }, [setMenuExpanded, menuExpandedRef]);

  const togglePaneRegion = useCallback(
    (region: PaneRegion, id: string, preventSameClose = false) => {
      // First, find if the current pane id is currently in that region;
      const currentPaneInRegion = panesRef.current.find((p) => p.id === id && p.region === region);
      // Don't close the pane directly, but set the flag so that it knows it should close
      if (currentPaneInRegion && !preventSameClose) {
        const newPanes = panesRef.current.map((p) =>
          p.id === id ? { ...p, shouldClose: true } : p,
        );
        setPanes(newPanes);
      } else {
        const newPanes = panesRef.current.map((p) =>
          p.id === id
            ? { ...p, region }
            : { ...p, region: p.region === region ? undefined : p.region },
        );
        setPanes(newPanes);
      }
    },
    [panesRef, setPanes],
  );

  return {
    setPane,
    setPanes: setPanesNice,
    removePane,
    setToolbarItem,
    setToolbarItems: setToolbarItemsNice,
    removeToolbarItem,
    toggleMenu,
    togglePaneRegion,
    completePanesClose,
  };
}

export function useLayoutState(): LayoutState {
  const desktopMatcher = window.matchMedia("((width >= 48rem) and (height >= 48rem))");
  const menuExpanded = useAtomValue(menuStateAtom);
  const panes = useAtomValue(panesAtom);
  const leftWidth = useAtomValue(leftWidthAtom);
  const rightWidth = useAtomValue(rightWidthAtom);
  const contentWidth = useAtomValue(contentWidthAtom);
  const leftMenuItems = useAtomValue(leftMenuItemsAtom);
  const rightMenuItems = useAtomValue(rightMenuItemsAtom);
  const [desktop, setDesktop] = useAtom(desktopAtom);

  useEffect(() => {
    setDesktop(desktopMatcher.matches);
    const listener = (e: MediaQueryListEvent) => {
      console.log("desktop changed", e.matches);
      setDesktop(e.matches);
    };
    desktopMatcher.addEventListener("change", listener);
    return () => {
      desktopMatcher.removeEventListener("change", listener);
    };
  }, [desktopMatcher, setDesktop]);

  return {
    desktop,
    menuExpanded,
    panes,
    leftWidth,
    rightWidth,
    contentWidth,
    leftMenuItems,
    rightMenuItems,
  };
}

function createPane(): PaneSpec {
  return {
    id: crypto.randomUUID(),
    name: "New Pane",
    icon: <IconSquare />,
    size: "240px",
    content: <div className="w-full h-full bg-primary-500">New Pane Content</div>,
    inLeftMenu: true,
    inRightMenu: false,
  };
}

export const LayoutNew = memo(InnerLayoutNew);

export function PanelContent({ region }: { region: PaneRegion }) {
  const panes = useAtomValue(panesAtom);
  const desktop = useAtomValue(desktopAtom);
  const { completePanesClose } = useLayoutActions();

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
                "w-full overflow-clip",
                pane.region !== PaneRegion.Right && "responsive card-transparent h-full",
              )}
            >
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
        { opacity: 0, translateX: 50, height: 0 },
        { opacity: 1, translateX: 0, height: "auto" },
      ];
    case PaneRegion.Footer:
      return [
        { opacity: 0, translateY: 50 },
        { opacity: 1, translateY: 0 },
      ];
  }
}
