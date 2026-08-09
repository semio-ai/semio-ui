/**
 * The single import site for Base UI's composite primitive.
 *
 * `@base-ui/react/internals/composite` is an `internals/` path — unstable by
 * definition, and liable to move or graduate to a public API. This module exists
 * so that when it does, exactly one file changes. Nothing else in the package may
 * import that path directly; pattern adapters import from here.
 *
 * Deliberately a re-export and nothing more. It is the *dependency* boundary, not
 * a behavioural one — no defaults, no prop renaming, no orientation choices. Those
 * belong to the per-pattern adapters that sit on top:
 *
 * - `tree/use-tree-navigation` — vertical, `tree`/`treeitem`, expansion keys
 * - `layouts/use-grid-navigation` — two-dimensional, `listbox`/`option`, `cols`
 *
 * Keeping those separate rather than parameterizing one adapter is intentional.
 * Orientation, ARIA vocabulary and element structure are properties of a UI
 * pattern, not configuration of a shared one; Base UI itself ships the composite
 * as a primitive for patterns to compose, and mirroring that keeps each adapter a
 * dozen readable lines instead of a matrix of flags that grows with every new
 * pattern.
 *
 * `useCompositeRoot` is re-exported alongside the components because a **windowed**
 * adapter cannot use `CompositeRoot`. That component renders `CompositeList`, which
 * truncates the element array to the set of items registered from the DOM — for a
 * windowed list, the visible window — collapsing every index calculation onto the
 * rows that happen to be mounted. An adapter that owns the array itself keeps those
 * calculations in the data's index space; see `tree/use-tree-navigation`.
 */
export { CompositeItem, CompositeRoot, useCompositeRoot } from "@base-ui/react/internals/composite";
