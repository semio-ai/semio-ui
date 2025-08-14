import { createContext, useContext, type ReactNode } from "react";
import { type StoreApi, useStore } from "zustand";
import { useTooltipStore, type TooltipStore } from "./store";

interface TooltipProviderProps {
  children: ReactNode;
  store?: StoreApi<TooltipStore>;
}

const TooltipContext = createContext<StoreApi<TooltipStore> | null>(null);

/**
 * Provider component that wraps the application or scene to enable the tooltip system.
 * This component provides the tooltip store context to all child components.
 *
 * @param children - Child components that will have access to the tooltip system
 * @param store - Optional custom store instance (for testing or multiple contexts)
 */
export function TooltipProvider({ children, store }: TooltipProviderProps) {
  // Use provided store or default store
  const tooltipStore = store || useTooltipStore;

  return <TooltipContext.Provider value={tooltipStore}>{children}</TooltipContext.Provider>;
}

/**
 * Hook to access the tooltip store from context.
 * Must be used within a TooltipProvider.
 *
 * @returns The tooltip store
 * @throws Error if used outside of TooltipProvider
 */
export function useTooltipContext() {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error("useTooltipContext must be used within a TooltipProvider");
  }

  return context;
}

/**
 * Hook to use the tooltip store with a selector.
 * Must be used within a TooltipProvider.
 *
 * @param selector - Function to select a slice of the store state
 * @returns The selected state
 */
export function useTooltip<T>(selector: (state: TooltipStore) => T): T {
  const store = useTooltipContext();
  return useStore(store, selector);
}
