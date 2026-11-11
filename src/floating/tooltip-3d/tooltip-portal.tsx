import { useMemo, useRef, useState } from "react";
import { FloatingPortal, offset, flip, shift, useFloating } from "@floating-ui/react";
import { Menu } from "@base-ui/react/menu";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";
import { Variant } from "../../types";
import { ScrollArea } from "../../layouts/scroll-area";
import {
  MenuActionProvider,
  useMenuActionHandoff,
  preserveMenuInteraction,
  useMenuTabContainment,
  useNotificationMenuEscape,
} from "../menu-action";
import {
  useTooltipStore,
  type AnchorConfig,
  type ScreenPosition,
  type TooltipStore,
} from "./store";
import { useRootTooltipHost } from "./tooltip-context";

interface VisibleOverlay {
  anchor: AnchorConfig;
  position: ScreenPosition;
  invocation: number;
}

interface OverlayInstanceProps {
  anchor: AnchorConfig;
  position: ScreenPosition;
  /** The `showTooltip` call this overlay instance renders. */
  invocation: number;
}

/** Interactive canvas overlays are menus anchored at the pointer's viewport coordinates. */
function InteractiveOverlayInstance({ anchor, position, invocation }: OverlayInstanceProps) {
  const hostContext = useRootTooltipHost();
  const dismissOverlay = useTooltipStore((s) => s.dismissOverlay);
  const handoff = useMenuActionHandoff(() => {
    // Dismiss only this invocation: one started while this popup was closing, including
    // by a selected action, renders its own instance and stays visible.
    if (useTooltipStore.getState().visibility.get(anchor.id)?.invocation === invocation)
      dismissOverlay(anchor.id);
  });
  const [open, setOpen] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  useNotificationMenuEscape(open, () => setOpen(false));
  useMenuTabContainment(open, popupRef);
  const isMenu = anchor.mode === "context-menu";
  const virtualAnchor = useMemo(
    () => ({
      getBoundingClientRect: () => {
        const rect = hostContext?.containerRef.current?.getBoundingClientRect();
        return DOMRect.fromRect({
          x: (rect?.left ?? 0) + position.x,
          y: (rect?.top ?? 0) + position.y,
          width: 1,
          height: 1,
        });
      },
    }),
    [hostContext?.containerRef, position.x, position.y],
  );
  const content = typeof anchor.content === "function" ? anchor.content() : anchor.content;
  return (
    <Menu.Root
      open={open}
      loopFocus={false}
      onOpenChange={(next, details) => {
        if (!next && preserveMenuInteraction(details)) return;
        setOpen(next);
      }}
      onOpenChangeComplete={handoff.onOpenChangeComplete}
    >
      <Menu.Portal>
        <Menu.Positioner
          anchor={virtualAnchor}
          side={anchor.positioning?.side ?? (isMenu ? "bottom" : "top")}
          align={isMenu ? "start" : "center"}
          sideOffset={anchor.positioning?.offset ?? (isMenu ? 2 : 6)}
          collisionPadding={5}
        >
          <Menu.Popup
            ref={popupRef}
            render={(props, state) => (
              <div {...props} data-state={state.open ? "open" : "closed"} />
            )}
            className={clsx(
              Variant.Default,
              "[outline:none]",
              isMenu
                ? "variant-scope card-overlay dropdown-content m-0.5 min-w-56"
                : "variant-scope card-overlay m-0.5 overflow-clip shadow-lg",
              isMenu && "max-h-[calc(var(--available-height)-4px)]",
            )}
          >
            <MenuActionProvider value={handoff.enqueue}>
              {isMenu ? (
                <ScrollArea
                  focusableViewport={false}
                  shrinkHeight
                  className="flex max-h-[calc(var(--available-height)-6px)] flex-col gap-0.5 p-0.5"
                >
                  {content}
                </ScrollArea>
              ) : (
                content
              )}
            </MenuActionProvider>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
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

    const container = hostContext?.containerRef.current;
    const containerRect = container?.getBoundingClientRect();

    if (!containerRect) {
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
    // No `z-index`. This renders into the `TooltipHost` container as its last child, so it
    // already paints over the app chrome around it, and a positive value here only buys
    // beating overlays portalled to `<body>` — which a tooltip should lose to. At 50 it
    // covered an open `Modal`. Both halves are measured in
    // `floating/overlay-stacking.browser.tsx`.
    <div ref={refs.setFloating} style={floatingStyles}>
      <motion.div
        className={clsx(
          "variant-scope overflow-clip",
          Variant.Default,
          "card-overlay inline-flex items-center select-none",
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
  const cacheRef = useRef<Map<string, VisibleOverlay>>(new Map());

  const hostContext = useRootTooltipHost();

  const visibleTooltips = useTooltipStore(
    useShallow((state: TooltipStore) => {
      const currentVisible: VisibleOverlay[] = [];
      const newCache = new Map<string, VisibleOverlay>();

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
            const invocation = vis.invocation ?? 0;
            if (
              cached &&
              cached.anchor === anchor &&
              cached.invocation === invocation &&
              cached.position.x === position.x &&
              cached.position.y === position.y
            ) {
              newCache.set(anchorId, cached);
              currentVisible.push(cached);
            } else {
              const newItem = { anchor, position, invocation };
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

  // Interactive overlays use Menu dismissal; passive tooltips use floating-ui.
  const interactive = visibleTooltips.filter(({ anchor }) => anchor.interactive);
  const tooltips = visibleTooltips.filter(({ anchor }) => !anchor.interactive);

  return (
    <>
      {/* Interactive overlays anchor at the pointer. */}
      {interactive.map(({ anchor, position, invocation }) => (
        <InteractiveOverlayInstance
          key={`${anchor.id}:${String(invocation)}`}
          anchor={anchor}
          position={position}
          invocation={invocation}
        />
      ))}

      {/* Tooltips and popovers use floating-ui */}
      {tooltips.length > 0 && (
        <FloatingPortal root={portalRoot}>
          <AnimatePresence>
            {tooltips.map(({ anchor, position, invocation }) => (
              <TooltipInstance
                key={anchor.id}
                anchor={anchor}
                position={position}
                invocation={invocation}
              />
            ))}
          </AnimatePresence>
        </FloatingPortal>
      )}
    </>
  );
}
