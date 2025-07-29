import { useCallback, useRef, useEffect, useMemo } from "react";
import { useMotionValue, animate, type MotionValue } from "motion/react";

export interface RubberScrollBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface RubberScrollConfig {
  maxPull?: number; // Maximum rubber-band distance (default: 100)
  softening?: number; // Rubber-band softening factor (default: 30)
  springStiffness?: number; // Snap-back spring stiffness (default: 300)
  springDamping?: number; // Snap-back spring damping (default: 30)
  orientation?: "vertical" | "horizontal" | "both";
}

export interface RubberScrollSync {
  motionX: MotionValue<number>;
  motionY: MotionValue<number>;
  bounds: RubberScrollBounds;
  setBounds: (bounds: Partial<RubberScrollBounds>) => void;
  handleDrag: (info: { x: number; y: number }) => void;
  handleRelease: () => void;
  setNativeScroll: (x: number, y: number) => void;
  isOverscrolling: () => boolean;
}

const DEFAULT_CONFIG: Required<RubberScrollConfig> = {
  maxPull: 100,
  softening: 30,
  springStiffness: 300,
  springDamping: 30,
  orientation: "both",
};

/**
 * Custom hook for synchronized rubber-band scrolling using Framer Motion.
 * Provides consistent overscroll behavior across multiple ScrollArea components.
 */
export function useRubberScrollSync(config: RubberScrollConfig = {}): RubberScrollSync {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  // Motion values for x and y transforms
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  // Scroll bounds and native scroll position tracking
  const boundsRef = useRef<RubberScrollBounds>({ top: 0, bottom: 0, left: 0, right: 0 });
  const nativeScrollRef = useRef({ x: 0, y: 0 });
  const isOverscrollingRef = useRef(false);

  // Animation controls for snap-back
  const animationControlsRef = useRef<{ stop: () => void } | null>(null);

  // Set scroll bounds for rubber-band calculations
  const setBounds = useCallback((newBounds: Partial<RubberScrollBounds>) => {
    boundsRef.current = { ...boundsRef.current, ...newBounds };
  }, []);

  // Handle drag movement with rubber-band effect
  const handleDrag = useCallback(
    (info: { x: number; y: number }) => {
      const bounds = boundsRef.current;
      const { maxPull, softening, orientation } = finalConfig;

      let newX = nativeScrollRef.current.x;
      let newY = nativeScrollRef.current.y;

      // Apply rubber-band effect for vertical scrolling
      if (orientation === "vertical" || orientation === "both") {
        if (info.y < bounds.top) {
          // Overscroll at top
          const overshoot = bounds.top - info.y;
          newY =
            bounds.top -
            Math.sign(overshoot) * maxPull * (1 - Math.exp(-Math.abs(overshoot) / softening));
          isOverscrollingRef.current = true;
        } else if (info.y > bounds.bottom) {
          // Overscroll at bottom
          const overshoot = info.y - bounds.bottom;
          newY =
            bounds.bottom +
            Math.sign(overshoot) * maxPull * (1 - Math.exp(-Math.abs(overshoot) / softening));
          isOverscrollingRef.current = true;
        } else {
          newY = info.y;
          isOverscrollingRef.current = false;
        }
      }

      // Apply rubber-band effect for horizontal scrolling
      if (orientation === "horizontal" || orientation === "both") {
        if (info.x < bounds.left) {
          // Overscroll at left
          const overshoot = bounds.left - info.x;
          newX =
            bounds.left -
            Math.sign(overshoot) * maxPull * (1 - Math.exp(-Math.abs(overshoot) / softening));
          isOverscrollingRef.current = true;
        } else if (info.x > bounds.right) {
          // Overscroll at right
          const overshoot = info.x - bounds.right;
          newX =
            bounds.right +
            Math.sign(overshoot) * maxPull * (1 - Math.exp(-Math.abs(overshoot) / softening));
          isOverscrollingRef.current = true;
        } else {
          newX = info.x;
          isOverscrollingRef.current = false;
        }
      }

      // Update motion values
      motionX.set(newX);
      motionY.set(newY);
    },
    [finalConfig, motionX, motionY],
  );

  // Handle drag release with snap-back animation
  const handleRelease = useCallback(() => {
    const { springStiffness, springDamping, orientation } = finalConfig;
    const bounds = boundsRef.current;
    const nativeScroll = nativeScrollRef.current;

    // Stop any existing animations
    if (animationControlsRef.current) {
      animationControlsRef.current.stop();
    }

    // Animate back to bounds if overscrolling
    const animations: Promise<void>[] = [];

    if (orientation === "vertical" || orientation === "both") {
      const currentY = motionY.get();
      let targetY = currentY;

      if (currentY < bounds.top) {
        targetY = Math.max(bounds.top, nativeScroll.y);
      } else if (currentY > bounds.bottom) {
        targetY = Math.min(bounds.bottom, nativeScroll.y);
      }

      if (targetY !== currentY) {
        animations.push(
          animate(motionY, targetY, {
            type: "spring",
            stiffness: springStiffness,
            damping: springDamping,
          }).then(() => {}),
        );
      }
    }

    if (orientation === "horizontal" || orientation === "both") {
      const currentX = motionX.get();
      let targetX = currentX;

      if (currentX < bounds.left) {
        targetX = Math.max(bounds.left, nativeScroll.x);
      } else if (currentX > bounds.right) {
        targetX = Math.min(bounds.right, nativeScroll.x);
      }

      if (targetX !== currentX) {
        animations.push(
          animate(motionX, targetX, {
            type: "spring",
            stiffness: springStiffness,
            damping: springDamping,
          }).then(() => {}),
        );
      }
    }

    // Track animation for cleanup
    if (animations.length > 0) {
      void Promise.all(animations).then(() => {
        isOverscrollingRef.current = false;
        animationControlsRef.current = null;
      });
    } else {
      isOverscrollingRef.current = false;
    }
  }, [finalConfig, motionX, motionY]);

  // Set native scroll position (for controlled updates)
  const setNativeScroll = useCallback(
    (x: number, y: number) => {
      nativeScrollRef.current = { x, y };

      // Update motion values to match if not overscrolling
      if (!isOverscrollingRef.current) {
        motionX.set(x);
        motionY.set(y);
      }
    },
    [motionX, motionY],
  );

  // Check if currently overscrolling
  const isOverscrolling = useCallback(() => {
    return isOverscrollingRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationControlsRef.current) {
        animationControlsRef.current.stop();
      }
    };
  }, []);

  return {
    motionX,
    motionY,
    bounds: boundsRef.current,
    setBounds,
    handleDrag,
    handleRelease,
    setNativeScroll,
    isOverscrolling,
  };
}
