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
 * protects nothing. That cuts hardest on the background half: `bg-` is mostly NOT a
 * colour prefix — `bg-cover`, `bg-center`, `bg-no-repeat`, `bg-linear-to-r` — so a
 * shape match on `bg-*` would fire on positioning utilities that have nothing to do
 * with the fill, and would be turned off within a day.
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
    // Keywords that name no colour. They defer to whatever the fill class decided,
    // which is what this rule asks for; flagging them blocks the correct escape hatch.
    { code: `<div className="variant-responsive-bg text-inherit" />` },
    { code: `<div className="variant-responsive-bg text-current" />` },
    // Fills that match the `variant-*-bg` SHAPE but are not what their content is read
    // against. Reporting these would demand a wrong fix, and a rule that does that gets
    // disabled. `-header-button-bg` fills from `bg-layout-*-deep-inset`, which flips
    // WITH the theme, so a theme-flipped foreground on it is correct.
    { code: `<div className="variant-responsive-header-button-bg text-white dark:text-black" />` },
    // Transparent at rest.
    { code: `<div className="variant-responsive-appearing-bg text-white" />` },
    // A 20% tint, not the fill.
    { code: `<div className="variant-mock-item-bg text-white" />` },
    // A 25% tint over whatever is beneath it — the Tabs indicator. What its content is
    // read against is the composite, which depends on the host, so this rule cannot say
    // which foreground is right and does not try.
    { code: `<div className="variant-static-bg-25 text-black" />` },
    // An accent text class away from any fill: correct and common on a card ground.
    { code: `<div className="card variant-responsive-text" />` },
    // Opposite branches of one ternary can never render together. This is `Tooltip`'s
    // real markup; reporting it would be a demand to break working code.
    {
      code: `const C = ({ i }) => <div className={clsx(i ? "card-invert" : "variant-static-text card")} />;`,
    },
    // `Button`'s real markup: the fill and the accent-text class belong to different
    // `visuals` values. Not provably exclusive to a linter, but an accent-text class is
    // the normal ALTERNATIVE to a fill, so it is only reported in the same scope.
    {
      code: `const C = ({ v }) => <button className={clsx(v === "default" && "variant-responsive-bg", v === "inverted" && "variant-responsive-text")} />;`,
    },
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

    // --- the BACKGROUND half ---
    // A literal background with NO fill class. This is the ordinary case — most boxes
    // in the package paint their own ground and derive nothing.
    { code: `<div className="bg-neutral-300/60 dark:bg-neutral-700/60" />` },
    // `bg-` is mostly not a colour prefix. None of these touch the fill, and firing on
    // them is what would get the rule disabled.
    { code: `<div className="variant-static-bg bg-cover bg-center bg-no-repeat" />` },
    { code: `<div className="variant-responsive-bg bg-linear-to-r bg-clip-text" />` },
    { code: `<div className="card-invert bg-origin-border bg-blend-multiply" />` },
    // Keywords that paint nothing, so the fill behind them is still what content reads
    // against. `bg-transparent` is how an element defers to the fill deliberately.
    { code: `<div className="variant-static-bg bg-transparent" />` },
    { code: `<div className="variant-checkbox-bg bg-inherit" />` },
    // The fill token itself, spelled as an arbitrary value. It paints the same colour
    // the class does, so the derivation still describes what is there.
    { code: `<div className="variant-static-bg bg-[var(--standard-color)]" />` },
    // Opposite branches of one ternary can never render together — a "filled" variant
    // and a "plain" one is the normal way to write this.
    {
      code: `const C = ({ f }) => <div className={clsx(f ? "variant-static-bg" : "bg-neutral-100")} />;`,
    },
    // A fill that matches the `variant-*-bg` shape but is not in FILL_CLASSES. The
    // background half inherits that list, so it inherits the reason for it too.
    { code: `<div className="variant-responsive-header-button-bg bg-white" />` },
  ],

  invalid: [
    // An accent TEXT class on a fill. Worse than a literal, because it looks like the
    // responsible choice: for a named variant it resolves to the same -500 shade the
    // fill paints with, so content inheriting it renders at exactly 1:1. This was
    // `ImageInput`'s fallback initial, invisible in both themes.
    { code: `<div className="variant-responsive-bg variant-responsive-text" />`, errors: 1 },
    // Hoisted into a module constant and spread into a `className` elsewhere. The
    // pairing never appears in a `className` attribute, so an attribute-only rule walks
    // straight past it — and hoisting shared classes is the natural thing to do.
    {
      code: `const SLOT = clsx("variant-on-fill-slot", "text-white");\nexport const C = () => <div className={SLOT} />;`,
      errors: 1,
    },
    // A LITERAL colour under a different `&&` guard from the fill. Not provably
    // exclusive, and it has no innocent reading, so it is reported — this is exactly
    // what `Avatar` shipped, with the colour on one guard and the fill on another.
    {
      code: `const C = ({ v, o }) => <span className={clsx((v === "default" || v === "border") && "text-white dark:text-black", v === "default" && o && "variant-responsive-bg")} />;`,
      errors: 2,
    },
    // `ToggleSquare`'s shape: fill chosen by a ternary, colour by a separate guard.
    {
      code: `const C = ({ a, c }) => <button className={clsx(a ? "grid-list-item-indicator" : "variant-checkbox-bg", !c && "data-[state=checked]:text-neutral-200")} />;`,
      errors: 1,
    },
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
    // An allowlist entry is scoped to its file: the same class elsewhere still reports.
    {
      code: `<div className="card-invert text-white" />`,
      filename: "/repo/packages/ui/src/floating/other.tsx",
      options: [{ allow: EXAMPLE_ALLOW }],
      errors: 1,
    },

    // --- the BACKGROUND half ---
    // The entity tile's spelling, written in one expression. `Avatar`'s fallback paints
    // `variant-static-bg`, and this covers it — the derived foreground stays behind,
    // computed for a fill nothing paints. Measured at 1.176:1 in light mode.
    {
      code: `<div className={clsx("variant-static-bg", "bg-neutral-300/60 dark:bg-neutral-700/60")} />`,
      errors: 2,
    },
    // Half of it. Dropping the `dark:` half does not make it correct: the fill is
    // theme-invariant, so one background covers it in both themes.
    { code: `<div className="variant-static-bg bg-neutral-300/60" />`, errors: 1 },
    // No opacity modifier at all — an opaque cover is the worst case, not a lesser one.
    { code: `<div className="variant-responsive-bg bg-white" />`, errors: 1 },
    // Arbitrary literal colours, which no palette-name list alone would catch.
    { code: `<div className="card-invert bg-[#dcdcdc]" />`, errors: 1 },
    { code: `<div className="variant-mock-inner-item bg-[oklch(0.8_0_0)]" />`, errors: 1 },
    // Hoisted into a module constant and spread into a `className` elsewhere — the
    // shape a shared box constant takes, and the one an attribute-only rule walks past.
    {
      code: `const BOX = clsx("variant-on-fill-slot", "bg-neutral-300/60");\nexport const C = () => <div className={BOX} />;`,
      errors: 1,
    },
    // Fill and background under two separate `&&` guards. Not provably exclusive — both
    // may hold — and if they do, the background is the surface the foreground was not
    // derived for. Reported for the same reason a literal foreground is.
    {
      code: `const C = ({ v, o }) => <span className={clsx(v === "default" && "variant-responsive-bg", o && "bg-neutral-200")} />;`,
      errors: 1,
    },
    // Naming a foreground to go with the background does not repair it: it moves the
    // pairing into the caller, where the variant that chose the fill is not in scope.
    // Both halves report.
    { code: `<div className="variant-static-bg bg-neutral-300 text-white" />`, errors: 2 },
    // The background half reads the same allowlist as the foreground half.
    {
      code: `<div className="card-invert bg-neutral-300" />`,
      filename: "/repo/packages/ui/src/floating/other.tsx",
      options: [{ allow: EXAMPLE_ALLOW }],
      errors: 1,
    },
  ],
});
