/**
 * An element that carries a variant-fill class must not also name its own foreground.
 *
 * The fill classes paint from `--standard-color` or `--accent-color`. Those are
 * variant-driven and, in `--standard-color`'s case, identical in both themes — so a
 * foreground chosen by colour scheme is wrong in one theme for every hue, and a
 * foreground chosen by hand is wrong for every variant but the one it was picked
 * against. Each fill class declares a foreground derived from itself, for every state
 * it fills; a caller's job is to name neither half.
 *
 * TWO KINDS ARE REPORTED, because both shipped here:
 *
 *  - A LITERAL colour — `text-white`, `text-neutral-200`, `text-[#fff]`. Keying on
 *    `text-white dark:text-black` is evaded by each of the others, and every one of
 *    them was a real site in this package.
 *  - A VARIANT TEXT class — `variant-responsive-text`, `variant-static-text`. These
 *    look like the responsible choice and are worse than a literal: they resolve to an
 *    accent TEXT shade, which for a named variant is the same -500 the fill paints
 *    with, so content inheriting it renders at exactly 1:1. That is what made
 *    `ImageInput`'s fallback initial invisible.
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
 *  - A pairing split across components — a fill class here, a foreground arriving
 *    through `className` from a caller there.
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
 * `inherit`, `current` and `transparent` name no colour — they defer to whatever the
 * fill class already decided, which is exactly what this rule asks for. Flagging them
 * would block the correct escape hatch.
 */
const DEFERRING_KEYWORDS = new Set(["text-inherit", "text-current", "text-transparent"]);

/**
 * An arbitrary value that is a colour rather than a token or a length. A `var(...)`
 * reference is what this rule steers people toward, so it is excluded.
 */
function isArbitraryLiteralColor(utility) {
  const match = /^text-\[(.+)]$/.exec(utility);
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
 * `invert ? "card-invert" : "variant-static-text card"` — and those two can never
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
        "Disallow a literal foreground colour on an element that also carries a variant-fill class",
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

    /** Reports every own-foreground class that shares a scope with a fill class. */
    function check(valueNode) {
      const literals = [];
      collectLiterals(valueNode, literals);

      const fills = [];
      const foregrounds = [];
      for (const literal of literals) {
        for (const raw of literal.value.split(/\s+/)) {
          if (!raw) continue;
          const utility = baseUtility(raw);
          if (isFillClass(utility)) fills.push({ raw, scope: literal.scope });
          else if (isOwnForeground(utility)) {
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
        const fill = fills.find((candidate) =>
          foreground.requiresSameScope
            ? sameScope(candidate.scope, foreground.scope)
            : !provablyExclusive(candidate.scope, foreground.scope),
        );
        if (!fill) continue;
        context.report({
          node: foreground.node,
          messageId: "hardcoded",
          data: { foreground: foreground.raw, fill: fill.raw },
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
