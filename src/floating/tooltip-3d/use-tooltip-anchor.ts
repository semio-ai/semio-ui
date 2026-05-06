import { useRef, useEffect, useId, useCallback } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { ReactNode } from "react";
import * as THREE from "three";
import {
  useTooltipStore,
  type AxisMode,
  type TooltipSide,
  type OverlayMode,
  type CoordinateDebugInfo,
} from "./store";
import { useTooltipHost, useRootTooltipHost } from "./tooltip-context";

export interface UseTooltipAnchorOptions {
  id?: string;
  content: ReactNode | (() => ReactNode);
  axis?: AxisMode;
  offset?: number;
  side?: TooltipSide;
  isAvailable?: () => boolean;
  /** Interaction mode: 'hover' (default), 'click', or 'context-menu'. */
  mode?: OverlayMode;
  /** When true, overlay content receives pointer events. Defaults to true for click/context-menu. */
  interactive?: boolean;
  /** Priority for group-based exclusion (higher wins). */
  priority?: number;
  /** Exclusion group: only highest-priority visible per group. */
  group?: string;
}

export interface UseTooltipAnchorResult {
  ref: React.RefObject<THREE.Object3D | null>;
  anchorId: string;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: () => void;
  /** Returned when mode === 'click'. Toggles overlay visibility. */
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

/**
 * Hook to create a tooltip anchor that can be positioned in 3D space.
 *
 * The anchor handles position tracking and coordinate conversion from 3D to screen space.
 * To control tooltip visibility with custom delays, use `useTooltipTrigger` with the returned `anchorId`.
 *
 * @param options Configuration options for the tooltip anchor
 * @returns Anchor reference, ID, and optional event handlers
 *
 * @example
 * ```tsx
 * const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
 *   content: <div>Tooltip content</div>,
 *   side: "top"
 * });
 *
 * const { show, hide } = useTooltipTrigger(anchorId, { showDelay: 100 });
 *
 * <mesh
 *   ref={ref}
 *   onPointerOver={() => show()}
 *   onPointerOut={() => hide()}
 *   onPointerMove={onPointerMove}
 *   onPointerLeave={onPointerLeave}
 * >
 *   <boxGeometry />
 * </mesh>
 * ```
 */
export function useTooltipAnchor(options: UseTooltipAnchorOptions): UseTooltipAnchorResult {
  const autoId = useId();
  const id = options.id || autoId;
  const ref = useRef<THREE.Object3D>(null);

  const {
    registerAnchor,
    unregisterAnchor,
    updateAnchorPosition,
    updateAnchorContent,
    updateCursorPosition,
    logCoordinateDebug,
  } = useTooltipStore();

  // Get both immediate and root contexts
  // Immediate context for canvas-relative calculations
  // Root context for final positioning (where portal is rendered)
  const immediateHost = useTooltipHost();
  const rootHost = useRootTooltipHost();

  // Remove complex memoization - rely on store-level safety net to prevent infinite loops
  const memoizedContent = options.content;

  const mode = options.mode ?? "hover";
  const interactive = options.interactive ?? (mode !== "hover");

  // Register anchor on mount
  useEffect(() => {
    registerAnchor({
      id,
      ref,
      content: memoizedContent,
      positioning: {
        axis: options.axis || "none",
        offset: options.offset,
        side: options.side,
      },
      mode,
      interactive,
      priority: options.priority,
      group: options.group,
      isAvailable: options.isAvailable,
    });

    return () => unregisterAnchor(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Content updates are handled by the dedicated effect below; keeping this dep list narrow avoids re-registering the anchor on every content change.
  }, [
    id,
    options.axis,
    options.offset,
    options.side,
    options.isAvailable,
    options.priority,
    options.group,
    mode,
    interactive,
    registerAnchor,
    unregisterAnchor,
  ]);

  // Push content updates to the registered anchor when the consumer's
  // `content` prop changes after mount. Callers that re-render frequently
  // should memoize their content so this effect only fires on intentional
  // changes — every fire writes to the tooltip store and re-renders portals.
  useEffect(() => {
    updateAnchorContent(id, memoizedContent);
  }, [id, memoizedContent, updateAnchorContent]);

  // Update bounding box position every frame
  useFrame(({ camera }) => {
    if (!ref.current) return;

    // Calculate 3D bounding box
    const boundingBox = new THREE.Box3().setFromObject(ref.current);

    // Get all 8 corners of the bounding box
    const corners = [
      new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
      new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
    ];

    // Check if object is behind camera using center point
    const center = boundingBox.getCenter(new THREE.Vector3());
    const centerProjected = center.clone();
    centerProjected.project(camera as unknown as THREE.Camera);

    // If projected z is > 1, object is behind camera
    if (centerProjected.z > 1) {
      return;
    }

    // Get immediate container for canvas-relative calculation
    const immediateContainer = immediateHost?.containerRef.current;
    if (!immediateContainer) return;

    // Find the main rendering canvas among potentially multiple canvases
    let canvas: HTMLCanvasElement | null = null;
    const canvases = immediateContainer.querySelectorAll("canvas");

    if (canvases.length === 1) {
      // Simple case: only one canvas
      canvas = canvases[0];
    } else if (canvases.length > 1) {
      // Multiple canvases: find the main rendering canvas

      let bestCanvas: HTMLCanvasElement | null = null;
      let largestArea = 0;

      for (const c of canvases) {
        const rect = c.getBoundingClientRect();
        const area = rect.width * rect.height;

        // Skip canvases that are hidden or too small (likely HUD/minimap canvases)
        if (area < 1000) continue;

        // Prefer the largest canvas (main rendering canvas)
        if (area > largestArea) {
          largestArea = area;
          bestCanvas = c;
        }
      }

      canvas = bestCanvas;
    }

    if (!canvas) return;

    // Get rects for coordinate calculations
    const immediateRect = immediateContainer.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Get root container rect for final transformation
    const rootContainer = rootHost?.containerRef.current;
    if (!rootContainer) return;
    const rootRect = rootContainer.getBoundingClientRect();

    // Debug info collection
    const debugInfo: Partial<CoordinateDebugInfo> = {
      anchorId: id,
      containerRect: immediateRect,
      canvasRect,
      worldPosition: { x: center.x, y: center.y, z: center.z },
      ndcPosition: { x: centerProjected.x, y: centerProjected.y, z: centerProjected.z },
      frameOffset: rootHost?.frameOffset,
    };

    // Project all corners to container-relative coordinates
    const projectedCorners = corners.map((corner) => {
      const projected = corner.clone();
      // Cast needed because @react-three/fiber's camera type has additional properties
      projected.project(camera as unknown as THREE.Camera);

      // Convert NDC to canvas coordinates
      const canvasX = (projected.x * 0.5 + 0.5) * canvasRect.width;
      const canvasY = (-projected.y * 0.5 + 0.5) * canvasRect.height;

      // Convert canvas coordinates to immediate container-relative coordinates
      const immediateX = canvasX + (canvasRect.left - immediateRect.left);
      const immediateY = canvasY + (canvasRect.top - immediateRect.top);

      // Transform to root container coordinates
      const rootX = immediateX + (immediateRect.left - rootRect.left);
      const rootY = immediateY + (immediateRect.top - rootRect.top);

      return {
        x: rootX,
        y: rootY,
      };
    });

    // Find screen-space bounding box
    const screenBounds = projectedCorners.reduce(
      (bounds, corner) => ({
        minX: Math.min(bounds.minX, corner.x),
        maxX: Math.max(bounds.maxX, corner.x),
        minY: Math.min(bounds.minY, corner.y),
        maxY: Math.max(bounds.maxY, corner.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    );

    // Always use center of screen bounding box - let floating-ui handle side positioning and flipping
    const x = (screenBounds.minX + screenBounds.maxX) / 2;
    const y = (screenBounds.minY + screenBounds.maxY) / 2;

    const finalPosition = {
      x,
      y,
      width: screenBounds.maxX - screenBounds.minX,
      height: screenBounds.maxY - screenBounds.minY,
    };

    // Add final position to debug info
    debugInfo.containerPosition = { x, y };
    debugInfo.finalPosition = finalPosition;

    // Log debug information
    logCoordinateDebug(debugInfo);

    // Check if position is within root container bounds
    const isWithinBounds = x >= 0 && x <= rootRect.width && y >= 0 && y <= rootRect.height;

    if (isWithinBounds) {
      updateAnchorPosition(id, finalPosition);
    }
  });

  // Handle cursor tracking - only if axis mode requires it.
  // When a click-mode tooltip is visible (pinned), skip cursor updates so
  // the overlay stays at the click position instead of following the mouse.
  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (options.axis && options.axis !== "none") {
        // Don't update cursor position while a click-pinned tooltip is showing
        if (mode === "click") {
          const vis = useTooltipStore.getState().visibility.get(id);
          if (vis?.visible) return;
        }

        const rootContainer = rootHost?.containerRef.current;
        if (!rootContainer) return;

        const rootRect = rootContainer.getBoundingClientRect();
        const containerX = (event.clientX ?? event.nativeEvent.clientX) - rootRect.left;
        const containerY = (event.clientY ?? event.nativeEvent.clientY) - rootRect.top;

        updateCursorPosition(id, {
          x: containerX,
          y: containerY,
        });
      }
    },
    [id, mode, options.axis, updateCursorPosition, rootHost],
  );

  const handlePointerLeave = useCallback(() => {
    if (options.axis && options.axis !== "none") {
      // Don't clear cursor position while a click-pinned tooltip is showing
      if (mode === "click") {
        const vis = useTooltipStore.getState().visibility.get(id);
        if (vis?.visible) return;
      }
      updateCursorPosition(id, null);
    }
  }, [id, mode, options.axis, updateCursorPosition]);

  // Click handler for mode === 'click': toggles visibility.
  // If this anchor belongs to a group, dismiss other group members first
  // so only one overlay per group is visible at a time.
  const store = useTooltipStore();
  const clickTriggerId = `${id}-click`;
  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (options.group) {
        // Read current state imperatively — store Maps are stale if captured in closure
        const { anchors: currentAnchors, visibility: currentVis, dismissOverlay: dismiss } = useTooltipStore.getState();
        currentVis.forEach((vis, anchorId) => {
          if (anchorId !== id && vis.visible) {
            const other = currentAnchors.get(anchorId);
            if (other?.group === options.group) {
              dismiss(anchorId);
            }
          }
        });
      }

      // Pin cursor position at click location so axis-tracking tooltips
      // stay at the click point instead of following subsequent mouse movement.
      if (options.axis && options.axis !== "none") {
        const rootContainer = rootHost?.containerRef.current;
        if (rootContainer) {
          const rootRect = rootContainer.getBoundingClientRect();
          const containerX = (event.clientX ?? event.nativeEvent.clientX) - rootRect.left;
          const containerY = (event.clientY ?? event.nativeEvent.clientY) - rootRect.top;
          updateCursorPosition(id, { x: containerX, y: containerY });
        }
      }

      store.toggleTooltip(id, clickTriggerId);
    },
    [id, clickTriggerId, options.group, options.axis, store, rootHost, updateCursorPosition],
  );

  // Build result based on mode and axis tracking
  const result: UseTooltipAnchorResult = { ref, anchorId: id };

  if (options.axis && options.axis !== "none") {
    result.onPointerMove = handlePointerMove;
    result.onPointerLeave = handlePointerLeave;
  }

  if (mode === "click") {
    result.onClick = handleClick;
  }

  return result;
}
