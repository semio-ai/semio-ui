import { useMemo, useRef } from "react";
import { FloatingPortal, offset, flip, shift, useFloating } from "@floating-ui/react";
import { DropdownMenu as DropdownPrimitive } from "radix-ui";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";
import { Variant } from "../../types";
import { ScrollArea } from "../../layouts/scroll-area";
import { NestedParent } from "../../nested-elements/types";
import { NestedParentProvider } from "../../nested-elements/context";
import {
  useTooltipStore,
  type AnchorConfig,
  type ScreenPosition,
  type TooltipStore,
} from "./store";
import { useRootTooltipHost } from "./tooltip-context";

interface OverlayInstanceProps {
  anchor: AnchorConfig;
  position: ScreenPosition;
}

/**
 * Context menu overlay using Radix DropdownMenu for full keyboard
 * navigation, focus management, and click-outside dismissal.
 * A tiny invisible trigger is fixed-positioned at the click location.
 */
function InteractiveOverlayInstance({ anchor, position }: OverlayInstanceProps) {
  const hostContext = useRootTooltipHost();
  const dismissOverlay = useTooltipStore((s) => s.dismissOverlay);
  const isMenu = anchor.mode === "context-menu";


  // Convert container-relative position to viewport-relative for the trigger
  const container = hostContext?.containerRef.current;
  const containerRect = container?.getBoundingClientRect();
  const viewportX = (containerRect?.left ?? 0) + position.x;
  const viewportY = (containerRect?.top ?? 0) + position.y;

  const content = typeof anchor.content === "function" ? anchor.content() : anchor.content;
  const side = anchor.positioning?.side ?? (isMenu ? "bottom" : "top");

  const dropdown = (
    <DropdownPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) dismissOverlay(anchor.id);
      }}
    >
      <DropdownPrimitive.Trigger asChild>
        <div
          style={{
            position: "fixed",
            left: viewportX,
            top: viewportY,
            width: 1,
            height: 1,
            pointerEvents: "none",
          }}
        />
      </DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
          <DropdownPrimitive.Content
            side={side}
            align={isMenu ? "start" : "center"}
            sideOffset={anchor.positioning?.offset ?? (isMenu ? 2 : 6)}
            collisionPadding={5}
            className={clsx(
              Variant.Default,
              isMenu
                ? "responsive card dropdown-content m-0.5 min-w-56"
                : "responsive card m-0.5 overflow-clip shadow-lg",
              isMenu && "max-h-[calc(var(--radix-dropdown-menu-content-available-height)-4px)]",
            )}
          >
            {isMenu ? (
              <ScrollArea
                shrinkHeight
                className="flex max-h-[calc(var(--radix-dropdown-menu-content-available-height)-6px)] flex-col gap-0.5 p-0.5"
              >
                {content}
              </ScrollArea>
            ) : (
              content
            )}
          </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );

  // Context menus wrap in NestedParentProvider for NestedItem support
  if (isMenu) {
    return <NestedParentProvider value={NestedParent.Dropdown}>{dropdown}</NestedParentProvider>;
  }
  return dropdown;
}

/**
 * Standard tooltip/popover instance using floating-ui positioning.
 */
function TooltipInstance({ anchor, position }: OverlayInstanceProps) {
  const hostContext = useRootTooltipHost();

  // Create virtual element for floating-ui with viewport-relative positioning
  const virtualElement = useMemo(() => {
    if (
      !position ||
      typeof position.x !== "number" ||
      typeof position.y !== "number" ||
      isNaN(position.x) ||
      isNaN(position.y) ||
      !isFinite(position.x) ||
      !isFinite(position.y)
    ) {
      return {
        getBoundingClientRect: () => ({
          x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0,
          toJSON: () => ({}),
        }),
      };
    }

    const width = position.width || 0;
    const height = position.height || 0;

    const container = hostContext?.containerRef.current;
    const containerRect = container?.getBoundingClientRect();

    if (!containerRect) {
      return {
        getBoundingClientRect: () => ({
          x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0,
          toJSON: () => ({}),
        }),
      };
    }

    const viewportX = position.x + containerRect.left;
    const viewportY = position.y + containerRect.top;

    const frameOffset = hostContext?.frameOffset || { x: 0, y: 0 };
    const isInIframe = window !== window.top;

    const adjustedX = isInIframe ? viewportX + frameOffset.x : viewportX;
    const adjustedY = isInIframe ? viewportY + frameOffset.y : viewportY;

    const left = adjustedX - width / 2;
    const top = adjustedY - height / 2;

    return {
      getBoundingClientRect: () => ({
        x: left, y: top, top, left,
        bottom: top + height, right: left + width, width, height,
        toJSON: () => ({}),
      }),
    };
  }, [position, hostContext?.frameOffset, hostContext?.containerRef]);

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: anchor.positioning?.side || "top",
    middleware: [
      offset(anchor.positioning?.offset || 6),
      flip({ padding: 5 }),
      shift({ padding: 5 }),
    ],
  });

  refs.setReference(virtualElement);

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
 * Portal component that renders all visible overlays (tooltips, popovers, context menus).
 * Placed at the root level via TooltipHost.
 */
export function TooltipPortal() {
  const cacheRef = useRef<Map<string, { anchor: AnchorConfig; position: ScreenPosition }>>(
    new Map(),
  );

  const hostContext = useRootTooltipHost();

  const visibleTooltips = useTooltipStore(
    useShallow((state: TooltipStore) => {
      const currentVisible: { anchor: AnchorConfig; position: ScreenPosition }[] = [];
      const newCache = new Map<string, { anchor: AnchorConfig; position: ScreenPosition }>();

      state.visibility.forEach((vis, anchorId) => {
        if (vis.visible) {
          const anchor = state.anchors.get(anchorId);
          const position = state.getEffectivePosition(anchorId);

          const isValidPosition =
            position &&
            typeof position.x === "number" &&
            typeof position.y === "number" &&
            !isNaN(position.x) &&
            !isNaN(position.y) &&
            isFinite(position.x) &&
            isFinite(position.y);

          if (anchor && isValidPosition && (!anchor.isAvailable || anchor.isAvailable())) {
            const cached = cacheRef.current.get(anchorId);
            if (
              cached &&
              cached.anchor === anchor &&
              cached.position.x === position.x &&
              cached.position.y === position.y
            ) {
              newCache.set(anchorId, cached);
              currentVisible.push(cached);
            } else {
              const newItem = { anchor, position };
              newCache.set(anchorId, newItem);
              currentVisible.push(newItem);
            }
          }
        }
      });

      cacheRef.current = newCache;
      return currentVisible;
    }),
  );

  const portalRoot = hostContext?.containerRef.current || undefined;

  if (visibleTooltips.length === 0) {
    return null;
  }

  // Interactive overlays (context menus, click-popovers) use Radix DropdownMenu for
  // built-in click-outside dismissal. Non-interactive tooltips use floating-ui.
  const interactive = visibleTooltips.filter(({ anchor }) => anchor.interactive);
  const tooltips = visibleTooltips.filter(({ anchor }) => !anchor.interactive);

  return (
    <>
      {/* Interactive overlays use Radix DropdownMenu for click-outside dismissal */}
      {interactive.map(({ anchor, position }) => (
        <InteractiveOverlayInstance key={anchor.id} anchor={anchor} position={position} />
      ))}

      {/* Tooltips and popovers use floating-ui */}
      {tooltips.length > 0 && (
        <FloatingPortal root={portalRoot}>
          <AnimatePresence>
            {tooltips.map(({ anchor, position }) => (
              <TooltipInstance key={anchor.id} anchor={anchor} position={position} />
            ))}
          </AnimatePresence>
        </FloatingPortal>
      )}
    </>
  );
}
