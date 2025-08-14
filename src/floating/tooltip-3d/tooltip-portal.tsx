import { useMemo, useRef } from "react";
import { FloatingPortal, offset, flip, shift, useFloating } from "@floating-ui/react";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";
import { Variant } from "../../types";
import {
  useTooltipStore,
  type AnchorConfig,
  type ScreenPosition,
  type TooltipStore,
} from "./store";
import { useTooltipHost } from "./tooltip-host";

interface TooltipInstanceProps {
  anchor: AnchorConfig;
  position: ScreenPosition;
}

/**
 * Individual tooltip instance that handles its own positioning and rendering.
 */
function TooltipInstance({ anchor, position }: TooltipInstanceProps) {
  const hostContext = useTooltipHost();

  // Create virtual element for floating-ui with actual bounding box dimensions
  const virtualElement = useMemo(() => {
    const width = position.width || 0;
    const height = position.height || 0;

    // Apply frame offset for iframe positioning
    const frameOffset = hostContext?.frameOffset || { x: 0, y: 0 };
    const adjustedX = position.x + frameOffset.x;
    const adjustedY = position.y + frameOffset.y;

    // Center the bounding rect around the adjusted position
    const left = adjustedX - width / 2;
    const top = adjustedY - height / 2;

    return {
      getBoundingClientRect: () => ({
        x: left,
        y: top,
        top,
        left,
        bottom: top + height,
        right: left + width,
        width,
        height,
        toJSON: () => ({}),
      }),
    };
  }, [position.x, position.y, position.width, position.height, hostContext?.frameOffset]);

  // Use floating-ui for positioning
  const { refs, floatingStyles } = useFloating({
    strategy: "absolute",
    placement: anchor.positioning?.side || "top",
    middleware: [
      offset(anchor.positioning?.offset || 6),
      flip({ padding: 5 }),
      shift({ padding: 5 }),
    ],
  });

  // Set the virtual element as the reference
  useMemo(() => {
    refs.setReference(virtualElement);
  }, [refs, virtualElement]);

  // Render content
  const content = typeof anchor.content === "function" ? anchor.content() : anchor.content;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={clsx(
        "responsive overflow-clip",
        Variant.Default,
        "card select-none inline-flex items-center",
        "pointer-events-none",
        "variant-static-text",
        "z-50",
        "shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      )}
      data-state="open"
    >
      {content}
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

  // Get host context for iframe positioning (must be called at top level)
  const hostContext = useTooltipHost();

  const visibleTooltips = useTooltipStore(
    useShallow((state: TooltipStore) => {
      const currentVisible: { anchor: AnchorConfig; position: ScreenPosition }[] = [];
      const newCache = new Map<string, { anchor: AnchorConfig; position: ScreenPosition }>();

      state.visibility.forEach((vis, anchorId) => {
        if (vis.visible) {
          const anchor = state.anchors.get(anchorId);
          const position = state.getEffectivePosition(anchorId);

          if (anchor && position && (!anchor.isAvailable || anchor.isAvailable())) {
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

  // Use the host container as portal root in iframe scenarios
  const portalRoot = hostContext?.containerRef.current || undefined;

  if (visibleTooltips.length === 0) {
    return null;
  }

  return (
    <FloatingPortal root={portalRoot}>
      {visibleTooltips.map(({ anchor, position }) => (
        <TooltipInstance key={anchor.id} anchor={anchor} position={position} />
      ))}
    </FloatingPortal>
  );
}
