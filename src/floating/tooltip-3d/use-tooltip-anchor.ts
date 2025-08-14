import { useRef, useEffect, useId, useCallback, useMemo, isValidElement } from "react";
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

  const {
    registerAnchor,
    unregisterAnchor,
    updateAnchorPosition,
    updateCursorPosition,
    updateAnchorContent,
  } = useTooltipStore();

  // Content comparison and memoization to prevent infinite loops
  const contentRef = useRef<ReactNode | (() => ReactNode)>(options.content);
  const memoizedContent = useMemo(() => {
    const newContent = options.content;
    const prevContent = contentRef.current;

    // If content types are different, always update
    if (typeof newContent !== typeof prevContent) {
      contentRef.current = newContent;
      return newContent;
    }

    // For functions, compare by reference
    if (typeof newContent === "function") {
      if (newContent !== prevContent) {
        contentRef.current = newContent;
        return newContent;
      }
      return prevContent;
    }

    // For React elements, compare type and props
    if (isValidElement(newContent) && isValidElement(prevContent)) {
      if (
        newContent.type === prevContent.type &&
        JSON.stringify(newContent.props) === JSON.stringify(prevContent.props)
      ) {
        return prevContent; // Keep previous reference
      }
    }

    // For primitives (string, number) or different elements, compare by reference/value
    if (newContent !== prevContent) {
      contentRef.current = newContent;
      return newContent;
    }

    return prevContent;
  }, [options.content]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally omit options.content - content updates are handled separately
  }, [
    id,
    options.axis,
    options.offset,
    options.side,
    options.isAvailable,
    registerAnchor,
    unregisterAnchor,
  ]);

  // Update content if it changes
  useEffect(() => {
    updateAnchorContent(id, memoizedContent);
  }, [id, memoizedContent, updateAnchorContent]);

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
