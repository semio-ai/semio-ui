import { useMemo, useRef } from "react";
import { FloatingPortal, offset, flip, shift, useFloating } from "@floating-ui/react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";
import { Variant } from "../../types";
import {
  useTooltipStore,
  type AnchorConfig,
  type ScreenPosition,
  type TooltipStore,
} from "./store";
import { useRootTooltipHost } from "./tooltip-context";

interface TooltipInstanceProps {
  anchor: AnchorConfig;
  position: ScreenPosition;
}

/**
 * Individual tooltip instance that handles its own positioning and rendering.
 */
function TooltipInstance({ anchor, position }: TooltipInstanceProps) {
  // Use root context for positioning to ensure consistent viewport-relative coordinates
  // Since the portal is rendered at root, we need root-relative coordinates
  const hostContext = useRootTooltipHost();

  // Create virtual element for floating-ui with viewport-relative positioning
  const virtualElement = useMemo(() => {
    // Additional validation to ensure position is still valid
    if (
      !position ||
      typeof position.x !== "number" ||
      typeof position.y !== "number" ||
      isNaN(position.x) ||
      isNaN(position.y) ||
      !isFinite(position.x) ||
      !isFinite(position.y)
    ) {
      // Return a fallback virtual element at origin
      return {
        getBoundingClientRect: () => ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          toJSON: () => ({}),
        }),
      };
    }

    const width = position.width || 0;
    const height = position.height || 0;

    // Convert container-relative coordinates to viewport-relative coordinates
    // This is required because floating-ui expects viewport-relative coordinates
    const container = hostContext?.containerRef.current;
    const containerRect = container?.getBoundingClientRect();

    if (!containerRect) {
      // Fallback if container not available
      return {
        getBoundingClientRect: () => ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          toJSON: () => ({}),
        }),
      };
    }

    // Convert to viewport coordinates by adding container's viewport position
    const viewportX = position.x + containerRect.left;
    const viewportY = position.y + containerRect.top;

    // Apply frame offset for iframe scenarios
    const frameOffset = hostContext?.frameOffset || { x: 0, y: 0 };
    const isInIframe = window !== window.top;

    const adjustedX = isInIframe ? viewportX + frameOffset.x : viewportX;
    const adjustedY = isInIframe ? viewportY + frameOffset.y : viewportY;

    // Center the bounding rect around the position
    const left = adjustedX - width / 2;
    const top = adjustedY - height / 2;

    // Create virtual element for floating-ui
    const virtualEl = {
      getBoundingClientRect: () => {
        const rect = {
          x: left,
          y: top,
          top,
          left,
          bottom: top + height,
          right: left + width,
          width,
          height,
          toJSON: () => ({}),
        };
        return rect;
      },
    };

    return virtualEl;
  }, [position, hostContext?.frameOffset, hostContext?.containerRef]);

  // Use floating-ui for positioning with container-relative strategy
  // Use floating-ui for positioning with viewport-relative strategy
  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: anchor.positioning?.side || "top",
    middleware: [
      offset(anchor.positioning?.offset || 6),
      flip({ padding: 5 }),
      shift({ padding: 5 }),
    ],
  });

  // Set the virtual element as the reference immediately after floating setup
  refs.setReference(virtualElement);

  // Render content
  const content = typeof anchor.content === "function" ? anchor.content() : anchor.content;

  return (
    <div ref={refs.setFloating} style={floatingStyles} className="z-50">
      <motion.div
        className={clsx(
          "responsive overflow-clip",
          Variant.Default,
          "card inline-flex items-center select-none",
          "pointer-events-none",
          "variant-static-text",
          "shadow-lg",
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "tween", duration: 0.1, ease: "easeInOut" }}
      >
        {content}
      </motion.div>
    </div>
  );
}

/**
 * Portal component that renders all visible tooltips.
 * This component should be placed at the root level of your application,
 * typically near the Canvas component.
 */
export function TooltipPortal() {
  // Cache to maintain reference stability and prevent infinite loops
  const cacheRef = useRef<Map<string, { anchor: AnchorConfig; position: ScreenPosition }>>(
    new Map(),
  );

  // Get root host context for portal placement
  // This ensures the portal is always rendered at the root level
  const hostContext = useRootTooltipHost();

  const visibleTooltips = useTooltipStore(
    useShallow((state: TooltipStore) => {
      const currentVisible: { anchor: AnchorConfig; position: ScreenPosition }[] = [];
      const newCache = new Map<string, { anchor: AnchorConfig; position: ScreenPosition }>();

      state.visibility.forEach((vis, anchorId) => {
        if (vis.visible) {
          const anchor = state.anchors.get(anchorId);
          const position = state.getEffectivePosition(anchorId);

          // Enhanced position validation
          const isValidPosition =
            position &&
            typeof position.x === "number" &&
            typeof position.y === "number" &&
            !isNaN(position.x) &&
            !isNaN(position.y) &&
            isFinite(position.x) &&
            isFinite(position.y);

          if (anchor && isValidPosition && (!anchor.isAvailable || anchor.isAvailable())) {
            // Check if we can reuse cached object to maintain reference stability
            const cached = cacheRef.current.get(anchorId);
            if (
              cached &&
              cached.anchor === anchor &&
              cached.position.x === position.x &&
              cached.position.y === position.y
            ) {
              // Reuse existing object reference
              newCache.set(anchorId, cached);
              currentVisible.push(cached);
            } else {
              // Create new object only when data actually changed
              const newItem = { anchor, position };
              newCache.set(anchorId, newItem);
              currentVisible.push(newItem);
            }
          }
        }
      });

      // Update cache for next comparison
      cacheRef.current = newCache;
      return currentVisible;
    }),
  );

  const portalRoot = hostContext?.containerRef.current || undefined;

  if (visibleTooltips.length === 0) {
    return null;
  }

  return (
    <FloatingPortal root={portalRoot}>
      <AnimatePresence>
        {visibleTooltips.map(({ anchor, position }) => (
          <TooltipInstance key={anchor.id} anchor={anchor} position={position} />
        ))}
      </AnimatePresence>
    </FloatingPortal>
  );
}
