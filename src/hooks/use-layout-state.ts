import {
  useMenuState,
  useLeftWidth,
  useRightWidth,
  useContentWidth,
  useLeftRegionActive,
  useRightRegionActive,
  useFooterRegionActive,
} from "./layout-atoms";
import { useIsDesktop } from "./use-is-desktop";

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
  const desktop = useIsDesktop();
  const menuExpanded = useMenuState();
  const leftWidth = useLeftWidth();
  const rightWidth = useRightWidth();
  const contentWidth = useContentWidth();

  const leftRegionActive = useLeftRegionActive();
  const rightRegionActive = useRightRegionActive();
  const footerRegionActive = useFooterRegionActive();

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
