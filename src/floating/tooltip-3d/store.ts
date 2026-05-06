import { create } from "zustand";
import { subscribeWithSelector, devtools } from "zustand/middleware";
import type { ReactNode, RefObject } from "react";
import type * as THREE from "three";

export interface ScreenPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface CoordinateDebugInfo {
  anchorId: string;
  timestamp: number;
  containerRect?: DOMRect;
  canvasRect?: DOMRect;
  worldPosition?: { x: number; y: number; z: number };
  ndcPosition?: { x: number; y: number; z: number };
  canvasPosition?: { x: number; y: number };
  containerPosition?: { x: number; y: number };
  frameOffset?: { x: number; y: number };
  finalPosition?: ScreenPosition;
}

export type AxisMode = "none" | "x" | "y" | "both";
export type TooltipSide = "top" | "right" | "bottom" | "left";
export type OverlayMode = "hover" | "click" | "context-menu";

export interface AnchorConfig {
  id: string;
  ref?: RefObject<THREE.Object3D | null>;
  content: ReactNode | (() => ReactNode);
  positioning: {
    side?: TooltipSide;
    offset?: number;
    axis?: AxisMode;
    clampToViewport?: boolean;
  };
  // Interaction mode: hover (default), click-to-pin, or context menu
  mode?: OverlayMode;
  // When true, portal content receives pointer events (for menus/popovers)
  interactive?: boolean;
  // Priority for group-based exclusion (higher wins)
  priority?: number;
  // Exclusion group: only highest-priority anchor visible per group
  group?: string;
  // Anchor can specify conditions for when it's available
  isAvailable?: () => boolean;
  // Manual screen position override
  screenPosition?: ScreenPosition;
  // Current cursor position for tracked positioning
  cursorPosition?: ScreenPosition;
}

export interface VisibilityState {
  visible: boolean;
  triggers: Set<string>; // Multiple triggers can keep it visible
  lastTrigger?: string;
  priority?: number;
}

export interface TooltipStore {
  // State
  anchors: Map<string, AnchorConfig>;
  triggers: Map<string, Set<string>>; // anchorId -> Set of triggerId
  positions: Map<string, ScreenPosition>; // Bounding box positions
  cursorPositions: Map<string, ScreenPosition>; // Current cursor positions
  visibility: Map<string, VisibilityState>;
  hoveredAnchors: Set<string>;

  // Position update batching
  _positionUpdateQueue: Map<string, ScreenPosition>;
  _rafId: number | null;

  // Debug utilities
  debugMode: boolean;
  debugHistory: CoordinateDebugInfo[];
  _maxDebugHistory: number;

  // Anchor management
  registerAnchor: (config: AnchorConfig) => void;
  unregisterAnchor: (id: string) => void;
  updateAnchorPosition: (id: string, position: ScreenPosition) => void;
  updateCursorPosition: (id: string, position: ScreenPosition | null) => void;
  updateAnchorContent: (id: string, content: ReactNode | (() => ReactNode)) => void;
  setAnchorAvailability: (id: string, isAvailable: () => boolean) => void;

  // Trigger management
  showTooltip: (anchorId: string, triggerId: string) => void;
  hideTooltip: (anchorId: string, triggerId: string) => void;
  toggleTooltip: (anchorId: string, triggerId: string) => void;

  // Batch operations
  hideAll: () => void;
  dismissOverlay: (anchorId: string) => void;
  updatePositions: (updates: Map<string, ScreenPosition>) => void;

  // Computed getters
  getVisibleTooltips: () => AnchorConfig[];
  hasInteractiveOverlay: () => boolean;
  isTooltipVisible: (anchorId: string) => boolean;
  getTooltipPosition: (anchorId: string) => ScreenPosition | null;
  getEffectivePosition: (anchorId: string) => ScreenPosition | null;

  // Debug utilities
  enableDebugMode: (enabled: boolean) => void;
  logCoordinateDebug: (info: Partial<CoordinateDebugInfo>) => void;
  getDebugHistory: (anchorId?: string) => CoordinateDebugInfo[];
  clearDebugHistory: () => void;
}

export const useTooltipStore = create<TooltipStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      anchors: new Map(),
      triggers: new Map(),
      positions: new Map(),
      cursorPositions: new Map(),
      visibility: new Map(),
      hoveredAnchors: new Set(),
      _positionUpdateQueue: new Map(),
      _rafId: null,

      // Debug state
      debugMode: false,
      debugHistory: [],
      _maxDebugHistory: 100,

      // Anchor registration
      registerAnchor: (config: AnchorConfig) => {
        set((state) => {
          const anchors = new Map(state.anchors);
          anchors.set(config.id, config);
          return { anchors };
        });
      },

      unregisterAnchor: (id: string) => {
        set((state) => {
          const anchors = new Map(state.anchors);
          const positions = new Map(state.positions);
          const cursorPositions = new Map(state.cursorPositions);
          const visibility = new Map(state.visibility);
          const triggers = new Map(state.triggers);

          anchors.delete(id);
          positions.delete(id);
          cursorPositions.delete(id);
          visibility.delete(id);
          triggers.delete(id);

          return { anchors, positions, cursorPositions, visibility, triggers };
        });
      },

      // Batched position updates for performance
      updateAnchorPosition: (id: string, position: ScreenPosition) => {
        const state = get();

        // Check if position actually changed to prevent infinite re-renders
        const existingPosition = state.positions.get(id);
        if (existingPosition) {
          const unchanged =
            existingPosition.x === position.x &&
            existingPosition.y === position.y &&
            existingPosition.width === position.width &&
            existingPosition.height === position.height;

          if (unchanged) {
            return; // Skip update if position hasn't changed
          }
        }

        // Check if this anchor has a visible tooltip - if so, update immediately
        const vis = state.visibility.get(id);
        const isVisible = vis?.visible ?? false;

        if (isVisible) {
          // Immediate update for visible tooltips to prevent display issues
          set((currentState) => ({
            positions: new Map(currentState.positions).set(id, position),
          }));
        } else {
          // Batch non-visible updates for performance
          state._positionUpdateQueue.set(id, position);

          if (!state._rafId) {
            state._rafId = requestAnimationFrame(() => {
              set((currentState) => ({
                positions: new Map([
                  ...currentState.positions,
                  ...currentState._positionUpdateQueue,
                ]),
                _positionUpdateQueue: new Map(),
                _rafId: null,
              }));
            });
          }
        }
      },

      // Update cursor position immediately (not batched)
      updateCursorPosition: (id: string, position: ScreenPosition | null) => {
        set((state) => {
          const cursorPositions = new Map(state.cursorPositions);
          if (position) {
            cursorPositions.set(id, position);
          } else {
            cursorPositions.delete(id);
          }
          return { cursorPositions };
        });
      },

      // Update anchor content
      updateAnchorContent: (id: string, content: ReactNode | (() => ReactNode)) => {
        set((state) => {
          const anchors = new Map(state.anchors);
          const anchor = anchors.get(id);
          if (anchor) {
            anchor.content = content;
            anchors.set(id, anchor);
          }
          return { anchors };
        });
      },

      // Set anchor availability function
      setAnchorAvailability: (id: string, isAvailable: () => boolean) => {
        set((state) => {
          const anchors = new Map(state.anchors);
          const anchor = anchors.get(id);
          if (anchor) {
            anchor.isAvailable = isAvailable;
            anchors.set(id, anchor);
          }
          return { anchors };
        });
      },

      // Visibility control
      showTooltip: (anchorId: string, triggerId: string) => {
        const state = get();
        const anchor = state.anchors.get(anchorId);

        // Check if anchor exists and is available
        if (!anchor || (anchor.isAvailable && !anchor.isAvailable())) {
          return;
        }

        // Ensure position exists before showing tooltip
        const hasValidPosition = anchor.screenPosition || state.positions.get(anchorId);

        // If no position exists yet, try to flush pending position updates
        if (!hasValidPosition && state._positionUpdateQueue.has(anchorId)) {
          const pendingPosition = state._positionUpdateQueue.get(anchorId);
          if (pendingPosition) {
            // Immediately apply the pending position update
            set((currentState) => ({
              positions: new Map(currentState.positions).set(anchorId, pendingPosition),
              _positionUpdateQueue: new Map(
                [...currentState._positionUpdateQueue].filter(([id]) => id !== anchorId),
              ),
            }));
          }
        }

        set((currentState) => {
          const visibility = new Map(currentState.visibility);
          const triggers = new Map(currentState.triggers);

          // Update visibility state — construct a fresh VisibilityState (and Set)
          // so subscribers comparing entries by identity see the change.
          const prev = visibility.get(anchorId);
          const nextTriggers = new Set(prev?.triggers);
          nextTriggers.add(triggerId);
          visibility.set(anchorId, {
            ...prev,
            visible: true,
            triggers: nextTriggers,
            lastTrigger: triggerId,
          });

          // Track trigger associations
          const nextAnchorTriggers = new Set(triggers.get(anchorId));
          nextAnchorTriggers.add(triggerId);
          triggers.set(anchorId, nextAnchorTriggers);

          return { visibility, triggers };
        });
      },

      hideTooltip: (anchorId: string, triggerId: string) => {
        set((state) => {
          const visibility = new Map(state.visibility);
          const triggers = new Map(state.triggers);
          const prev = visibility.get(anchorId);

          if (prev) {
            const nextTriggers = new Set(prev.triggers);
            nextTriggers.delete(triggerId);
            const stillVisible = nextTriggers.size > 0;
            visibility.set(anchorId, {
              ...prev,
              triggers: nextTriggers,
              visible: stillVisible,
              lastTrigger: stillVisible ? prev.lastTrigger : undefined,
            });
            if (!stillVisible) {
              // Clean up trigger associations when fully hidden
              triggers.delete(anchorId);
            }
          }

          return { visibility, triggers };
        });
      },

      toggleTooltip: (anchorId: string, triggerId: string) => {
        const state = get();
        const vis = state.visibility.get(anchorId);

        if (vis?.triggers.has(triggerId)) {
          state.hideTooltip(anchorId, triggerId);
        } else {
          state.showTooltip(anchorId, triggerId);
        }
      },

      // Hide all tooltips
      hideAll: () => {
        set((state) => {
          const visibility = new Map(state.visibility);
          visibility.forEach((prev, key) => {
            visibility.set(key, {
              ...prev,
              visible: false,
              triggers: new Set(),
              lastTrigger: undefined,
            });
          });
          return { visibility };
        });
      },

      // Force-dismiss an overlay regardless of active triggers
      dismissOverlay: (anchorId: string) => {
        set((state) => {
          const visibility = new Map(state.visibility);
          const triggers = new Map(state.triggers);
          const prev = visibility.get(anchorId);
          if (prev) {
            visibility.set(anchorId, {
              ...prev,
              visible: false,
              triggers: new Set(),
              lastTrigger: undefined,
            });
          }
          triggers.delete(anchorId);
          return { visibility, triggers };
        });
      },

      // Batch update positions
      updatePositions: (updates: Map<string, ScreenPosition>) => {
        set((state) => ({
          positions: new Map([...state.positions, ...updates]),
        }));
      },

      // Computed values
      getVisibleTooltips: () => {
        const state = get();
        const visible: AnchorConfig[] = [];

        state.visibility.forEach((vis, anchorId) => {
          if (vis.visible) {
            const anchor = state.anchors.get(anchorId);
            if (anchor && (!anchor.isAvailable || anchor.isAvailable())) {
              visible.push(anchor);
            }
          }
        });

        return visible;
      },

      hasInteractiveOverlay: () => {
        const state = get();
        let found = false;
        state.visibility.forEach((vis, anchorId) => {
          if (found) return;
          if (vis.visible) {
            const anchor = state.anchors.get(anchorId);
            if (anchor?.interactive) found = true;
          }
        });
        return found;
      },

      isTooltipVisible: (anchorId: string) => {
        const vis = get().visibility.get(anchorId);
        return vis?.visible ?? false;
      },

      getTooltipPosition: (anchorId: string) => {
        const state = get();
        const anchor = state.anchors.get(anchorId);

        if (!anchor || (anchor.isAvailable && !anchor.isAvailable())) {
          return null;
        }

        // Priority: manual position > projected position
        return anchor.screenPosition || state.positions.get(anchorId) || null;
      },

      getEffectivePosition: (anchorId: string) => {
        const state = get();
        const anchor = state.anchors.get(anchorId);

        if (!anchor || (anchor.isAvailable && !anchor.isAvailable())) {
          return null;
        }

        // Manual override takes precedence
        if (anchor.screenPosition) {
          return anchor.screenPosition;
        }

        const boundingBoxPos = state.positions.get(anchorId);
        const cursorPos = state.cursorPositions.get(anchorId);
        const axis = anchor.positioning?.axis || "none";

        // If no cursor position (external trigger), use bounding box
        if (!cursorPos) {
          return boundingBoxPos || null;
        }

        // Apply axis tracking mode
        if (!boundingBoxPos) {
          return cursorPos || null;
        }

        switch (axis) {
          case "none":
            // Use bounding box only (default)
            return boundingBoxPos;
          case "x":
            // Track cursor X, use bounding box Y (preserve dimensions)
            return {
              x: cursorPos.x,
              y: boundingBoxPos.y,
              width: boundingBoxPos.width,
              height: boundingBoxPos.height,
            };
          case "y":
            // Track cursor Y, use bounding box X (preserve dimensions)
            return {
              x: boundingBoxPos.x,
              y: cursorPos.y,
              width: boundingBoxPos.width,
              height: boundingBoxPos.height,
            };
          case "both":
            // Fully track cursor (no dimensions available)
            return cursorPos;
          default:
            return boundingBoxPos;
        }
      },

      // Debug utilities
      enableDebugMode: (enabled: boolean) => {
        set({ debugMode: enabled });
        if (!enabled) {
          set({ debugHistory: [] });
        }
      },

      logCoordinateDebug: (info: Partial<CoordinateDebugInfo>) => {
        const state = get();
        if (!state.debugMode) return;

        const debugInfo: CoordinateDebugInfo = {
          anchorId: info.anchorId || "unknown",
          timestamp: Date.now(),
          ...info,
        };

        set((currentState) => {
          const newHistory = [...currentState.debugHistory, debugInfo];

          // Keep only the most recent entries
          if (newHistory.length > currentState._maxDebugHistory) {
            newHistory.splice(0, newHistory.length - currentState._maxDebugHistory);
          }


          return { debugHistory: newHistory };
        });
      },

      getDebugHistory: (anchorId?: string) => {
        const state = get();
        if (!anchorId) {
          return state.debugHistory;
        }
        return state.debugHistory.filter((entry) => entry.anchorId === anchorId);
      },

      clearDebugHistory: () => {
        set({ debugHistory: [] });
      },
    })),
    { name: "tooltip-3d-store" },
  ),
);
