import "../make-kit/make.css";

/**
 * Loads the package's real stylesheet into the test document.
 *
 * Importing this module is the whole API. `make-kit/make.css` is the same entry the shipped
 * `dist/semio-ui.css` is built from — the source CSS plus the `@source` scan that emits
 * every utility the components actually name — and `vitest.config.ts` runs it through
 * Tailwind, so a class resolves in a test to what it resolves to in the product.
 *
 * Only tests making **layout** claims need it, and windowing is the reason it exists:
 * spacer-based positioning satisfies a DOM assertion while being visibly wrong on screen,
 * so those assertions have to run against real geometry. Tests previously injected a few
 * hand-written stand-in rules, which could only agree with themselves — had `h-9` or
 * `grid-cols-subgrid` changed, the stand-in would have kept passing.
 *
 * The rest of the suite deliberately runs unstyled: focus, keyboard and selection do not
 * depend on paint, and leaving the stylesheet out stops them quietly coming to rely on it.
 */
export const REAL_STYLESHEET = true;
