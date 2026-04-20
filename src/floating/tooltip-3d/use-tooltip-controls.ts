import { useCallback } from "react";
import { useTooltipStore, type ScreenPosition } from "./store";

export interface ShowTooltipOptions {
  screenPosition?: ScreenPosition;
  triggerId?: string;
}

export interface UseTooltipControlsResult {
  showTooltip: (anchorId: string, options?: ShowTooltipOptions) => void;
  hideTooltip: (anchorId: string) => void;
  dismissOverlay: (anchorId: string) => void;
  hideAll: () => void;
  isVisible: (anchorId: string) => boolean;
  clearManualPosition: (anchorId: string) => void;
}

/**
 * Hook that provides imperative control over tooltips.
 * Useful for programmatically showing/hiding tooltips without direct user interaction.
 *
 * @returns Object with tooltip control functions
 */
export function useTooltipControls(): UseTooltipControlsResult {
  const store = useTooltipStore();

  const showTooltip = useCallback(
    (anchorId: string, options?: ShowTooltipOptions) => {
      const triggerId = options?.triggerId || "imperative";

      if (options?.screenPosition) {
        // Update anchor with manual position
        const anchor = store.anchors.get(anchorId);
        if (anchor) {
          // Create a new anchor config with the screen position
          store.registerAnchor({
            ...anchor,
            screenPosition: options.screenPosition,
          });
        }
      }

      store.showTooltip(anchorId, triggerId);
    },
    [store],
  );

  const hideTooltip = useCallback(
    (anchorId: string) => {
      // Hide from imperative trigger
      store.hideTooltip(anchorId, "imperative");

      // Clear manual screen position override when hiding
      const anchor = store.anchors.get(anchorId);
      if (anchor?.screenPosition) {
        store.registerAnchor({
          ...anchor,
          screenPosition: undefined,
        });
      }
    },
    [store],
  );

  const dismissOverlayFn = useCallback(
    (anchorId: string) => {
      store.dismissOverlay(anchorId);
    },
    [store],
  );

  const hideAll = useCallback(() => {
    store.hideAll();
  }, [store]);

  const isVisible = useCallback(
    (anchorId: string) => {
      return store.isTooltipVisible(anchorId);
    },
    [store],
  );

  const clearManualPosition = useCallback(
    (anchorId: string) => {
      const anchor = store.anchors.get(anchorId);
      if (anchor) {
        store.registerAnchor({
          ...anchor,
          screenPosition: undefined,
        });
      }
    },
    [store],
  );

  return {
    showTooltip,
    hideTooltip,
    dismissOverlay: dismissOverlayFn,
    hideAll,
    isVisible,
    clearManualPosition,
  };
}
