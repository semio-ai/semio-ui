import { useRef, useEffect, useId, useCallback } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useTooltipStore, type AxisMode, type TooltipSide } from "./store";

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

export function useTooltipAnchor(options: UseTooltipAnchorOptions): UseTooltipAnchorResult {
  const autoId = useId();
  const id = options.id || autoId;
  const ref = useRef<THREE.Object3D>(null);

  const { registerAnchor, unregisterAnchor, updateAnchorPosition, updateCursorPosition } =
    useTooltipStore();

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
  useFrame(({ camera, size }) => {
    if (!ref.current) return;

    // Get world position
    const worldPos = ref.current.getWorldPosition(ref.current.position.clone());

    // Create a vector for projection
    const vector = worldPos.clone();

    // Check if object is behind camera
    const cameraDir = camera.getWorldDirection(camera.position.clone());
    const toObject = worldPos.clone().sub(camera.position);

    toObject.normalize();

    // If object is behind camera, don't update position
    if (cameraDir.dot(toObject) < 0) {
      return;
    }

    // Project to screen space
    // Cast needed because @react-three/fiber's camera type has additional properties
    // that don't exactly match Three.js's base Camera type
    vector.project(camera as unknown as THREE.Camera);

    // Convert to screen coordinates
    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (-vector.y * 0.5 + 0.5) * size.height;

    // Check if position is within viewport
    if (x >= 0 && x <= size.width && y >= 0 && y <= size.height) {
      updateAnchorPosition(id, { x, y });
    }
  });

  // Handle cursor tracking - only if axis mode requires it
  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (options.axis && options.axis !== "none") {
        updateCursorPosition(id, {
          x: event.clientX ?? event.nativeEvent.clientX,
          y: event.clientY ?? event.nativeEvent.clientY,
        });
      }
    },
    [id, options.axis, updateCursorPosition],
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
