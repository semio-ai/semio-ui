import {
  useMenuState,
  useLeftWidth,
  useRightWidth,
  useContentWidth,
  useLeftRegionActive,
  useRightRegionActive,
  useFooterRegionActive,
  useLeftExpanded,
  useRightExpanded,
  useContentVisible,
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
  /** A left pane is spanning over the content area ({@link PaneSpec.expanded}). */
  leftExpanded: boolean;
  /** A right pane is spanning over the content area. */
  rightExpanded: boolean;
  /** Nothing is covering the content area — see `contentVisibleAtom`. */
  contentVisible: boolean;
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
  const leftExpanded = useLeftExpanded();
  const rightExpanded = useRightExpanded();
  const contentVisible = useContentVisible();

  return {
    desktop,
    menuExpanded,
    leftWidth,
    rightWidth,
    contentWidth,
    leftRegionActive,
    rightRegionActive,
    footerRegionActive,
    leftExpanded,
    rightExpanded,
    contentVisible,
  };
}
