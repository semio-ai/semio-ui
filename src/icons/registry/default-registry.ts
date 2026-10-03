import { tablerIconRegistry } from "./tabler.generated";
import { semioIconRegistry } from "./semio.generated";
import { solarIconRegistry } from "./solar";
import { roleIconRegistry } from "./roles";
import type { IconRegistry, IconRegistryKeys } from "./types";

/**
 * Disjoint built-in glyph sets and semantic roles. Each key has one owner;
 * downstream packages contribute domain keys rather than replacing shared artwork.
 * Consumer IconProviders may still supply intentional theme overrides.
 */
export const defaultIconRegistry = {
  ...tablerIconRegistry,
  ...semioIconRegistry,
  ...solarIconRegistry,
  ...roleIconRegistry,
} satisfies IconRegistry;

/** The icon keys `@semio/ui` ships out of the box (fallback ∪ Semio ∪ Solar ∪ roles). */
export type DefaultIconName = keyof typeof defaultIconRegistry;

/**
 * The checked type for an icon key: the built-in default keys, widened by any
 * keys a consumer registers through {@link IconRegistryKeys} augmentation. With
 * no augmentation `keyof IconRegistryKeys` is `never`, so this is exactly
 * `DefaultIconName`; a consumer that augments gets its own keys added on top.
 */
export type IconName = DefaultIconName | keyof IconRegistryKeys;
