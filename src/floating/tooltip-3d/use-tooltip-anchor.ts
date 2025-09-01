import { useRef, useEffect, useId, useCallback } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { ReactNode } from "react";
import * as THREE from "three";
import {
  useTooltipStore,
  type AxisMode,
  type TooltipSide,
  type CoordinateDebugInfo,
} from "./store";
import { useTooltipHost } from "./tooltip-context";

export interface UseTooltipAnchorOptions {
  id?: string;
  content: ReactNode | (() => ReactNode);
  axis?: AxisMode;
  offset?: number;
  side?: TooltipSide;
  isAvailable?: () => boolean;
}

export interface UseTooltipAnchorResult {
  ref: React.RefObject<THREE.Object3D>;
  anchorId: string;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: () => void;
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
    updateCursorPosition,
    logCoordinateDebug,
  } = useTooltipStore();

  const tooltipHost = useTooltipHost();

  // Remove complex memoization - rely on store-level safety net to prevent infinite loops
  const memoizedContent = options.content;

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
      isAvailable: options.isAvailable,
    });

    return () => unregisterAnchor(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally omit options.content - content is only set during registration
  }, [
    id,
    options.axis,
    options.offset,
    options.side,
    options.isAvailable,
    registerAnchor,
    unregisterAnchor,
  ]);

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

    // Get TooltipHost container for proper coordinate calculation
    const container = tooltipHost?.containerRef.current;
    if (!container) return;

    // Find the main rendering canvas among potentially multiple canvases
    let canvas: HTMLCanvasElement | null = null;
    const canvases = container.querySelectorAll("canvas");

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

    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Debug info collection
    const debugInfo: Partial<CoordinateDebugInfo> = {
      anchorId: id,
      containerRect,
      canvasRect,
      worldPosition: { x: center.x, y: center.y, z: center.z },
      ndcPosition: { x: centerProjected.x, y: centerProjected.y, z: centerProjected.z },
      frameOffset: tooltipHost?.frameOffset,
    };

    // Project all corners to container-relative coordinates
    const projectedCorners = corners.map((corner) => {
      const projected = corner.clone();
      // Cast needed because @react-three/fiber's camera type has additional properties
      projected.project(camera as unknown as THREE.Camera);

      // Convert NDC to canvas coordinates
      const canvasX = (projected.x * 0.5 + 0.5) * canvasRect.width;
      const canvasY = (-projected.y * 0.5 + 0.5) * canvasRect.height;

      // Convert canvas coordinates to container-relative coordinates
      const containerX = canvasX + (canvasRect.left - containerRect.left);
      const containerY = canvasY + (canvasRect.top - containerRect.top);

      return {
        x: containerX,
        y: containerY,
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

    // Check if position is within container bounds
    const isWithinBounds =
      x >= 0 && x <= containerRect.width && y >= 0 && y <= containerRect.height;

    if (isWithinBounds) {
      updateAnchorPosition(id, finalPosition);
    }
  });

  // Handle cursor tracking - only if axis mode requires it
  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (options.axis && options.axis !== "none") {
        // Get TooltipHost container for proper coordinate calculation
        const container = tooltipHost?.containerRef.current;
        if (!container) {
          console.log(`🎯 [Tooltip Debug] No container for cursor tracking: ${id}`);
          return;
        }

        const containerRect = container.getBoundingClientRect();

        // Convert global cursor position to container-relative coordinates
        const containerX = (event.clientX ?? event.nativeEvent.clientX) - containerRect.left;
        const containerY = (event.clientY ?? event.nativeEvent.clientY) - containerRect.top;

        updateCursorPosition(id, {
          x: containerX,
          y: containerY,
        });
      }
    },
    [id, options.axis, updateCursorPosition, tooltipHost],
  );

  const handlePointerLeave = useCallback(() => {
    if (options.axis && options.axis !== "none") {
      updateCursorPosition(id, null);
    }
  }, [id, options.axis, updateCursorPosition]);

  // Only return event handlers if axis tracking is enabled
  if (options.axis && options.axis !== "none") {
    return {
      ref,
      anchorId: id,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
    };
  }

  return {
    ref,
    anchorId: id,
  };
}
