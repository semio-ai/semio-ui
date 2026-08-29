/**
 * An element that carries a variant-fill class must name NEITHER HALF of the pairing —
 * not its own foreground, and not its own background.
 *
 * The fill classes paint from `--standard-color` or `--accent-color`. Those are
 * variant-driven and, in `--standard-color`'s case, identical in both themes — so a
 * foreground chosen by colour scheme is wrong in one theme for every hue, and a
 * foreground chosen by hand is wrong for every variant but the one it was picked
 * against. Each fill class declares a foreground derived from itself, for every state
 * it fills; a caller's job is to name neither half.
 *
 * BOTH DIRECTIONS ARE THE SAME DEFECT. A fill class declares a fill and the foreground
 * derived from it in one rule. Naming either half separately leaves the two describing
 * different surfaces, and the half that is left behind still applies — so nothing looks
 * broken at the call site. Naming the FOREGROUND leaves a colour picked against a
 * variant or a theme it does not belong to. Naming the BACKGROUND is worse in one
 * respect: a `bg-*` utility sits in a LATER CASCADE LAYER than a `variant-*` component
 * class, so it wins outright while the class's `color` stays behind, derived for a fill
 * nothing paints. Every class is present, every class applies, and the content is read
 * against a colour it does not sit on.
 *
 * THREE KINDS ARE REPORTED, because all three shipped here:
 *
 *  - A LITERAL colour — `text-white`, `text-neutral-200`, `text-[#fff]`. Keying on
 *    `text-white dark:text-black` is evaded by each of the others, and every one of
 *    them was a real site in this package.
 *  - A VARIANT TEXT class — `variant-responsive-text`, `variant-static-text`. These
 *    look like the responsible choice and are worse than a literal: they resolve to an
 *    accent TEXT shade, which for a named variant is the same -500 the fill paints
 *    with, so content inheriting it renders at exactly 1:1. That is what made
 *    `ImageInput`'s fallback initial invisible.
 *  - A LITERAL BACKGROUND — `bg-neutral-300/60`, `bg-white`, `bg-[#dcdcdc]`. The fix is
 *    to DELETE it, not to derive it: the fill class is already painting a ground, and
 *    a second one in front of it is what breaks the derivation. Naming a foreground to
 *    match only moves the pairing into the caller, where the variant that chose the
 *    fill is no longer in scope.
 *
 * WHY A SOURCE RULE RATHER THAN A STYLESHEET CHECK. The fill class and the foreground
 * class are composed at the call site. Nothing in the compiled stylesheet pairs them,
 * so no amount of CSS analysis can see the co-occurrence.
 *
 * WHY THE FILL LIST IS EXPLICIT rather than a `variant-*-bg` shape match. A shape match
 * is tempting and produces confidently wrong demands: `variant-responsive-header-button-bg`
 * fills from `bg-layout-*-deep-inset`, which DOES flip with the theme, so a theme-flipped
 * foreground on it is correct and `--on-standard-color` is not. `variant-responsive-appearing-bg`
 * is transparent at rest, and `variant-mock-item-bg` is a 20% tint — neither is the fill
 * its content is read against. A rule that demands the wrong fix gets disabled, and then
 * it protects nothing. Adding a solid variant fill means adding it here.
 *
 * WHAT IT CANNOT SEE, and therefore what review still has to:
 *  - A pairing split across components — a fill class here, a foreground or a
 *    background arriving through `className` from a caller there. This is the widest
 *    gap, not a corner case: a caller hands `Avatar` a class string, `Avatar` puts the
 *    fill class on the element that receives it, and neither file contains both halves.
 *    Contrast measured in a browser test is what covers that shape; this rule cannot.
 *  - A class name built at runtime from variables rather than written as a literal.
 *  - `@apply` pairings inside the stylesheet, which are not JavaScript at all.
 *  - A foreground legible against its fill but wrong against something painted over it.
 *    Contrast is measured, not linted.
 *  - Consumers outside this package, which the rule is not wired into.
 *  - A colour class that Tailwind emits NOTHING for. `text-red` is not a colour —
 *    the scale needs a number — so `dark:text-red/75` compiles to no declaration at
 *    all and the light-mode colour silently applies in both themes. A dead class is
 *    invisible to this rule by construction, since it matches what is written rather
 *    than what is emitted. Two identical screenshots across themes is the symptom.
 */

/**
 * Classes that paint a SOLID variant fill — one whose lightness is set by the variant
 * rather than by the theme, so content on it needs a derived foreground.
 *
 * Deliberately not every `variant-*-bg`: see the header for the three that match that
 * shape and would get the wrong advice.
 */
const FILL_CLASSES = new Set([
  "variant-responsive-bg",
  "variant-static-bg",
  "variant-checkbox-bg",
  "variant-on-fill-slot",
  "check-indicator",
  "grid-list-item-indicator",
  "card-invert",
  "variant-mock-inner-item",
  "responsive-accent-bg",
]);

/**
 * Foreground classes that resolve to an accent TEXT shade. On a neutral or card ground
 * they are correct and common; on a variant fill they collapse toward the fill itself.
 */
const VARIANT_TEXT_CLASSES = new Set(["variant-responsive-text", "variant-static-text"]);

const PALETTE_NAMES = [
  "slate", "gray", "grey", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
  "default", "primary", "secondary", "tertiary", "success", "warning", "error", "info",
  "layout",
].join("|");

/**
 * A literal foreground colour: `text-white`, `text-black`, `text-neutral-200`,
 * `text-red-500/75`. Deliberately NOT `text-sm` (a size), `text-center` (an alignment),
 * or `text-[var(--on-standard-color)]` (a derived token, which is the fix).
 */
const LITERAL_COLOR_PATTERN = new RegExp(
  `^text-(white|black|(${PALETTE_NAMES})-\\d{2,3})(\\/\\d{1,3})?$`,
);

/**
 * A literal background colour: `bg-white`, `bg-neutral-300/60`, `bg-red-500`.
 *
 * Deliberately NOT `bg-cover` / `bg-center` / `bg-no-repeat` (size, position, repeat) or
 * `bg-linear-to-r` (a gradient direction). The deferring keywords need no separate
 * guard: `bg-transparent`, `bg-current` and `bg-inherit` name no palette shade and are
 * not bracketed, so this pattern already rejects them, and so does the arbitrary-value
 * test below. A guard for them would be dead code asserting a protection it does not
 * provide — which is what makes the valid fixtures for them worth keeping and the
 * clause not worth having.
 */
const LITERAL_BG_PATTERN = new RegExp(
  `^bg-(white|black|(${PALETTE_NAMES})-\\d{2,3})(\\/\\d{1,3})?$`,
);

/**
 * `inherit`, `current` and `transparent` name no colour — they defer to whatever the
 * fill class already decided, which is exactly what this rule asks for. Flagging them
 * would block the correct escape hatch.
 */
const DEFERRING_KEYWORDS = new Set(["text-inherit", "text-current", "text-transparent"]);


/** An arbitrary foreground value that is a colour rather than a token or a length. */
function isArbitraryLiteralColor(utility) {
  return isArbitraryColorIn(/^text-\[(.+)]$/, utility);
}

/** The same test for a background: `bg-[#dcdcdc]` is a literal, `bg-[var(--x)]` is not. */
function isArbitraryLiteralBackground(utility) {
  return isArbitraryColorIn(/^bg-\[(.+)]$/, utility);
}

/**
 * An arbitrary value that is a colour rather than a token or a length. A `var(...)`
 * reference is what this rule steers people toward, so it is excluded.
 */
function isArbitraryColorIn(pattern, utility) {
  const match = pattern.exec(utility);
  if (!match) return false;
  const value = match[1];
  if (value.includes("var(")) return false;
  return (
    /^(#|rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color\()/i.test(value) ||
    /^(white|black)$/i.test(value)
  );
}

/**
 * Strips Tailwind variant prefixes (`dark:`, `hover:`, `group-data-[state=on]/item:`)
 * to leave the utility itself.
 *
 * Splits on the last `:` at bracket depth zero. A naive split on `:` breaks on variants
 * whose brackets contain one — `[&:hover]`, `supports-[display:grid]`.
 */
function baseUtility(className) {
  let depth = 0;
  let lastColon = -1;
  for (let i = 0; i < className.length; i++) {
    const c = className[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) lastColon = i;
  }
  return className.slice(lastColon + 1);
}

function isFillClass(utility) {
  return FILL_CLASSES.has(utility);
}

/**
 * Whether a caller named this background itself.
 *
 * No guard against a fill class reaching here: the collecting loop tests `isFillClass`
 * FIRST and takes the other branch, so one never does. A guard would read as protection
 * against a `bg-`-prefixed fill class being added later, and it would not be — such a
 * class would be classified by that first branch and never reach this function at all.
 */
function isOwnBackground(utility) {
  return LITERAL_BG_PATTERN.test(utility) || isArbitraryLiteralBackground(utility);
}

function isOwnForeground(utility) {
  if (DEFERRING_KEYWORDS.has(utility)) return false;
  return (
    LITERAL_COLOR_PATTERN.test(utility) ||
    isArbitraryLiteralColor(utility) ||
    VARIANT_TEXT_CLASSES.has(utility)
  );
}

/**
 * Collects every string literal reachable from a class-name expression, tagged with the
 * branch it sits in.
 *
 * The tag is what stops the rule being confidently wrong. A component that switches
 * visuals writes its fill in one branch and its accent-text class in another —
 * `invert ? "card-invert" : "variant-static-text card-overlay"` — and those two can never
 * render together. Reporting that pairing is a demand to break working code, which is
 * how a rule gets turned off.
 *
 * `scope` is the chain of enclosing decisions. Two literals are PROVABLY exclusive when
 * some ternary puts them on opposite sides. Two literals under different `&&` guards
 * are not provably anything — the guards may or may not both hold — and that
 * uncertainty is resolved differently per foreground kind, at the call below.
 */
function collectLiterals(node, out, scope = []) {
  if (!node) return;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push({ value: node.value, node, scope });
      break;
    case "TemplateLiteral":
      for (const quasi of node.quasis) {
        out.push({ value: quasi.value.cooked ?? "", node: quasi, scope });
      }
      for (const expression of node.expressions) collectLiterals(expression, out, scope);
      break;
    case "JSXExpressionContainer":
      collectLiterals(node.expression, out, scope);
      break;
    case "CallExpression":
      for (const argument of node.arguments) collectLiterals(argument, out, scope);
      break;
    case "LogicalExpression":
      collectLiterals(node.left, out, scope);
      collectLiterals(node.right, out, [...scope, { node, side: "guarded" }]);
      break;
    case "ConditionalExpression":
      collectLiterals(node.consequent, out, [...scope, { node, side: "consequent" }]);
      collectLiterals(node.alternate, out, [...scope, { node, side: "alternate" }]);
      break;
    case "ArrayExpression":
      for (const element of node.elements) collectLiterals(element, out, scope);
      break;
    case "ObjectExpression":
      for (const property of node.properties) {
        if (property.type === "Property" && property.key) {
          collectLiterals(property.key, out, scope);
        }
      }
      break;
    default:
      break;
  }
}

/** True when some ternary puts these two on opposite sides, so they cannot co-occur. */
function provablyExclusive(a, b) {
  return a.some((frame) =>
    b.some(
      (other) =>
        other.node === frame.node &&
        frame.side !== "guarded" &&
        other.side !== "guarded" &&
        other.side !== frame.side,
    ),
  );
}

/** True when two literals sit under exactly the same chain of decisions. */
function sameScope(a, b) {
  return a.length === b.length && a.every((frame, i) => frame.node === b[i].node && frame.side === b[i].side);
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a literal foreground or background colour on an element that also carries a variant-fill class",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: {
              type: "object",
              properties: {
                file: { type: "string" },
                classes: { type: "array", items: { type: "string" } },
                // Required, and required to be substantial. An allowlist without
                // reasons becomes a list of unexamined defects, which is the failure
                // this rule exists to stop.
                reason: { type: "string", minLength: 20 },
              },
              required: ["file", "classes", "reason"],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcoded:
        "`{{foreground}}` is a literal colour on an element filled by `{{fill}}`. That fill comes from the variant — and `--standard-color` is the same colour in both themes — so a colour picked by hand or by colour scheme is wrong for some variant or some theme. Use `text-[var(--on-standard-color)]` (or `--on-accent-color` for an accent fill), or move the foreground into the class that declares the fill.",
      hardcodedBackground:
        "`{{background}}` paints over the fill `{{fill}}` declares, on the same element. A `bg-*` utility sits in a later cascade layer than a `variant-*` class, so it wins the background while that class's derived foreground stays behind — computed for a fill nothing paints, and read against this one instead. Delete it: `{{fill}}` already paints a ground. If this element genuinely must not carry the variant fill, drop `{{fill}}` rather than covering it.",
    },
  },

  create(context) {
    const allow = context.options[0]?.allow ?? [];
    const filename = context.filename ?? context.getFilename();

    /** An entry matches when its file suffix matches AND it names the exact class. */
    function isAllowed(foreground) {
      return allow.some(
        (entry) => filename.endsWith(entry.file) && entry.classes.includes(foreground),
      );
    }

    /**
     * The fill to report this pairing against.
     *
     * A same-scope fill is preferred over any other candidate, so the message names the
     * class that actually co-occurs rather than whichever fill was written first. On an
     * element carrying several fills under separate guards — `Avatar`'s fallback picks
     * between `variant-responsive-bg` and `variant-static-bg` by `onClick` — the first
     * one is usually not the one the reader needs to look at.
     */
    function pickFill(fills, scope, requiresSameScope) {
      const exact = fills.find((candidate) => sameScope(candidate.scope, scope));
      if (exact || requiresSameScope) return exact;
      return fills.find((candidate) => !provablyExclusive(candidate.scope, scope));
    }

    /** Reports every own-foreground class that shares a scope with a fill class. */
    function check(valueNode) {
      const literals = [];
      collectLiterals(valueNode, literals);

      const fills = [];
      const foregrounds = [];
      const backgrounds = [];
      for (const literal of literals) {
        for (const raw of literal.value.split(/\s+/)) {
          if (!raw) continue;
          const utility = baseUtility(raw);
          if (isFillClass(utility)) fills.push({ raw, scope: literal.scope });
          else if (isOwnBackground(utility)) {
            backgrounds.push({ raw, node: literal.node, scope: literal.scope });
          } else if (isOwnForeground(utility)) {
            foregrounds.push({
              raw,
              node: literal.node,
              scope: literal.scope,
              // An accent-text class is the normal ALTERNATIVE to a fill in a
              // visuals-switching component, so it is only a finding where it provably
              // renders together with one. A literal colour has no such innocent
              // reading, so it is reported unless the branches rule it out — which is
              // what catches a fill and a colour written under two separate `&&`
              // guards, the shape `Avatar` and `ToggleSquare` both shipped.
              requiresSameScope: VARIANT_TEXT_CLASSES.has(utility),
            });
          }
        }
      }

      if (fills.length === 0) return;
      for (const foreground of foregrounds) {
        if (isAllowed(foreground.raw)) continue;
        const fill = pickFill(fills, foreground.scope, foreground.requiresSameScope);
        if (!fill) continue;
        context.report({
          node: foreground.node,
          messageId: "hardcoded",
          data: { foreground: foreground.raw, fill: fill.raw },
        });
      }

      // A literal BACKGROUND is treated like a literal foreground rather than like an
      // accent-text class: reported unless the branches rule the pairing out. There is
      // no innocent reading of a background painted over a fill on the same element —
      // if it renders, it is the surface the derived foreground was NOT computed for.
      // Two separate `&&` guards that may both hold is exactly that case.
      for (const background of backgrounds) {
        if (isAllowed(background.raw)) continue;
        const fill = pickFill(fills, background.scope, false);
        if (!fill) continue;
        context.report({
          node: background.node,
          messageId: "hardcodedBackground",
          data: { background: background.raw, fill: fill.raw },
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name?.name !== "className") return;
        check(node.value);
      },

      /**
       * A `clsx(...)` call anywhere, not only inside a `className` attribute.
       *
       * Hoisting shared classes into a module constant and spreading it into several
       * `className`s is the natural way to avoid repeating them — and it moves the
       * pairing out of every `JSXAttribute` the rule would otherwise visit. Checking
       * the call itself keeps the constant inside the gate, wherever it is used.
       */
      CallExpression(node) {
        if (node.callee?.type !== "Identifier") return;
        if (node.callee.name !== "clsx" && node.callee.name !== "classNames") return;
        // Skip calls already reached through a `className` attribute, or the pairing
        // reports twice.
        let parent = node.parent;
        while (parent) {
          if (parent.type === "JSXAttribute") return;
          if (parent.type === "JSXElement" || parent.type === "Program") break;
          parent = parent.parent;
        }
        check(node);
      },
    };
  },
};

export default rule;
