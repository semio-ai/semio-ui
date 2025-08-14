import { type ReactNode, useRef, useEffect } from "react";
import { TooltipPortal } from "./tooltip-portal";
import {
  TooltipHostContext,
  type TooltipHostContextValue,
  useTooltipHost,
} from "./tooltip-context";

export interface TooltipHostProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component that wraps the Canvas to enable the tooltip system.
 * This component manages the tooltip portal and handles global events.
 *
 * @param children - Should be a Canvas component from @react-three/fiber
 * @param className - Optional CSS class for the wrapper
 * @param style - Optional inline styles for the wrapper
 */
export function TooltipHost({ children, className, style }: TooltipHostProps) {
  const parentContext = useTooltipHost();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameOffsetRef = useRef({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(
    () => {
      if (!containerRef.current) return;

      // Find the canvas element within the container
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) {
        canvasRef.current = canvas;
      }

      // Calculate frame offset for iframe positioning
      const updateFrameOffset = () => {
        if (!containerRef.current) return;

        const isInIframe = window !== window.top;
        let localOffset = { x: 0, y: 0 };

        if (isInIframe) {
          // In iframe: use container's position relative to viewport
          const rect = containerRef.current.getBoundingClientRect();
          localOffset = { x: rect.left, y: rect.top };
        }

        // Compose with parent offset if nested
        const parentOffset = parentContext?.frameOffset || { x: 0, y: 0 };
        frameOffsetRef.current = {
          x: parentOffset.x + localOffset.x,
          y: parentOffset.y + localOffset.y,
        };
      };

      // Update offset on mount and resize
      updateFrameOffset();
      window.addEventListener("resize", updateFrameOffset);
      const id = timeoutRef.current;

      return () => {
        window.removeEventListener("resize", updateFrameOffset);
        if (id) {
          clearTimeout(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally omit dependencies to run only on mount
    [],
  );

  const contextValue: TooltipHostContextValue = {
    containerRef,
    frameOffset: frameOffsetRef.current,
    parentContext,
    level: (parentContext?.level ?? -1) + 1,
  };

  return (
    <TooltipHostContext.Provider value={contextValue}>
      <div ref={containerRef} className={className} style={style}>
        {children}
        <TooltipPortal />
      </div>
    </TooltipHostContext.Provider>
  );
}

/**
 * Higher-order component that wraps a Canvas component with TooltipHost.
 * Useful for adding tooltip support to existing Canvas components.
 *
 * @param CanvasComponent - The Canvas component to wrap
 * @returns Wrapped Canvas component with tooltip support
 */
export function withTooltipHost<P extends object>(
  CanvasComponent: React.ComponentType<P>,
): React.ComponentType<
  P & { tooltipHostClassName?: string; tooltipHostStyle?: React.CSSProperties }
> {
  return function WrappedCanvas({
    tooltipHostClassName,
    tooltipHostStyle,
    ...props
  }: P & { tooltipHostClassName?: string; tooltipHostStyle?: React.CSSProperties }) {
    return (
      <TooltipHost className={tooltipHostClassName} style={tooltipHostStyle}>
        <CanvasComponent {...(props as P)} />
      </TooltipHost>
    );
  };
}
