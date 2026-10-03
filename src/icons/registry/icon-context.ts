import { createContext } from "react";
import type { IconRegistry } from "./types";

/**
 * Holds the active icon registry. `null` means "no provider above me" — `<Icon>`
 * and `IconProvider` fall back to {@link defaultIconRegistry} at the root.
 *
 * The context is consumed through `@semio/utils`' `useOptionalContext` (the shared
 * context infrastructure used across the Semio libraries) rather than a bespoke
 * `useContext`, so resolution/nesting behaves consistently with the rest of the UI.
 */
export const IconRegistryContext = createContext<IconRegistry | null>(null);
