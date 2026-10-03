/**
 * How many characters wide a number field's units suffix may grow.
 *
 * A unit is free text from whoever authored the value, so it can be any length, and
 * a suffix sized to a long one ("intensity", "dimensionless") pushed the value aside
 * and ran past the field's edge. The suffix is never wider than this many characters
 * plus its padding. A unit of up to four characters — `°`, `%`, `mm`, `fps`, `mm/s` —
 * always shows in full; a longer one is cut with an ellipsis wherever it does not
 * fit, which at the smaller sizes is from its fifth character.
 */
export const MAX_UNITS_CHARACTERS = 4;

/**
 * The suffix's width: its characters up to {@link MAX_UNITS_CHARACTERS}, plus room
 * for its padding.
 *
 * Truncation is visual only. The suffix's value is still the whole unit, so a screen
 * reader announces all of it.
 */
export function unitsSuffixWidth(units: string): string {
  return `${(Math.min(units.length, MAX_UNITS_CHARACTERS) + 2).toString()}ch`;
}
