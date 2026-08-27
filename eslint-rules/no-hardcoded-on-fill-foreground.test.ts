import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";
// @ts-expect-error -- plain JS rule module, no type declarations
import rule from "./no-hardcoded-on-fill-foreground.mjs";

/**
 * The rule's own falsification.
 *
 * A lint rule that passes against a known violation is worse than no rule, because it
 * certifies the absence of what it cannot see. So the invalid cases below are not
 * illustrations: they are every spelling this defect has actually taken in this
 * package, plus the ones it would take next. Each must be reported.
 *
 * The valid cases matter as much. A rule that fires on `text-sm`, or on the derived
 * token that IS the fix, gets disabled at the first inconvenient site — and then it
 * protects nothing.
 */

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser as never,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

const EXAMPLE_ALLOW = [
  {
    file: "src/floating/example.tsx",
    classes: ["text-white"],
    reason: "Illustrative entry for the rule's own test; not a real exemption.",
  },
];

ruleTester.run("no-hardcoded-on-fill-foreground", rule, {
  valid: [
    // The fix: a foreground derived from the fill.
    { code: `<div className="variant-responsive-bg text-[var(--on-standard-color)]" />` },
    { code: `<div className={clsx("check-indicator", "text-[var(--on-accent-color)]")} />` },
    // A fill class with no foreground at all — the foreground lives in the CSS class.
    { code: `<div className="variant-checkbox-bg rounded-xs" />` },
    // A literal foreground with NO fill class. Most of these are correct: content on a
    // neutral or card background flips WITH the theme. Reporting them would make the
    // rule a nuisance and bury the cases that matter.
    { code: `<div className="text-black dark:text-white" />` },
    { code: `<input className={clsx("text-neutral-600 focus:text-black")} />` },
    // `text-` utilities that are not colours.
    { code: `<div className="variant-responsive-bg text-sm text-center text-nowrap" />` },
    { code: `<div className="variant-static-bg text-[7px] font-bold" />` },
    // An arbitrary value that is a length, not a colour.
    { code: `<div className="variant-responsive-bg text-[10px]" />` },
    // An allowlist entry suppresses exactly the class it names, in the file it names.
    {
      code: `<div className="card-invert text-white" />`,
      filename: "/repo/packages/ui/src/floating/example.tsx",
      options: [{ allow: EXAMPLE_ALLOW }],
    },
  ],

  invalid: [
    // The original spelling, at the site it shipped from.
    {
      code: `<button className={clsx("variant-responsive-bg", "text-white dark:text-black")} />`,
      errors: 2,
    },
    // Half of it. Dropping the `dark:` half does not make it correct — the fill still
    // does not flip — so a rule keyed on the pair would have missed this.
    { code: `<div className="variant-responsive-bg text-white" />`, errors: 1 },
    // The same defect in different words. This one was real: ToggleSquare's checked
    // glyph, at 1.52:1 on warning in light mode.
    {
      code: `<div className={clsx("variant-checkbox-bg", "data-[state=checked]:text-neutral-200", "dark:data-[state=checked]:text-neutral-800")} />`,
      errors: 2,
    },
    // Arbitrary literal colours, which no palette-name list alone would catch.
    { code: `<div className="variant-static-bg text-[#ffffff]" />`, errors: 1 },
    { code: `<div className="variant-mock-inner-item text-[oklch(1_0_0)]" />`, errors: 1 },
    // An opacity modifier does not change what the colour is.
    { code: `<div className="variant-responsive-bg text-white/75" />`, errors: 1 },
    // The foreground reached through a variant prefix.
    { code: `<div className="grid-list-item-indicator hover:text-black" />`, errors: 1 },
    // A conditional: both branches are read, because a fill and a literal foreground
    // that are mutually exclusive by condition still read as this bug at a glance.
    {
      code: `<div className={clsx(a && "variant-responsive-bg", b ? "text-white" : "text-sm")} />`,
      errors: 1,
    },
    // A tint suffix on the fill class — matched by shape, not by an enumerated list.
    { code: `<div className="variant-static-bg-25 text-black" />`, errors: 1 },
    // A fill class the rule has never been told about, matched by that same shape. This
    // is what stops the next sibling arriving unprotected.
    { code: `<div className="variant-future-thing-bg text-white" />`, errors: 1 },
    // An allowlist entry is scoped to its file: the same class elsewhere still reports.
    {
      code: `<div className="card-invert text-white" />`,
      filename: "/repo/packages/ui/src/floating/other.tsx",
      options: [{ allow: EXAMPLE_ALLOW }],
      errors: 1,
    },
  ],
});
