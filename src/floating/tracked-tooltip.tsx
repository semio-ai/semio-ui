import { clsx } from "clsx";
import { FloatingPortal } from "@floating-ui/react";
import {
  forwardRef,
  type ReactNode,
  type RefObject,
  type ForwardedRef,
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Variant } from "../types";

interface TrackedTooltipHookResult<T extends HTMLElement> {
  /** Styles to apply to the tooltip container (position, transform) */
  floatingStyles: CSSProperties;
  /** Refs to attach to the trigger and floating elements */
  elementRefs: {
    triggerRef: RefObject<T | null>;
    floatingRef: RefObject<HTMLDivElement | null>;
  };
  /** Context containing open state */
  context: { open: boolean };
  /** Call on pointer move/leave to update tooltip position and visibility */
  updateHoverState: (x: number | undefined, y: number | undefined, hovering: boolean) => void;
}

/**
 * Lightweight cursor-following tooltip hook.
 *
 * Replaces the previous floating-ui based implementation which caused infinite
 * re-render loops under React 19 due to setPositionReference triggering
 * cascading state updates. This version uses direct DOM manipulation for
 * position updates (no React state in the hot path) and only triggers
 * re-renders when hover state transitions (enter/leave).
 */
export function useTrackedTooltip<T extends HTMLElement = HTMLElement>(
  triggerRef: RefObject<T | null>,
  floatingRef: RefObject<HTMLDivElement | null>,
  side: "top" | "right" | "bottom" | "left",
  _axis: "x" | "y" | "both",
  sideOffset = 4,
): TrackedTooltipHookResult<T> {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });

  // Position the tooltip element at the last known cursor position.
  // Called both from updateHoverState (on move) and from the effect
  // below (when the tooltip mounts after open transitions to true).
  const applyPosition = useCallback(() => {
    const el = floatingRef.current;
    if (!el) return;
    const { left, top } = computePosition(
      posRef.current.x,
      posRef.current.y,
      el,
      side,
      sideOffset,
    );
    el.style.position = "fixed";
    el.style.left = `${String(left)}px`;
    el.style.top = `${String(top)}px`;
  }, [floatingRef, side, sideOffset]);

  // When the tooltip first mounts (open flips true), the floating element
  // wasn't available during the updateHoverState call that triggered it.
  // Apply the last known position once it becomes available.
  useEffect(() => {
    if (open) applyPosition();
  }, [open, applyPosition]);

  const updateHoverState = useCallback(
    (x: number | undefined, y: number | undefined, hovering: boolean) => {
      // Preserve previous coordinate when a value is undefined
      const current = posRef.current;
      posRef.current = {
        x: x !== undefined ? x : current.x,
        y: y !== undefined ? y : current.y,
      };

      // Update tooltip position directly via DOM to avoid re-renders
      if (hovering) applyPosition();

      // Only trigger re-render on hover state transitions
      if (openRef.current !== hovering) {
        openRef.current = hovering;
        setOpen(hovering);
      }
    },
    [applyPosition],
  );

  return {
    floatingStyles: { position: "fixed" as const, left: 0, top: 0 },
    elementRefs: {
      triggerRef,
      floatingRef,
    },
    context: { open },
    updateHoverState,
  };
}

/**
 * Compute tooltip position relative to cursor, clamped to viewport.
 */
function computePosition(
  cursorX: number,
  cursorY: number,
  tooltipEl: HTMLElement,
  side: "top" | "right" | "bottom" | "left",
  sideOffset: number,
): { left: number; top: number } {
  const rect = tooltipEl.getBoundingClientRect();
  const w = rect.width || 0;
  const h = rect.height || 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 5;

  let left: number;
  let top: number;

  switch (side) {
    case "right":
      left = cursorX + sideOffset;
      top = cursorY - h / 2;
      // Flip to left if overflowing right
      if (left + w > vw - pad) left = cursorX - sideOffset - w;
      break;
    case "left":
      left = cursorX - sideOffset - w;
      top = cursorY - h / 2;
      // Flip to right if overflowing left
      if (left < pad) left = cursorX + sideOffset;
      break;
    case "top":
      left = cursorX - w / 2;
      top = cursorY - sideOffset - h;
      // Flip to bottom if overflowing top
      if (top < pad) top = cursorY + sideOffset;
      break;
    case "bottom":
      left = cursorX - w / 2;
      top = cursorY + sideOffset;
      // Flip to top if overflowing bottom
      if (top + h > vh - pad) top = cursorY - sideOffset - h;
      break;
  }

  // Clamp to viewport
  left = Math.max(pad, Math.min(left, vw - w - pad));
  top = Math.max(pad, Math.min(top, vh - h - pad));

  return { left, top };
}

export interface TrackedTooltipProps {
  children: ReactNode;
  containerStyles: CSSProperties;
  variant?: Variant;
  open?: boolean;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

const TrackedTooltip = forwardRef(
  (
    {
      children,
      containerStyles,
      variant = Variant.Default,
      open = false,
      portalContainer,
    }: TrackedTooltipProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    if (!open) return null;

    return (
      <FloatingPortal root={portalContainer ?? undefined}>
        <div
          ref={ref}
          style={{
            ...containerStyles,
          }}
          className={clsx(
            "variant-scope overflow-clip",
            variant,
            "card-overlay inline-flex items-center select-none",
            "pointer-events-none",
            "variant-static-text",
          )}
        >
          {children}
        </div>
      </FloatingPortal>
    );
  },
);

TrackedTooltip.displayName = "TrackedTooltip";

export { TrackedTooltip };
