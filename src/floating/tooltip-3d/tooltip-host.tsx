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
  const frameOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Calculate frame offset only for iframe positioning
    const updateFrameOffset = () => {
      if (!containerRef.current) return;

      const isInIframe = window !== window.top;

      if (isInIframe) {
        // In iframe: get container's position relative to parent window
        const rect = containerRef.current.getBoundingClientRect();
        const parentOffset = parentContext?.frameOffset || { x: 0, y: 0 };
        frameOffsetRef.current = {
          x: parentOffset.x + rect.left,
          y: parentOffset.y + rect.top,
        };
      } else {
        // Not in iframe: no frame offset needed (coordinates are already window-relative)
        frameOffsetRef.current = parentContext?.frameOffset || { x: 0, y: 0 };
      }
    };

    // Update offset on mount and when window resizes
    updateFrameOffset();
    window.addEventListener("resize", updateFrameOffset);

    return () => {
      window.removeEventListener("resize", updateFrameOffset);
    };
  }, [parentContext?.frameOffset]);

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
