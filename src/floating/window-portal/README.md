# WindowPortal Component

A React component that renders content in a separate browser window using React Portals, maintaining context and state synchronization with the parent window.

## Overview

The `WindowPortal` component enables applications to spawn content in native browser windows while maintaining the React component hierarchy and context chain. This is particularly useful for creating pop-out views, multi-window interfaces, and detachable panels.

## Features

- **Native Browser Windows**: Creates actual browser windows, not modals or overlays
- **React Portal Based**: Uses React's createPortal to maintain component tree
- **Context Preservation**: Child windows share React contexts with parent
- **Style Inheritance**: Automatically copies styles from parent window
- **Lifecycle Management**: Proper cleanup when windows close
- **TypeScript Support**: Fully typed API
- **Position Control**: Smart window positioning with offset options
- **Focus Management**: Handles window focus events

## Installation

The WindowPortal is part of the `@semio/ui` package:

```typescript
import { WindowPortal } from '@semio/ui';
```

## Basic Usage

```tsx
import { useState } from 'react';
import { WindowPortal } from '@semio/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Window
      </button>

      <WindowPortal
        isOpen={isOpen}
        windowId="my-window"
        title="My Pop-out Window"
        onClose={() => setIsOpen(false)}
        width={800}
        height={600}
      >
        <div>
          Content rendered in separate window
        </div>
      </WindowPortal>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls whether the window is open |
| `windowId` | `string` | - | Unique identifier for the window |
| `title` | `string` | `'Pop-out Window'` | Window title |
| `onClose` | `() => void` | - | Callback when window closes |
| `children` | `ReactNode` | - | Content to render in the window |
| `width` | `number` | `1200` | Window width in pixels |
| `height` | `number` | `800` | Window height in pixels |
| `features` | `WindowFeatures` | `{}` | Window configuration options |
| `copyStyles` | `boolean` | `true` | Whether to copy styles from parent |
| `className` | `string` | - | Additional CSS classes for window body |

### WindowFeatures Options

```typescript
interface WindowFeatures {
  left?: number;           // Window left position
  top?: number;            // Window top position
  offsetFromParent?: boolean; // Position relative to parent
  resizable?: boolean;     // Allow window resizing (default: true)
  scrollbars?: boolean;    // Show scrollbars (default: true)
  toolbar?: boolean;       // Show toolbar (default: false)
  menubar?: boolean;       // Show menubar (default: false)
  location?: boolean;      // Show location bar (default: false)
  status?: boolean;        // Show status bar (default: false)
}
```

## Context Sharing

Child windows automatically share React contexts with their parent through the portal mechanism:

```tsx
function App() {
  const [sharedState, setSharedState] = useState(0);

  return (
    <MyContext.Provider value={{ sharedState, setSharedState }}>
      <WindowPortal isOpen={isOpen} windowId="child">
        {/* This component has access to MyContext */}
        <ChildComponent />
      </WindowPortal>
    </MyContext.Provider>
  );
}
```

## Window Management

For managing multiple windows, use the optional `WindowProvider`:

```tsx
import { WindowProvider, useWindowContext } from '@semio/ui';

function App() {
  return (
    <WindowProvider>
      <MyApplication />
    </WindowProvider>
  );
}

function MyApplication() {
  const { getChildWindows, isWindowOpen } = useWindowContext();
  
  // Track and manage multiple windows
  const childWindows = getChildWindows('parent-id');
  const isChildOpen = isWindowOpen('child-id');
}
```

## Animation Sheet Integration

The WindowPortal was specifically designed to work with AnimationSheet components:

```tsx
function AnimationSheetWithPopout({ isChild = false, ...props }) {
  const [popped, setPopped] = useState(false);

  return (
    <>
      {/* Main animation sheet */}
      <AnimationSheet {...props}>
        {!isChild && (
          <Button onClick={() => setPopped(true)}>
            Pop Out
          </Button>
        )}
      </AnimationSheet>

      {/* Pop-out window */}
      {!isChild && (
        <WindowPortal
          isOpen={popped}
          windowId="animation-child"
          title="Animation View"
          onClose={() => setPopped(false)}
        >
          <AnimationSheetWithPopout
            {...props}
            isChild={true}
          />
        </WindowPortal>
      )}
    </>
  );
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may have popup restrictions)
- **Mobile**: Not supported (desktop only feature)

## Known Limitations

1. **Popup Blockers**: The first window open must be triggered by user interaction
2. **Cross-Origin**: All windows must be same-origin
3. **Style Copying**: Some CSS rules may not copy due to CORS restrictions
4. **Performance**: Each window has its own render context

## Development

### Testing

```bash
# Run tests
npm test

# Run Storybook to see examples
npm run dev
```

### Storybook Examples

View the WindowPortal stories in Storybook at:
- Basic usage
- Parent-child windows
- Configurable options
- Complex content rendering

## Architecture

The WindowPortal component uses:
1. `window.open()` to create native browser windows
2. `React.createPortal()` to render content while maintaining context
3. Event listeners for window lifecycle management
4. Style cloning for consistent appearance

## Future Enhancements

- Window state persistence (position, size)
- Window docking/snapping
- Multi-monitor support improvements
- Window communication channels
- Saved window layouts