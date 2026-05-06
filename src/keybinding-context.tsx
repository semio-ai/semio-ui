import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * A single keybinding definition: the key combo(s) and optional display label.
 * Key combos use Mantine hotkey syntax: "mod+x", "space", "ArrowLeft", etc.
 */
export interface KeybindingDefinition {
  /** Key combo strings in Mantine hotkey syntax (e.g. ["mod+x"]). */
  keys: string[];
  /** Human-readable label for the action (e.g. "Cut"). */
  label?: string;
}

/**
 * A map of namespaced action IDs to their keybinding definitions.
 * Packages should namespace their actions (e.g. "animation:delete", "scene:focus").
 */
export type KeybindingMap = Record<string, KeybindingDefinition>;

const KeybindingContext = createContext<KeybindingMap>({});

export interface KeybindingProviderProps {
  /** Keybinding definitions to provide. Merged with any parent provider's bindings. */
  value: KeybindingMap;
  children: ReactNode;
}

/**
 * Provides keybinding definitions to descendant components.
 * Inherits and merges with any parent KeybindingProvider — inner values override outer
 * for the same action ID, and new action IDs are added.
 *
 * @example
 * ```tsx
 * // Studio root: provides all defaults + user overrides
 * <KeybindingProvider value={{ ...animationKeybindings, ...userOverrides }}>
 *   <App />
 * </KeybindingProvider>
 *
 * // Nested override for a specific context
 * <KeybindingProvider value={{ "animation:delete": { keys: ["backspace"] } }}>
 *   <SpecialPanel />
 * </KeybindingProvider>
 * ```
 */
export function KeybindingProvider({ value, children }: KeybindingProviderProps) {
  const parent = useContext(KeybindingContext);
  const merged = useMemo(() => ({ ...parent, ...value }), [parent, value]);
  return <KeybindingContext.Provider value={merged}>{children}</KeybindingContext.Provider>;
}

/**
 * Returns the full keybinding map from the nearest provider (including inherited bindings).
 */
export function useKeybindingMap(): KeybindingMap {
  return useContext(KeybindingContext);
}

/**
 * Returns the keybinding definition for a specific action ID, or undefined if not registered.
 */
export function useKeybinding(actionId: string): KeybindingDefinition | undefined {
  const map = useContext(KeybindingContext);
  return map[actionId];
}
