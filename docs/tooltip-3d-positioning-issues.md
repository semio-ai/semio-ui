# 3D Tooltip Positioning Issues Analysis

## Overview

This document analyzes the current issues with 3D tooltip positioning in the violation renderer system. The tooltips are appearing offset from their intended positions when hovering over violation segments in the 3D canvas.

## Current Issues

### 1. Tooltip Positioning Offset
- **Problem**: Violation tooltips appear offset from their intended position when hovering over violation segments
- **Symptoms**: Tooltips appear at incorrect screen coordinates, not aligned with the 3D objects they're anchored to
- **Impact**: Poor user experience, tooltips don't properly indicate which violation they refer to

### 2. Coordinate System Confusion
- **Problem**: Multiple coordinate transformations happening in different parts of the system without clear alignment
- **Details**: 
  - `useTooltipAnchor` calculates 3D → 2D projection
  - `TooltipHost` maintains frame offset for its container
  - `TooltipInstance` applies frame offset to position tooltips
  - These transformations may not be properly coordinated

### 3. Canvas vs Container Reference Points
- **Problem**: Unclear whether coordinates should be relative to canvas element or TooltipHost container
- **Impact**: Positioning calculations don't account for canvas being positioned inside a larger container
- **Current State**: System attempts to use both references simultaneously

## Root Cause Analysis

### Coordinate Space Pipeline Issues

The fundamental issue is that we have **multiple coordinate spaces** without a clear, consistent transformation pipeline:

```
3D World Space → NDC Space → Viewport Space → Container Space → Screen Space
```

Each transformation needs to be explicit and consistent across all components in the tooltip system.

### Current Implementation Problems

1. **Double Offset Application**: 
   - `useTooltipAnchor` calculates positions relative to one reference point
   - `TooltipInstance` applies frame offset assuming a different reference point
   - This can result in double or incorrect offset application

2. **Reference Point Inconsistency**:
   - Canvas element position vs TooltipHost container position
   - Window viewport vs container viewport
   - Global screen coordinates vs local container coordinates

3. **Projection Calculation Issues**:
   - 3D to 2D projection may not account for canvas viewport offset
   - NDC to screen space conversion assumes full window viewport
   - Container-relative positioning not properly calculated

## Files Requiring Fixes

### Core Issue Files

#### 1. `/packages/ui/src/floating/tooltip-3d/use-tooltip-anchor.ts`
**Responsibility**: 3D to 2D coordinate projection
- **Issues**: 
  - Projection calculation reference point unclear
  - Container vs canvas positioning confusion
  - Frame-by-frame position updates causing recalculation
- **Needs**: Clear coordinate space definition and consistent reference point

#### 2. `/packages/ui/src/floating/tooltip-3d/tooltip-portal.tsx`
**Responsibility**: Final tooltip positioning and rendering
- **Issues**:
  - Frame offset application logic
  - Coordinate transformation to screen space
  - Virtual element positioning for floating-ui
- **Needs**: Consistent coordinate space handling

#### 3. `/packages/ui/src/floating/tooltip-3d/tooltip-host.tsx`
**Responsibility**: Frame offset calculation and container tracking
- **Issues**:
  - Frame offset calculation method
  - Container positioning tracking accuracy
  - Parent context offset composition
- **Needs**: Reliable container position tracking

### Integration Files

#### 4. `/packages/animation/src/components/three/canvas-sheet/violation-renderer.tsx`
**Responsibility**: Tooltip anchor registration and 3D mesh interaction
- **Issues**: 
  - Anchor ID generation and registration
  - Event handling coordination
- **Status**: Recently fixed duplicate tooltip issue with deterministic IDs

#### 5. `/packages/animation/src/components/three/canvas-sheet/canvas-sheet.tsx`
**Responsibility**: TooltipHost wrapper and canvas structure
- **Issues**:
  - TooltipHost positioning in component hierarchy
  - Canvas container structure
- **Recent Changes**: Moved TooltipHost to canvas level to avoid duplication

## Technical Solutions Needed

### 1. Coordinate System Standardization
- Define a single, clear coordinate reference point (recommend: TooltipHost container)
- Document all coordinate transformations explicitly
- Ensure all components use the same reference system

### 2. Position Calculation Refactor
- Consolidate coordinate transformation logic
- Remove duplicate offset applications
- Implement proper 3D → container-local coordinate pipeline

### 3. Reference Point Consistency
- Use TooltipHost container as the single source of truth for positioning
- Calculate all positions relative to container boundary (0,0 to width,height)
- Let TooltipHost handle container-to-screen coordinate transformation

## Resolved Issues

### Duplicate Tooltips ✅
- **Problem**: Multiple identical tooltips appearing for same violation
- **Root Cause**: React StrictMode causing `computeViolationSet` to generate different UUIDs on each run
- **Solution**: Implemented deterministic ID generation based on violation content
- **Files Fixed**: `/packages/animation/src/functions/compute-violation-set.ts`

### Infinite Rendering Loop ✅  
- **Problem**: Tooltip registration causing infinite re-renders
- **Root Cause**: `updateAnchorPosition` triggering state updates 60fps without change detection
- **Solution**: Added position change detection before store updates
- **Files Fixed**: `/packages/ui/src/floating/tooltip-3d/store.ts`

### Multiple TooltipHost Instances ✅
- **Problem**: Nested TooltipHost components creating duplicate tooltip portals
- **Root Cause**: Both animation-sheet-3d and canvas-sheet had TooltipHost wrappers
- **Solution**: Moved TooltipHost to canvas-sheet level only
- **Files Fixed**: `/packages/animation/src/components/three/animation-sheet-3d.tsx`, `/packages/animation/src/components/three/canvas-sheet/canvas-sheet.tsx`

## Next Steps

1. **Audit Current Coordinate Flow**: Trace a single tooltip from 3D position to final screen rendering
2. **Implement Clean Coordinate Pipeline**: Refactor to use consistent reference points
3. **Add Coordinate System Documentation**: Document expected inputs/outputs for each transformation
4. **Create Position Debugging Tools**: Add optional debugging overlays to visualize coordinate transformations
5. **Test with Different Canvas Positions**: Verify positioning works when canvas is not full-screen

## Related Files

- `/packages/animation/src/functions/compute-violation-set.ts` - Deterministic ID generation
- `/packages/animation/src/components/three/violation-panel.tsx` - Tooltip content component
- `/packages/ui/src/floating/tooltip-3d/store.ts` - State management and position tracking
- `/packages/ui/src/floating/tooltip-3d/tooltip-context.tsx` - Context and frame offset management

## Testing Scenarios

When fixing positioning issues, test with:
- Canvas filling entire window
- Canvas in smaller container with margins/padding
- Nested iframe scenarios  
- Different screen sizes and zoom levels
- Multiple monitor setups