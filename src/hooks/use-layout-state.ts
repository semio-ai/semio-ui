import { useEffect } from "react";
import { useAtom } from "jotai";
import {
  desktopAtom,
  useMenuState,
  useLeftWidth,
  useRightWidth,
  useContentWidth,
  useLeftRegionActive,
  useRightRegionActive,
  useFooterRegionActive,
} from "./layout-atoms";

export interface LayoutState {
  desktop: boolean;
  menuExpanded: boolean;
  leftWidth: string;
  rightWidth: string;
  contentWidth: string;
  leftRegionActive: boolean;
  rightRegionActive: boolean;
  footerRegionActive: boolean;
}

export function useLayoutState(): LayoutState {
  const desktopMatcher = window.matchMedia("((width >= 48rem) and (height >= 48rem))");
  const menuExpanded = useMenuState();
  const leftWidth = useLeftWidth();
  const rightWidth = useRightWidth();
  const contentWidth = useContentWidth();

  const leftRegionActive = useLeftRegionActive();
  const rightRegionActive = useRightRegionActive();
  const footerRegionActive = useFooterRegionActive();

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
    leftWidth,
    rightWidth,
    contentWidth,
    leftRegionActive,
    rightRegionActive,
    footerRegionActive,
  };
}
