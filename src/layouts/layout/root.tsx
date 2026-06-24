import type { MutableRefObject, ReactNode, CSSProperties } from "react";
import { isValidElement, memo, useRef } from "react";
import { clsx } from "clsx";
import { useGesture } from "@use-gesture/react";
import useMeasure, { RectReadOnly } from "react-use-measure";
import { PaneRegion } from "../../types";
import type { IconValue } from "../../icons/registry";
import { useLayoutState } from "../../hooks/use-layout-state";
import { PanelContent } from "./panel-content";
import { Menu } from "./menu";
import { Header } from "./header";

export interface LayoutRootProps {
  className?: string;
  children?: ReactNode | ((contentBounds: RectReadOnly) => ReactNode);
  homeIcon?: IconValue;
  homeText?: string;
  homeClassName?: string;
}

/**
 * Renders the inner layout of the application.
 *
 * TODO: Update with resizeable panes and pop out windows.
 *
 * @param className - The class name applied to the root element.
 */
function InnerLayoutRoot({
  className,
  homeIcon,
  homeText,
  children,
  homeClassName,
}: LayoutRootProps) {
  const root = useRef<HTMLDivElement>(null);
  const [contentRef, contentBounds] = useMeasure();

  const {
    contentWidth,
    leftWidth,
    rightWidth,
    leftRegionActive,
    footerRegionActive,
    rightRegionActive,
  } = useLayoutState();

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
    // <Provider>
    <div
      style={
        {
          "--content-size": contentWidth,
          "--left-size": leftWidth,
          "--right-size": rightWidth,
          "--content-right-gap": rightRegionActive ? "var(--padding-width)" : "0px",
          "--content-left-gap":
            leftRegionActive && !leftWidth.includes("1fr") && !leftWidth.includes("0fr")
              ? "var(--padding-width)"
              : "0px",
          "--content-footer-gap": footerRegionActive ? "var(--padding-width)" : "0px",
        } as CSSProperties
      }
      ref={root as MutableRefObject<HTMLDivElement>}
      className={clsx(
        "relative top-0 right-0 left-0 flex h-dvh select-none",
        "bg-layout-light-base dark:bg-layout-dark-base",
        "app-layout",
        className,
      )}
    >
      {/* The backdrop/background element is a child of the layout component */}
      {children && (
        <div className="absolute top-0 right-0 bottom-0 left-0">
          {isValidElement(children) && children}
          {!isValidElement(children) && typeof children === "function" && children(contentBounds)}
        </div>
      )}

      {/* Menu (thin left bar)*/}
      <Menu homeIcon={homeIcon} homeText={homeText} homeClassName={homeClassName} />

      {/* Header */}
      <Header homeIcon={homeIcon} />

      {/* Left Sidebar */}
      <div className={clsx("grid-area-left h-full w-full transition-[width,height]")}>
        <PanelContent region={PaneRegion.Left} />
      </div>

      {/* Right Sidebar */}
      <div className={clsx("grid-area-right h-full w-full transition-[width,height]")}>
        <PanelContent region={PaneRegion.Right} />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={clsx("grid-area-content -z-1 h-full w-full overflow-hidden")}
      >
        <div className={clsx("pointer-events-none h-full w-full bg-transparent")} />
      </div>

      {/* Footer */}
      <div className={clsx("grid-area-footer h-full w-full")}>
        <PanelContent region={PaneRegion.Footer} />
      </div>
    </div>
    // </Provider>
  );
}

export const LayoutRoot = memo(InnerLayoutRoot);
