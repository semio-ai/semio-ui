import { useId, useCallback, useEffect } from 'react';
import { useTooltipStore } from './store';

export interface UseTooltipTriggerResult {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

/**
 * Hook to control tooltip visibility from any component.
 * Multiple triggers can control the same tooltip anchor.
 *
 * @param anchorId - The ID of the tooltip anchor to control
 * @returns Object with show, hide, and toggle functions
 */
export function useTooltipTrigger(anchorId: string): UseTooltipTriggerResult {
  const triggerId = useId();

  const { showTooltip, hideTooltip, toggleTooltip } = useTooltipStore();

  const show = useCallback(() => {
    showTooltip(anchorId, triggerId);
  }, [anchorId, triggerId, showTooltip]);

  const hide = useCallback(() => {
    hideTooltip(anchorId, triggerId);
  }, [anchorId, triggerId, hideTooltip]);

  const toggle = useCallback(() => {
    toggleTooltip(anchorId, triggerId);
  }, [anchorId, triggerId, toggleTooltip]);

  // Clean up on unmount - hide tooltip if this trigger was showing it
  useEffect(() => {
    return () => {
      hideTooltip(anchorId, triggerId);
    };
  }, [anchorId, triggerId, hideTooltip]);

  return { show, hide, toggle };
}
