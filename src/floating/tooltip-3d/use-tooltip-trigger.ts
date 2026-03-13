import { useId, useCallback, useEffect, useRef } from "react";
import { useTooltipStore } from "./store";

export interface UseTooltipTriggerOptions {
  /** Delay in milliseconds before showing the tooltip. Defaults to 16ms (one frame). */
  showDelay?: number;
}

export interface UseTooltipTriggerResult {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

/**
 * Hook to control tooltip visibility from any component.
 * Multiple triggers can control the same tooltip anchor.
 *
 * The `showDelay` option is particularly useful for preventing tooltip spam during
 * rapid mouse movements across multiple interactive elements.
 *
 * @param anchorId - The ID of the tooltip anchor to control
 * @param options - Configuration options for the trigger
 * @returns Object with show, hide, and toggle functions
 *
 * @example
 * ```tsx
 * // Basic usage with delay for hover interactions
 * const { ref, anchorId } = useTooltipAnchor({
 *   content: <ViolationPanel data={violationData} />
 * });
 * const { show, hide } = useTooltipTrigger(anchorId, { showDelay: 100 });
 *
 * <mesh
 *   ref={ref}
 *   onPointerOver={() => show()}
 *   onPointerOut={() => hide()}
 * >
 *   <boxGeometry />
 * </mesh>
 * ```
 *
 * @example
 * ```tsx
 * // Different delays for different interaction types
 * const quickTooltip = useTooltipTrigger(anchorId, { showDelay: 50 });  // Fast for buttons
 * const slowTooltip = useTooltipTrigger(anchorId, { showDelay: 300 });  // Slow for complex content
 * const immediateTooltip = useTooltipTrigger(anchorId, { showDelay: 0 }); // Immediate for focus
 * ```
 *
 * @example
 * ```tsx
 * // Programmatic control with delay
 * const { show, hide, toggle } = useTooltipTrigger(anchorId, { showDelay: 150 });
 *
 * useEffect(() => {
 *   if (shouldShowTooltip) {
 *     show(); // Will respect the 150ms delay
 *   } else {
 *     hide(); // Always immediate
 *   }
 * }, [shouldShowTooltip, show, hide]);
 * ```
 */
export function useTooltipTrigger(
  anchorId: string,
  options: UseTooltipTriggerOptions = {},
): UseTooltipTriggerResult {
  const triggerId = useId();
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const { showDelay = 16 } = options;

  const { showTooltip, hideTooltip, toggleTooltip } = useTooltipStore();

  // Clear any pending timeouts
  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimeouts();

    // Configurable delay to ensure position updates are processed and prevent tooltip spam
    showTimeoutRef.current = window.setTimeout(() => {
      showTooltip(anchorId, triggerId);
      showTimeoutRef.current = null;
    }, showDelay);
  }, [anchorId, triggerId, showTooltip, clearTimeouts, showDelay]);

  const hide = useCallback(() => {
    clearTimeouts();

    // Immediate hide for responsive feel
    hideTooltip(anchorId, triggerId);
  }, [anchorId, triggerId, hideTooltip, clearTimeouts]);

  const toggle = useCallback(() => {
    toggleTooltip(anchorId, triggerId);
  }, [anchorId, triggerId, toggleTooltip]);

  // Clean up on unmount - hide tooltip if this trigger was showing it
  useEffect(() => {
    return () => {
      clearTimeouts();
      hideTooltip(anchorId, triggerId);
    };
  }, [anchorId, triggerId, hideTooltip, clearTimeouts]);

  return { show, hide, toggle };
}
