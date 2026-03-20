import { type RefObject, createContext, useContext } from "react";

export interface TooltipHostContextValue {
  containerRef: RefObject<HTMLDivElement | null>;
  frameOffset: { x: number; y: number };
  // Reference to parent context for nesting support
  parentContext?: TooltipHostContextValue | null;
  // Nesting level (0 = root, 1 = first nested, etc.)
  level: number;
}

export const TooltipHostContext = createContext<TooltipHostContextValue | null>(null);

/**
 * Hook to access the tooltip host context (for iframe positioning support).
 * Returns null if not within a TooltipHost.
 */
export function useTooltipHost() {
  return useContext(TooltipHostContext);
}

/**
 * Hook to get the root (outermost) tooltip host context.
 * This is useful for finding the best portal root for rendering tooltips.
 */
export function useRootTooltipHost(): TooltipHostContextValue | null {
  const context = useTooltipHost();

  if (!context) {
    return null;
  }

  // Traverse up to find the root context
  let current = context;
  while (current.parentContext) {
    current = current.parentContext;
  }

  return current;
}
