import { type ReactNode, useRef, useEffect } from "react";
import { TooltipPortal } from "./tooltip-portal";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find the canvas element within the container
    const canvas = containerRef.current.querySelector("canvas");
    if (canvas) {
      canvasRef.current = canvas;
    }
  }, []);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
      <TooltipPortal />
    </div>
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
