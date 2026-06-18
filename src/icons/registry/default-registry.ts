import { tablerIconRegistry } from "./tabler.generated";
import { semioIconRegistry } from "./semio.generated";
import { roleIconRegistry } from "./roles";
import type { IconRegistry } from "./types";

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
export const defaultIconRegistry: IconRegistry = {
  ...tablerIconRegistry,
  ...semioIconRegistry,
  ...roleIconRegistry,
};
