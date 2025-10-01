import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface WindowInfo {
  id: string;
  isOpen: boolean;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface WindowContextValue {
  windows: Map<string, WindowInfo>;
  registerWindow: (id: string, parentId?: string, metadata?: Record<string, any>) => void;
  unregisterWindow: (id: string) => void;
  updateWindowMetadata: (id: string, metadata: Record<string, any>) => void;
  isWindowOpen: (id: string) => boolean;
  getChildWindows: (parentId: string) => string[];
  getWindow: (id: string) => WindowInfo | undefined;
}

const WindowContext = createContext<WindowContextValue | null>(null);

export interface WindowProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for managing window relationships and state.
 * Tracks which windows are open and their parent-child relationships.
 */
export function WindowProvider({ children }: WindowProviderProps) {
  const [windows, setWindows] = useState<Map<string, WindowInfo>>(new Map());

  const registerWindow = useCallback((
    id: string,
    parentId?: string,
    metadata?: Record<string, any>
  ) => {
    setWindows(prev => {
      const next = new Map(prev);
      next.set(id, {
        id,
        isOpen: true,
        parentId,
        metadata: metadata || {}
      });
      return next;
    });
  }, []);

  const unregisterWindow = useCallback((id: string) => {
    setWindows(prev => {
      const next = new Map(prev);

      // Also close any child windows
      const childWindows = Array.from(next.values())
        .filter(w => w.parentId === id)
        .map(w => w.id);

      childWindows.forEach(childId => {
        next.delete(childId);
      });

      next.delete(id);
      return next;
    });
  }, []);

  const updateWindowMetadata = useCallback((id: string, metadata: Record<string, any>) => {
    setWindows(prev => {
      const next = new Map(prev);
      const window = next.get(id);
      if (window) {
        next.set(id, {
          ...window,
          metadata: {
            ...window.metadata,
            ...metadata
          }
        });
      }
      return next;
    });
  }, []);

  const isWindowOpen = useCallback((id: string) => {
    return windows.get(id)?.isOpen ?? false;
  }, [windows]);

  const getChildWindows = useCallback((parentId: string) => {
    return Array.from(windows.values())
      .filter(w => w.parentId === parentId)
      .map(w => w.id);
  }, [windows]);

  const getWindow = useCallback((id: string) => {
    return windows.get(id);
  }, [windows]);

  const value = useMemo(() => ({
    windows,
    registerWindow,
    unregisterWindow,
    updateWindowMetadata,
    isWindowOpen,
    getChildWindows,
    getWindow
  }), [
    windows,
    registerWindow,
    unregisterWindow,
    updateWindowMetadata,
    isWindowOpen,
    getChildWindows,
    getWindow
  ]);

  return (
    <WindowContext.Provider value={value}>
      {children}
    </WindowContext.Provider>
  );
}

/**
 * Hook to access the window context.
 * Must be used within a WindowProvider.
 *
 * @example
 * ```tsx
 * const { registerWindow, unregisterWindow } = useWindowContext();
 * ```
 */
export function useWindowContext() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowContext must be used within WindowProvider');
  }
  return context;
}

/**
 * Hook to check if the window context is available.
 * Returns the context if available, null otherwise.
 * Useful for components that can work with or without the context.
 */
export function useWindowContextOptional() {
  return useContext(WindowContext);
}
