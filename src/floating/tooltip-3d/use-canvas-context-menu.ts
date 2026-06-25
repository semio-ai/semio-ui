import { useRef, useEffect, useId, useCallback, createElement } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { ReactNode } from "react";
import {
  useKeybindingMap,
  KeybindingProvider,
  type KeybindingMap,
} from "../../keybinding-context";
import { takeDropdownOpenLock, releaseDropdownOpenLock } from "../dropdown-coordinator";
import { useTooltipStore, type ScreenPosition } from "./store";
import { useRootTooltipHost } from "./tooltip-context";

export interface CanvasContextMenuContext {
  /** World-space intersection point from R3F raycaster. */
  worldPosition: [number, number, number];
  /** Screen position relative to the overlay host container. */
  screenPosition: ScreenPosition;
}

export interface UseCanvasContextMenuOptions {
  /** Stable ID for the anchor. Auto-generated if omitted. */
  id?: string;
  /** Menu content builder. Receives the right-click context (world position, screen position). */
  items: (ctx: CanvasContextMenuContext) => ReactNode;
  /** Exclusion group for priority-based filtering. */
  group?: string;
  /** Priority within the group (higher wins). */
  priority?: number;
}

export interface UseCanvasContextMenuResult {
  /** Attach to an R3F mesh's onContextMenu prop. */
  onContextMenu: (event: ThreeEvent<PointerEvent>) => void;
  /** The anchor ID, for imperative control if needed. */
  anchorId: string;
}

interface PortalKeybindingProviderProps {
  value: KeybindingMap;
  children?: ReactNode;
}

const PortalKeybindingProvider = KeybindingProvider as (
  props: PortalKeybindingProviderProps,
) => ReactNode;

/**
 * Hook for right-click context menus on R3F meshes.
 *
 * Registers a context-menu anchor in the overlay store and returns an
 * `onContextMenu` handler to attach to any R3F mesh. When triggered,
 * the handler captures the world-space intersection point and screen
 * position, then shows an interactive menu at the cursor location.
 *
 * @example
 * ```tsx
 * const { onContextMenu } = useCanvasContextMenu({
 *   items: (ctx) => (
 *     <>
 *       <NestedItem onClick={() => paste(ctx.worldPosition)}>Paste</NestedItem>
 *     </>
 *   ),
 * });
 *
 * <mesh onContextMenu={onContextMenu}>
 *   <planeGeometry />
 * </mesh>
 * ```
 */
export function useCanvasContextMenu(
  options: UseCanvasContextMenuOptions,
): UseCanvasContextMenuResult {
  const autoId = useId();
  const id = options.id ?? `ctx-menu-${autoId}`;
  const triggerId = `${id}-trigger`;
  const rootHost = useRootTooltipHost();

  const { registerAnchor, unregisterAnchor, showTooltip, dismissOverlay } = useTooltipStore();

  // Store the latest context so the lazy content function reads it
  const contextRef = useRef<CanvasContextMenuContext>({
    worldPosition: [0, 0, 0],
    screenPosition: { x: 0, y: 0 },
  });
  const itemsRef = useRef(options.items);
  itemsRef.current = options.items;

  // Capture keybinding map from context — will be re-provided inside the
  // Radix portal so KeybindingHint components render correctly.
  const keybindingMap = useKeybindingMap();
  const keybindingMapRef = useRef(keybindingMap);
  keybindingMapRef.current = keybindingMap;

  // Register a placeholder anchor on mount. The real content is set
  // at invocation time in onContextMenu so it captures current state.
  useEffect(() => {
    registerAnchor({
      id,
      content: null,
      positioning: {
        side: "bottom",
        offset: 2,
        axis: "none",
      },
      mode: "context-menu",
      interactive: true,
      priority: options.priority,
      group: options.group,
    });

    return () => unregisterAnchor(id);
  }, [id, options.priority, options.group, registerAnchor, unregisterAnchor]);

  // Participate in the global single-open-menu lock so opening any Dropdown
  // dismisses an open canvas context menu (mirrors the existing reverse: a
  // right-click already dismisses an open Dropdown via Radix's outside-press).
  // The canvas menu lives in its own overlay store, so without this it stayed
  // open when a Dropdown opened elsewhere. Hold the lock while visible; release
  // when hidden. `close` is stable so re-right-clicking doesn't evict itself.
  const close = useCallback(() => dismissOverlay(id), [dismissOverlay, id]);
  useEffect(() => {
    const unsubscribe = useTooltipStore.subscribe(
      (state) => state.visibility.get(id)?.visible ?? false,
      (visible) => {
        if (visible) {
          takeDropdownOpenLock(close);
        } else {
          releaseDropdownOpenLock(close);
        }
      },
    );
    return () => {
      releaseDropdownOpenLock(close);
      unsubscribe();
    };
  }, [id, close]);

  const onContextMenu = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // If another scene (e.g. HUD) already handled this event, skip.
      // This prevents duplicate menus when HUD overlays the main canvas.
      if (event.nativeEvent.defaultPrevented) return;

      // Suppress the browser context menu
      event.nativeEvent.preventDefault();
      event.nativeEvent.stopPropagation();

      // Capture world position from R3F raycaster
      const point = event.point;
      const worldPosition: [number, number, number] = [point.x, point.y, point.z];

      // Convert client coords to container-relative screen position
      const rootContainer = rootHost?.containerRef.current;
      const rootRect = rootContainer?.getBoundingClientRect();
      const clientX = event.nativeEvent.clientX;
      const clientY = event.nativeEvent.clientY;
      const screenPosition: ScreenPosition = rootRect
        ? { x: clientX - rootRect.left, y: clientY - rootRect.top }
        : { x: clientX, y: clientY };

      contextRef.current = { worldPosition, screenPosition };

      // Dismiss any existing instance first (repositions on re-right-click)
      dismissOverlay(id);

      // Eagerly evaluate items with current state so the menu content
      // is a snapshot — standard context menu behavior.
      // Wrap in KeybindingProvider so KeybindingHint components work
      // inside the Radix portal (which escapes the React context tree).
      const ctx = contextRef.current;
      const rawContent = itemsRef.current(ctx);
      const content = createElement(
        PortalKeybindingProvider,
        { value: keybindingMapRef.current },
        rawContent,
      );

      // Update the anchor with the evaluated content and screen position
      registerAnchor({
        id,
        content,
        positioning: {
          side: "bottom",
          offset: 2,
          axis: "none",
        },
        mode: "context-menu",
        interactive: true,
        priority: options.priority,
        group: options.group,
        screenPosition,
      });

      // Use a microtask to ensure the dismiss + re-register are processed
      queueMicrotask(() => {
        showTooltip(id, triggerId);
      });
    },
    [id, triggerId, rootHost, registerAnchor, dismissOverlay, showTooltip, options.priority, options.group],
  );

  return { onContextMenu, anchorId: id };
}
