/**
 * Shared primitives for hierarchical, collapsible row lists.
 *
 * Standardize the skeleton — tree flattening, collapse state, indentation and
 * guide-lines, the expand toggle, and the row layout — while leaving the
 * bespoke cell content (editors, fields, buttons) to each consuming feature.
 *
 * Accessibility stance:
 * - `TreeToggle` ships the disclosure behavior, so it is accessible by default
 *   (WAI-ARIA APG disclosure: native button, `aria-expanded`, guaranteed name).
 * - `TreeIndent` guide-lines are decorative and `aria-hidden`.
 * - Full tree semantics (`role="tree"`/`treeitem`, roving tabindex, arrow-key
 *   navigation) are intentionally NOT baked in — asserting the role without the
 *   required keyboard support would mislead assistive tech. `TreeRow` exposes
 *   opt-in `role`/`ariaLevel`/`ariaExpanded`/`ariaSelected` seams so a consumer
 *   that adds the keyboard layer can opt into full tree semantics cleanly.
 */
export * from "./flatten-tree";
export * from "./use-collapsible-tree";
export * from "./use-tree-selection";
export * from "./resolve-row-visual";
export * from "./tree-indent";
export * from "./tree-toggle";
export * from "./tree-row";
export * from "./use-tree-navigation";
export * from "./tree-grid";
