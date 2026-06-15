import { tablerIconRegistry } from "./tabler.generated";
import { semioIconRegistry } from "./semio.generated";
import type { IconRegistry } from "./types";

/**
 * The zero-config registry: the curated Tabler set that @semio/ui uses internally,
 * merged with @semio/ui's own custom icons. Custom icons are spread **last**, so a
 * Semio glyph wins on key collision (e.g. `"home"`, `"box"`, `"robot"`).
 *
 * This is intentionally *not* the full Tabler set (~6k icons) — consumers extend
 * it with whatever else they need via `<IconProvider registry={…} />`.
 */
export const defaultIconRegistry: IconRegistry = {
  ...tablerIconRegistry,
  ...semioIconRegistry,
};
