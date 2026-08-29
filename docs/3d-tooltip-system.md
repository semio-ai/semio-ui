# Unified 3D Tooltip System

## Overview

This document outlines the design and implementation of a unified tooltip system for three.js/React Three Fiber contexts. The system is designed to handle tooltips and floating elements in 3D scenes while maintaining separation between positioning logic (anchors) and visibility control (triggers).

## Design Goals

1. **Decoupled Architecture**: Separate tooltip positioning (anchors) from visibility control (triggers)
2. **Local Configuration**: Tooltip content defined close to the elements that display them
3. **Store Independence**: Tooltip state managed separately from scene/animation stores
4. **Programmatic Control**: Support for showing tooltips without direct user interaction
5. **Dynamic Positioning**: Automatic updates when elements move or camera changes
6. **Performance**: Optimized for high-frequency updates in 3D contexts
7. **Extensibility**: Support for context menus and other floating elements

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                   TooltipProvider                        │
│         (Registry of anchors, triggers, and state)       │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│TooltipAnchor │    │TooltipTrigger│    │ TooltipPortal│
│ (3D Element) │    │(Any Element) │    │ (DOM Overlay)│
│              │    │              │    │              │
│ Provides     │    │ Controls     │    │ Renders      │
│ position     │    │ visibility   │    │ content      │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Component Responsibilities

#### TooltipProvider
- Wraps the entire application or scene
- Manages global tooltip state via Zustand store
- Provides context for child components

#### TooltipHost
- Wraps the Canvas component
- Intercepts three.js events
- Manages DOM portal for rendering tooltips
- Handles screen-space projections

#### TooltipAnchor
- Registers tooltip content and positioning preferences
- Updates screen position based on 3D object location
- Defines availability conditions
- Does NOT control visibility

#### TooltipTrigger
- Controls tooltip visibility
- Can be anywhere in the component tree
- References anchors by ID
- Multiple triggers can control the same anchor

#### TooltipPortal
- Renders tooltip content in DOM
- Uses floating-ui for smart positioning
- Handles collision avoidance. Sets no `z-index`: it renders inside the `TooltipHost`
  container, which already puts it over the chrome around it, and a positive value there
  would also beat overlays portalled to `<body>` — which a tooltip should lose to

## State Management with Zustand

### Store Structure

```typescript
import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import type { ReactNode, RefObject } from 'react';
import type * as THREE from 'three';

interface ScreenPosition {
  x: number;
  y: number;
}

interface AnchorConfig {
  id: string;
  ref?: RefObject<THREE.Object3D>;
  content: ReactNode | (() => ReactNode);
  positioning: {
    side?: 'top' | 'right' | 'bottom' | 'left';
    offset?: number;
    // Axis tracking mode (defaults to 'none' if not specified):
    // 'none': Use bounding box only, no cursor tracking (default)
    // 'x': Track cursor X, use bounding box for Y (tooltip appears on side)
    // 'y': Track cursor Y, use bounding box for X
    // 'both': Track both cursor X and Y (tooltip follows cursor)
    axis?: 'none' | 'x' | 'y' | 'both';
    clampToViewport?: boolean;
  };
  // Anchor can specify conditions for when it's available
  isAvailable?: () => boolean;
  // Manual screen position override
  screenPosition?: ScreenPosition;
  // Current cursor position for tracked positioning
  cursorPosition?: ScreenPosition;
}

interface VisibilityState {
  visible: boolean;
  triggers: Set<string>; // Multiple triggers can keep it visible
  lastTrigger?: string;
  priority?: number;
}

interface TooltipStore {
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
  
  // Anchor management
  registerAnchor: (config: AnchorConfig) => void;
  unregisterAnchor: (id: string) => void;
  updateAnchorPosition: (id: string, position: ScreenPosition) => void;
  updateCursorPosition: (id: string, position: ScreenPosition | null) => void;
  updateAnchorContent: (id: string, content: ReactNode) => void;
  setAnchorAvailability: (id: string, isAvailable: () => boolean) => void;
  
  // Trigger management
  showTooltip: (anchorId: string, triggerId: string) => void;
  hideTooltip: (anchorId: string, triggerId: string) => void;
  toggleTooltip: (anchorId: string, triggerId: string) => void;
  
  // Batch operations
  hideAll: () => void;
  updatePositions: (updates: Map<string, ScreenPosition>) => void;
  
  // Computed getters
  getVisibleTooltips: () => AnchorConfig[];
  isTooltipVisible: (anchorId: string) => boolean;
  getTooltipPosition: (anchorId: string) => ScreenPosition | null;
  getEffectivePosition: (anchorId: string) => ScreenPosition | null;
}
```

### Store Implementation

```typescript
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
      
      // Anchor registration
      registerAnchor: (config: AnchorConfig) => {
        set(state => {
          const anchors = new Map(state.anchors);
          anchors.set(config.id, config);
          return { anchors };
        });
      },
      
      unregisterAnchor: (id: string) => {
        set(state => {
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
        state._positionUpdateQueue.set(id, position);
        
        if (!state._rafId) {
          state._rafId = requestAnimationFrame(() => {
            set(state => ({
              positions: new Map([...state.positions, ...state._positionUpdateQueue]),
              _positionUpdateQueue: new Map(),
              _rafId: null,
            }));
          });
        }
      },
      
      // Visibility control
      showTooltip: (anchorId: string, triggerId: string) => {
        const anchor = get().anchors.get(anchorId);
        if (!anchor?.isAvailable?.() ?? true) {
          set(state => {
            const visibility = new Map(state.visibility);
            const triggers = new Map(state.triggers);
            
            // Update visibility state
            const vis = visibility.get(anchorId) || {
              visible: false,
              triggers: new Set(),
            };
            vis.triggers.add(triggerId);
            vis.visible = true;
            vis.lastTrigger = triggerId;
            visibility.set(anchorId, vis);
            
            // Track trigger associations
            const anchorTriggers = triggers.get(anchorId) || new Set();
            anchorTriggers.add(triggerId);
            triggers.set(anchorId, anchorTriggers);
            
            return { visibility, triggers };
          });
        }
      },
      
      hideTooltip: (anchorId: string, triggerId: string) => {
        set(state => {
          const visibility = new Map(state.visibility);
          const vis = visibility.get(anchorId);
          
          if (vis) {
            vis.triggers.delete(triggerId);
            vis.visible = vis.triggers.size > 0;
            if (!vis.visible) {
              vis.lastTrigger = undefined;
            }
            visibility.set(anchorId, vis);
          }
          
          return { visibility };
        });
      },
      
      // Computed values
      getVisibleTooltips: () => {
        const state = get();
        const visible: AnchorConfig[] = [];
        
        state.visibility.forEach((vis, anchorId) => {
          if (vis.visible) {
            const anchor = state.anchors.get(anchorId);
            if (anchor && (anchor.isAvailable?.() ?? true)) {
              visible.push(anchor);
            }
          }
        });
        
        return visible;
      },
      
      isTooltipVisible: (anchorId: string) => {
        const vis = get().visibility.get(anchorId);
        return vis?.visible ?? false;
      },
      
      getTooltipPosition: (anchorId: string) => {
        const state = get();
        const anchor = state.anchors.get(anchorId);
        
        if (!anchor || !(anchor.isAvailable?.() ?? true)) {
          return null;
        }
        
        // Priority: manual position > projected position
        return anchor.screenPosition || state.positions.get(anchorId) || null;
      },
      
      getEffectivePosition: (anchorId: string) => {
        const state = get();
        const anchor = state.anchors.get(anchorId);
        
        if (!anchor || !(anchor.isAvailable?.() ?? true)) {
          return null;
        }
        
        // Manual override takes precedence
        if (anchor.screenPosition) {
          return anchor.screenPosition;
        }
        
        const boundingBoxPos = state.positions.get(anchorId);
        const cursorPos = state.cursorPositions.get(anchorId);
        const axis = anchor.positioning?.axis || 'none';
        
        // If no cursor position (external trigger), use bounding box
        if (!cursorPos) {
          return boundingBoxPos;
        }
        
        // Apply axis tracking mode
        if (!boundingBoxPos) {
          return cursorPos;
        }
        
        switch (axis) {
          case 'none':
            // Use bounding box only (default)
            return boundingBoxPos;
          case 'x':
            // Track cursor X, use bounding box Y (for side positioning)
            return { x: cursorPos.x, y: boundingBoxPos.y };
          case 'y':
            // Track cursor Y, use bounding box X
            return { x: boundingBoxPos.x, y: cursorPos.y };
          case 'both':
            // Fully track cursor
            return cursorPos;
          default:
            return boundingBoxPos;
        }
      },
    })),
    { name: 'tooltip-store' }
  )
);
```

## React Hooks API

### Positioning Strategies

The tooltip system supports four positioning modes that determine how tooltips position themselves relative to their anchors and the cursor:

1. **`axis: 'none'`** (Default)
   - Uses the anchor's bounding box position only
   - No cursor tracking
   - Tooltip appears at a fixed position relative to the element
   - Most predictable and stable positioning

2. **`axis: 'x'`**
   - Tracks the cursor's X position
   - Uses the anchor's bounding box for Y position
   - Tooltip appears on the specified side (top/bottom/left/right) of the element
   - Common for horizontal lists or timeline elements

3. **`axis: 'y'`**
   - Tracks the cursor's Y position  
   - Uses the anchor's bounding box for X position
   - Useful for vertical lists or side panels

4. **`axis: 'both'`**
   - Fully tracks the cursor position
   - Tooltip follows the cursor directly
   - Used when the tooltip should appear at the exact cursor location

**External Trigger Behavior**: When a tooltip is triggered externally (e.g., from a button outside the 3D scene), there is no cursor position available. In this case, the system automatically falls back to using the anchor's bounding box position regardless of the axis setting.

### useTooltipAnchor

Registers a 3D element as a tooltip anchor point.

```typescript
import { useRef, useEffect, useId } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTooltipStore } from './tooltip-store';

interface UseTooltipAnchorOptions {
  id?: string;
  content: ReactNode | (() => ReactNode);
  axis?: 'none' | 'x' | 'y' | 'both'; // Positioning strategy (default: 'none')
  offset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  isAvailable?: () => boolean;
}

export function useTooltipAnchor(options: UseTooltipAnchorOptions) {
  const autoId = useId();
  const id = options.id || autoId;
  const ref = useRef<THREE.Object3D>(null);
  
  const {
    registerAnchor,
    unregisterAnchor,
    updateAnchorPosition,
    updateCursorPosition
  } = useTooltipStore();
  
  // Register anchor on mount
  useEffect(() => {
    registerAnchor({
      id,
      ref,
      content: options.content,
      positioning: {
        axis: options.axis || 'none',
        offset: options.offset,
        side: options.side,
      },
      isAvailable: options.isAvailable,
    });
    
    return () => unregisterAnchor(id);
  }, [id]);
  
  // Update content if it changes
  useEffect(() => {
    useTooltipStore.getState().updateAnchorContent(id, options.content);
  }, [id, options.content]);
  
  // Update bounding box position every frame
  useFrame(({ camera, size }) => {
    if (!ref.current) return;
    
    // Project 3D position to screen space
    const vector = new THREE.Vector3();
    ref.current.getWorldPosition(vector);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (-vector.y * 0.5 + 0.5) * size.height;
    
    updateAnchorPosition(id, { x, y });
  });
  
  // Handle cursor tracking
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (options.axis) {
      updateCursorPosition(id, {
        x: event.clientX,
        y: event.clientY
      });
    }
  }, [id, options.axis]);
  
  const handlePointerLeave = useCallback(() => {
    updateCursorPosition(id, null);
  }, [id]);
  
  return { 
    ref, 
    anchorId: id,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave
  };
}
```

### useTooltipTrigger

Controls tooltip visibility from any component.

```typescript
import { useId, useCallback } from 'react';
import { useTooltipStore } from './tooltip-store';

export function useTooltipTrigger(anchorId: string) {
  const triggerId = useId();
  
  const { showTooltip, hideTooltip, toggleTooltip } = useTooltipStore();
  
  const show = useCallback(() => {
    showTooltip(anchorId, triggerId);
  }, [anchorId, triggerId]);
  
  const hide = useCallback(() => {
    hideTooltip(anchorId, triggerId);
  }, [anchorId, triggerId]);
  
  const toggle = useCallback(() => {
    toggleTooltip(anchorId, triggerId);
  }, [anchorId, triggerId]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      hideTooltip(anchorId, triggerId);
    };
  }, [anchorId, triggerId]);
  
  return { show, hide, toggle };
}
```

### useTooltipControls

Provides imperative control over tooltips.

```typescript
export function useTooltipControls() {
  const store = useTooltipStore();
  
  return {
    showTooltip: (anchorId: string, options?: {
      screenPosition?: { x: number; y: number };
      triggerId?: string;
    }) => {
      const triggerId = options?.triggerId || 'imperative';
      
      if (options?.screenPosition) {
        // Update anchor with manual position
        const anchor = store.anchors.get(anchorId);
        if (anchor) {
          anchor.screenPosition = options.screenPosition;
          store.registerAnchor(anchor);
        }
      }
      
      store.showTooltip(anchorId, triggerId);
    },
    
    hideTooltip: (anchorId: string) => {
      store.hideTooltip(anchorId, 'imperative');
    },
    
    hideAll: () => {
      store.hideAll();
    },
  };
}
```

## Usage Examples

### Basic 3D Tooltip

```tsx
function InteractiveMesh({ data }) {
  const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
    content: <MeshInfo data={data} />,
    // axis defaults to 'none' - tooltip at bounding box
    side: 'top',
    offset: 8,
  });
  
  const { show, hide } = useTooltipTrigger(anchorId);
  
  return (
    <mesh
      ref={ref}
      onPointerOver={show}
      onPointerOut={hide}
      // Only need pointer tracking if axis is specified
    >
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

### External Trigger

```tsx
// In 3D scene
function ViolationMesh({ segment, violations }) {
  const { ref, onPointerMove, onPointerLeave } = useTooltipAnchor({
    id: `violation-${segment.id}`,
    content: <ViolationPanel segment={segment} violations={violations} />,
    axis: 'x', // Track X position only, Y from bounding box
  });
  
  return (
    <mesh 
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* ... */}
    </mesh>
  );
}

// In UI panel - External trigger
function ViolationControls({ segmentId }) {
  const { show, hide } = useTooltipTrigger(`violation-${segmentId}`);
  
  return (
    <button
      onMouseEnter={show}  // Will use bounding box position (no cursor in 3D scene)
      onMouseLeave={hide}
    >
      Show Violation Details
    </button>
  );
}
```

### Programmatic Control

```tsx
function SceneController() {
  const { showTooltip, hideAll } = useTooltipControls();
  
  const highlightObject = (objectId: string) => {
    showTooltip(objectId, {
      screenPosition: { x: window.innerWidth / 2, y: 100 }
    });
  };
  
  return (
    <button onClick={() => highlightObject('target-mesh')}>
      Highlight Target
    </button>
  );
}
```

### Axis Tracking Examples

```tsx
// Default behavior - no cursor tracking
function BasicTooltip({ data }) {
  const { ref, anchorId } = useTooltipAnchor({
    content: <Info data={data} />,
    // axis: 'none' is the default - no need to specify
    side: 'top',
  });
  
  const { show, hide } = useTooltipTrigger(anchorId);
  
  return (
    <mesh
      ref={ref}
      onPointerOver={show}
      onPointerOut={hide}
      // No pointer move/leave handlers needed for 'none' axis
    >
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}

// X-axis tracking - common for timeline elements
function TimelineSegment({ data }) {
  const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
    content: <SegmentInfo data={data} />,
    axis: 'x', // Tracks horizontal cursor movement
    side: 'top', // Appears above the element
  });
  
  const { show, hide } = useTooltipTrigger(anchorId);
  
  return (
    <mesh
      ref={ref}
      onPointerOver={show}
      onPointerOut={(e) => {
        hide();
        onPointerLeave();
      }}
      onPointerMove={onPointerMove}
    >
      <planeGeometry args={[10, 1]} />
      <meshBasicMaterial />
    </mesh>
  );
}

// Y-axis tracking - useful for vertical lists
function VerticalListItem({ item }) {
  const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
    content: <ItemDetails item={item} />,
    axis: 'y', // Tracks vertical cursor movement
    side: 'right', // Appears to the right
  });
  
  const { show, hide } = useTooltipTrigger(anchorId);
  
  return (
    <mesh
      ref={ref}
      onPointerOver={show}
      onPointerOut={(e) => {
        hide();
        onPointerLeave();
      }}
      onPointerMove={onPointerMove}
    >
      {/* mesh content */}
    </mesh>
  );
}

// Both axes - tooltip follows cursor exactly
function FreeFloatingTooltip({ data }) {
  const { ref, anchorId, onPointerMove, onPointerLeave } = useTooltipAnchor({
    content: <CursorInfo data={data} />,
    axis: 'both', // Fully tracks cursor
    offset: 12, // Offset from cursor
  });
  
  const { show, hide } = useTooltipTrigger(anchorId);
  
  return (
    <mesh
      ref={ref}
      onPointerOver={show}
      onPointerOut={(e) => {
        hide();
        onPointerLeave();
      }}
      onPointerMove={onPointerMove}
    >
      {/* mesh content */}
    </mesh>
  );
}
```

### Conditional Availability

```tsx
function ConditionalMesh({ isInBounds }) {
  const { ref, onPointerMove, onPointerLeave } = useTooltipAnchor({
    id: 'conditional-mesh',
    content: <MeshDetails />,
    axis: 'both',
    isAvailable: () => isInBounds,
  });
  
  const { show, hide } = useTooltipTrigger('conditional-mesh');
  
  return (
    <mesh
      ref={ref}
      onPointerOver={show}
      onPointerOut={(e) => {
        hide();
        onPointerLeave();
      }}
      onPointerMove={onPointerMove}
    >
      {/* ... */}
    </mesh>
  );
}
```

### Multiple Triggers

```tsx
function MultiTriggerExample() {
  // Define the anchor in the 3D scene
  function TargetMesh() {
    const { ref, anchorId } = useTooltipAnchor({
      content: <TargetInfo />,
    });
    
    const { show: showOnHover, hide: hideOnHover } = useTooltipTrigger(anchorId);
    
    return (
      <mesh
        ref={ref}
        onPointerOver={showOnHover}
        onPointerOut={hideOnHover}
      >
        {/* ... */}
      </mesh>
    );
  }
  
  // External trigger 1: Button
  function ShowButton() {
    const { show, hide } = useTooltipTrigger('target-mesh');
    
    return (
      <button
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        Preview Target
      </button>
    );
  }
  
  // External trigger 2: Toggle
  function PersistentToggle() {
    const { show, hide } = useTooltipTrigger('target-mesh');
    const [enabled, setEnabled] = useState(false);
    
    useEffect(() => {
      if (enabled) show();
      else hide();
    }, [enabled]);
    
    return (
      <Toggle
        checked={enabled}
        onChange={setEnabled}
        label="Keep tooltip visible"
      />
    );
  }
}
```

## Performance Considerations

### Position Update Batching

The store implementation includes automatic batching of position updates using `requestAnimationFrame`:

```typescript
updateAnchorPosition: (id: string, position: ScreenPosition) => {
  const state = get();
  state._positionUpdateQueue.set(id, position);
  
  if (!state._rafId) {
    state._rafId = requestAnimationFrame(() => {
      set(state => ({
        positions: new Map([...state.positions, ...state._positionUpdateQueue]),
        _positionUpdateQueue: new Map(),
        _rafId: null,
      }));
    });
  }
}
```

### Selective Subscriptions

Components should use selective subscriptions to avoid unnecessary re-renders:

```typescript
function TooltipRenderer({ anchorId }) {
  // Only re-render when this specific anchor's visibility changes
  const visible = useTooltipStore(
    useShallow(state => state.visibility.get(anchorId)?.visible)
  );
  
  // Only re-render when this specific position updates
  const position = useTooltipStore(
    state => state.positions.get(anchorId),
    shallow // Use shallow equality
  );
}
```

### Viewport Culling

Implement viewport culling to avoid processing off-screen tooltips:

```typescript
useFrame(({ camera, size }) => {
  if (!ref.current) return;
  
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(matrix);
  
  // Only update if object is in view
  if (frustum.intersectsObject(ref.current)) {
    const vector = new THREE.Vector3();
    ref.current.getWorldPosition(vector);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (-vector.y * 0.5 + 0.5) * size.height;
    
    updateAnchorPosition(id, { x, y });
  }
});
```

### Debounced Content Updates

For expensive content generation:

```typescript
import { useDebouncedCallback } from 'use-debounce';

function DynamicTooltip({ data }) {
  const [content, setContent] = useState(null);
  
  const updateContent = useDebouncedCallback(
    (newData) => {
      setContent(<ExpensiveComponent data={newData} />);
    },
    100 // 100ms debounce
  );
  
  useEffect(() => {
    updateContent(data);
  }, [data]);
  
  useTooltipAnchor({
    content: content || <Loading />,
  });
}
```

## Integration with Existing Systems

### Using with TrackedTooltip

The existing `TrackedTooltip` component can be adapted to work with this system:

```typescript
function TooltipPortal() {
  const visibleTooltips = useTooltipStore(state => state.getVisibleTooltips());
  
  return (
    <>
      {visibleTooltips.map(anchor => {
        // Get effective position based on axis mode and cursor availability
        const position = useTooltipStore.getState().getEffectivePosition(anchor.id);
        if (!position) return null;
        
        return (
          <TrackedTooltip
            key={anchor.id}
            virtualElement={createVirtualElement(position)}
            open={true}
            axis={anchor.positioning.axis || 'none'}
            side={anchor.positioning.side}
            offset={anchor.positioning.offset}
          >
            {typeof anchor.content === 'function' 
              ? anchor.content() 
              : anchor.content}
          </TrackedTooltip>
        );
      })}
    </>
  );
}
```

### Context Menu Support

Extend the system for context menus:

```typescript
interface ContextMenuConfig extends AnchorConfig {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
}

export function useContextMenu(options: Omit<ContextMenuConfig, 'content'>) {
  const { ref } = useTooltipAnchor({
    ...options,
    content: (
      <ContextMenu 
        items={options.items}
        onSelect={options.onSelect}
      />
    ),
  });
  
  const { show } = useTooltipTrigger(options.id);
  
  const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.nativeEvent.preventDefault();
    show();
  };
  
  return { ref, onContextMenu: handleContextMenu };
}
```

## Future Enhancements

1. **Tooltip Chaining**: Support parent-child tooltip relationships
2. **Animation**: Smooth transitions for tooltip appearance/disappearance
3. **Collision Detection**: Prevent tooltips from overlapping
4. **Persistence**: Save tooltip preferences/state
5. **Accessibility**: Keyboard navigation and screen reader support
6. **Touch Support**: Handle touch gestures on mobile devices
7. **Multi-viewport**: Support for multiple viewports/cameras

## Migration Guide

For migrating existing tooltip implementations:

1. Replace direct DOM event handlers with `useTooltipAnchor` and `useTooltipTrigger`
2. Move tooltip content definitions to the anchor registration
3. Update external triggers to use `useTooltipTrigger` with the anchor ID
4. Remove tooltip state from component stores
5. Update positioning logic to use the automatic screen projection

## Dependencies

- `zustand`: State management
- `@floating-ui/react`: Smart positioning
- `@react-three/fiber`: Three.js React integration
- `three`: 3D graphics library
- `immer`: Immutable state updates (optional)
- `use-debounce`: Performance optimization (optional)