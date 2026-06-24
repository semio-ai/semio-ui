import { tablerIconRegistry } from "./tabler.generated";
import { semioIconRegistry } from "./semio.generated";
import { roleIconRegistry } from "./roles";
import type { IconRegistry, IconRegistryKeys } from "./types";

/**
 * The zero-config registry: the curated Tabler set that @semio/ui uses internally,
 * merged with @semio/ui's own custom icons, plus the semantic **role** keys. Order
 * matters on collision: custom Semio glyphs win over Tabler (e.g. `"home"`,
 * `"box"`, `"robot"`), and role keys are spread **last** as the authoritative
 * design-system contract (`"close"`, `"disclosure-open"`, `"status-error"`, …).
 *
 * This is intentionally *not* the full Tabler set (~6k icons) — consumers extend
 * it with whatever else they need via `<IconProvider registry={…} />`.
 */
// `satisfies` (not `: IconRegistry`) so the literal keys survive for `keyof`
// below — an explicit annotation would widen this to `Record<string, …>` and
// erase them, defeating the build-time key check.
export const defaultIconRegistry = {
  ...tablerIconRegistry,
  ...semioIconRegistry,
  ...roleIconRegistry,
} satisfies IconRegistry;

/** The icon keys `@semio/ui` ships out of the box (Tabler ∪ Semio ∪ roles). */
export type DefaultIconName = keyof typeof defaultIconRegistry;

/**
 * The checked type for an icon key: the built-in default keys, widened by any
 * keys a consumer registers through {@link IconRegistryKeys} augmentation. With
 * no augmentation `keyof IconRegistryKeys` is `never`, so this is exactly
 * `DefaultIconName`; a consumer that augments gets its own keys added on top.
 */
export type IconName = DefaultIconName | keyof IconRegistryKeys;
