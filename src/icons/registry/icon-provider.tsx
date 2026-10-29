import { useMemo, type ReactNode } from "react";
import { useOptionalContext } from "../../context/context-providers";
import { IconRegistryContext } from "./icon-context";
import { defaultIconRegistry } from "./default-registry";
import type { IconRegistry } from "./types";

export interface IconProviderProps {
  /** Icons to make available to descendant `<Icon>` calls. */
  registry: IconRegistry;
  /**
   * Merge over the parent/default registry (`true`, default) or replace it
   * entirely (`false`). Merging composes nested providers — the nearest provider's
   * keys win — while still inheriting everything an ancestor (or the default) set.
   */
  extend?: boolean;
  children: ReactNode;
}

/**
 * Provides an icon registry to descendants. Built on the context
 * infrastructure (`useOptionalContext`) for consistent, nesting-aware resolution,
 * with one registry-specific extension: `extend` merges over the parent rather
 * than replacing it, so nested providers compose.
 */
export function IconProvider({ registry, extend = true, children }: IconProviderProps) {
  // Resolve up the tree; fall back to the default set at the root.
  const parent = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  const value = useMemo(
    () => (extend ? { ...parent, ...registry } : registry),
    [parent, registry, extend],
  );
  return <IconRegistryContext.Provider value={value}>{children}</IconRegistryContext.Provider>;
}
