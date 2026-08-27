import noHardcodedOnFillForeground from "./no-hardcoded-on-fill-foreground.mjs";

/**
 * Rules local to this package, covering invariants that only hold here.
 *
 * They live in the package rather than in `@semio/eslint-config` because they name
 * this design system's own class families; a consumer of the shared config has no
 * `variant-responsive-bg` to protect.
 */
export const semioUiPlugin = {
  rules: {
    "no-hardcoded-on-fill-foreground": noHardcodedOnFillForeground,
  },
};
