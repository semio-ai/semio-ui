import type {
  MutableRefObject,
  ReactNode,
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
} from "react";
import { memo, useCallback, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence, TargetAndTransition } from "motion/react";
import { useGesture } from "@use-gesture/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { observe } from "jotai-effect";
import { IconChevronRightPipe, IconSquare } from "@tabler/icons-react";
import { Button } from "./buttons/button";
import { IconHome } from "./icons/home";
import { Select } from "./select";
import { Size, Variant } from "./types";
import { Status } from "./status";
import { Tooltip } from "./tooltip";
import { ToggleGroupProps } from "./toggle-group";

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
  children?: ReactNode;
  homeIcon?: ReactNode;
  homeText?: string;
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

/**
 * Renders the inner layout of the application.
 *
 * TODO: Update with resizeable panes and pop out windows.
 *
 * @param className - The class name applied to the root element.
 */
export function InnerLayoutNew({ className, homeIcon, homeText }: LayoutNewProps) {
  const root = useRef<HTMLDivElement>();

  const { contentWidth, leftWidth, rightWidth, leftMenuItems, rightMenuItems, menuExpanded } =
    useLayoutState();

  const desktop = useAtomValue(desktopAtom);
  const leftRegionActive = useAtomValue(leftRegionActiveAtom);
  const rightRegionActive = useAtomValue(rightRegionActiveAtom);
  const footerRegionActive = useAtomValue(footerRegionActiveAtom);

  const { setPanes, toggleMenu, togglePaneRegion } = useLayoutActions();

  const activeLeftPaneId = useAtomValue(activeLeftPaneAtom);

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
  }, [setPanes]);

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
        "bg-[url(https://imageplaceholder.net/400x600/eeeeee/ffffff?theme=Spring)] bg-cover bg-center",
        // "dark:bg-layout-dark-inset bg-layout-light-inset touch-none",
        "app-layout",
        className,
      )}
    >
      {/* Menu (thin left bar)*/}
      <div
        data-ui={menuExpanded ? "expanded" : ""}
        className={clsx(
          "grid-area-menu h-full w-full",
          "group/menu",
          // footerRegionActive ? "pb-0.5 desktop:pb-0" : "pb-1",
        )}
      >
        <div
          className={clsx(
            "card h-full flex items-center",
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
        <div className={clsx("card h-10 flex items-center", "flex-row justify-start")}>
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
          <p className="desktop:hidden">{homeText ?? "Home"}</p>
        </div>
      </div>

      {/* Left Sidebar */}
      <div
        className={clsx(
          "grid-area-left w-full h-full overflow-hidden",

          // footerRegionActive ? "pt-0.5 pb-0.5" : "pt-0.5 pb-0.5 desktop:pb-0",
        )}
      >
        <PanelContent region={PaneRegion.Left} />
      </div>

      {/* Right Sidebar */}
      <div className="grid-area-right w-full h-full hidden desktop:flex overflow-hidden">
        <div
          data-ui={rightRegionActive ? "expanded" : ""}
          className="card overflow-clip grid grid-cols-1 grid-rows-[40px_0fr] data-expanded:h-auto h-10 data-expanded:grid-rows-[40px_auto] transition-[height] group/right"
        >
          <div className="flex flex-row h-10 group-data-expanded/right:h-full justify-between items-center">
            <div className="hidden group-data-expanded/right:flex flex-row h-10 w-full items-center justify-center p-2">
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
                      togglePaneRegion(PaneRegion.Right, selected.id);
                    }
                  }}
                  value={rightMenuItems.find((item) => item.region === PaneRegion.Right)?.id}
                />
              )}
            </div>
            <button
              type="button"
              role="tab"
              className="w-10 h-10 grid place-items-center"
              disabled={
                rightMenuItems.length === 0 ||
                rightMenuItems.filter((item) => !item.disabled).length === 0
              }
              onClick={() => togglePaneRegion(PaneRegion.Right, rightMenuItems[0]?.id)}
            >
              <IconChevronRightPipe
                className={clsx(
                  "transition-transform",
                  "rotate-180 group-data-expanded/right:rotate-360",
                  // "-scale-x-100 group-data-expanded/right:scale-x-100",
                )}
              />
            </button>
          </div>
          <PanelContent region={PaneRegion.Right} />
        </div>
      </div>

      {/* Content */}
      <div className={clsx("grid-area-content w-full h-full overflow-hidden")}>
        <div
          className={clsx(
            "card h-full w-full bg-transparent backdrop-blur-none dark:bg-transparent",
            "outline-2 -outline-offset-2 outline-dashed outline-white",
          )}
        />
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
}: MenuBarButtonProps) {
  const menuOpen = useAtomValue(menuStateAtom);
  const desktop = useAtomValue(desktopAtom);
  const Wrapper = status ? Status : "div";
  const wrapperProps = status
    ? {
        variant: status.variant,
        placement: status.placement,
        text: status.text,
        className: clsx("variant-responsive-selectable-text", variant),
      }
    : {
        className: clsx("variant-responsive-selectable-text", variant),
      };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={clsx(
        variant,
        "w-10 group/tab h-10 text-neutral-500 overflow-hidden",
        desktop && "group-data-expanded/menu:w-48 group-data-expanded/menu:origin-[20px_50%] ",
        hoverable && "dark:hover:text-neutral-400 hover:text-neutral-600",
        hoverable && "hover:scale-105 scale-100",
        "origin-center overflow-hidden transition-all",
        "grid place-items-center grid-cols-[40px_1fr] grid-rows-1 gap-[6px]",
        "",
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
          desktop && "group-data-expanded/menu:opacity-100",
          "opacity-0 text-left w-[150px]",
          "variant-responsive-selectable-text",
          variant,
        )}
      >
        {children}
      </span>
    </button>
  );
}

export interface ActivePaneState {
  left?: string;
  right?: string;
  footer?: string;
}

export interface FieldToolbarItem {
  type: "field-toolbar";
  component: ReactNode;
}

export interface ToggleGroupItem extends ToggleGroupProps {
  type: "toggle-group";
}

export interface ButtonGroupItem {
  type: "button-group";
  component: ReactNode;
}

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
  toggleMenu: () => void;
  togglePaneRegion: (pane: PaneRegion, id: string) => void;
  completePanesClose: () => void;
}

const menuStateAtom = atom<boolean>(false);
const panesAtom = atom<PaneSpec[]>([]);
const desktopAtom = atom<boolean>(false);

const activeLeftPaneAtom = atom<string | undefined>((get) => {
  const panes = get(panesAtom);
  const active = panes.find((p) => p.region === PaneRegion.Left && !p.shouldClose);
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
  const setMenuExpanded = useSetAtom(menuStateAtom);
  const setPanes = useSetAtom(panesAtom);

  useEffect(() => {
    const expandedUnsub = observe((get) => {
      menuExpandedRef.current = get(menuStateAtom);
    });
    const panesUnsub = observe((get) => {
      panesRef.current = get(panesAtom);
    });
    return () => {
      expandedUnsub();
      panesUnsub();
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

const rootStyle = clsx(
  "relative top-0 left-0 h-dvh w-dvw flex select-none",
  // "dark:bg-layout-dark-base bg-layout-light-base touch-none",
  "grid desktop:app-layout-desktop",
);

const mainContainerStyle = clsx(
  "flex flex-col grow min-w-0 min-h-0 overflow-hidden",
  "divide-y divide-solid dark:divide-layout-dark-separator/50 divide-layout-light-separator/50",
);

const mainBodyStyle = clsx(
  "flex grow min-h-0 overflow-hidden",
  "dark:bg-layout-dark-inset bg-layout-light-inset",
);

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
              transition={{ duration: 0.15, ease: "anticipate" }}
              className={clsx(
                "w-full overflow-clip",
                pane.region !== PaneRegion.Right && "card h-full",
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
