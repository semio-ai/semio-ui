/**
 * An element that carries a variant-fill class must not also name a literal
 * foreground colour.
 *
 * The fill classes paint from `--standard-color` or `--accent-color`. Those are
 * variant-driven and, in `--standard-color`'s case, identical in both themes — so a
 * foreground chosen by colour scheme is wrong in one theme for every hue, and a
 * foreground chosen by hand is wrong for every variant but the one it was picked
 * against. The correct foreground is derived from the fill: `--on-standard-color`,
 * `--on-accent-color`, or a class that declares fill and foreground together.
 *
 * WHY A SOURCE RULE RATHER THAN A STYLESHEET CHECK. The fill class and the colour
 * class are composed at the JSX call site. Nothing in the compiled stylesheet pairs
 * them, so no amount of CSS analysis can see the co-occurrence.
 *
 * WHY IT MATCHES A SHAPE RATHER THAN A STRING. Keying on `text-white dark:text-black`
 * is evaded by `text-white` alone, by `text-neutral-200 dark:text-neutral-800`, and by
 * whatever the next author reaches for — all of which fail in exactly the same way, and
 * every one of those was a real site in this package. So the rule matches any literal
 * colour: a palette shade, a bare `white`/`black`, or an arbitrary value that is not a
 * custom property.
 *
 * WHAT IT CANNOT SEE, and therefore what review still has to:
 *  - A pairing split across components — a fill class here, a colour arriving through
 *    `className` from a caller there.
 *  - A class name built at runtime from variables rather than written as a literal.
 *  - `@apply` pairings inside the stylesheet, which are not JavaScript at all.
 *  - A foreground that is legible against the fill but wrong against something painted
 *    over it. Contrast is measured, not linted.
 */

/** Classes whose element paints a variant fill but is not spelled `variant-*-bg`. */
const EXPLICIT_FILL_CLASSES = new Set([
  "check-indicator",
  "grid-list-item-indicator",
  "card-invert",
  "variant-mock-inner-item",
  "responsive-accent-bg",
]);

/**
 * Catches the `variant-*-bg` family — including `-25`/`-50` tint suffixes — so a fill
 * class added later is covered without editing this rule. That generality is the point:
 * this defect keeps arriving in new spellings.
 */
const FILL_CLASS_PATTERN = /^variant-[a-z-]*-bg(-\d+)?$/;

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
  `^text-(white|black|transparent|current|inherit|(${PALETTE_NAMES})-\\d{2,3})(\\/\\d{1,3})?$`,
);

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
  return EXPLICIT_FILL_CLASSES.has(utility) || FILL_CLASS_PATTERN.test(utility);
}

function isLiteralForeground(utility) {
  return LITERAL_COLOR_PATTERN.test(utility) || isArbitraryLiteralColor(utility);
}

/**
 * Collects every string literal reachable from a `className` value, following the
 * shapes this codebase uses: bare strings, `clsx(...)` arguments, template quasis,
 * `&&` guards, and ternary branches.
 *
 * Both branches of a conditional are collected. That over-reports in principle — two
 * branches cannot both render — but a fill and a literal foreground that are mutually
 * exclusive by condition are indistinguishable from the bug at a glance, and the
 * alternative is a rule that any `visuals === "x" && "…"` guard walks straight through.
 */
function collectLiterals(node, out) {
  if (!node) return;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push({ value: node.value, node });
      break;
    case "TemplateLiteral":
      for (const quasi of node.quasis) out.push({ value: quasi.value.cooked ?? "", node: quasi });
      for (const expression of node.expressions) collectLiterals(expression, out);
      break;
    case "JSXExpressionContainer":
      collectLiterals(node.expression, out);
      break;
    case "CallExpression":
      for (const argument of node.arguments) collectLiterals(argument, out);
      break;
    case "LogicalExpression":
      collectLiterals(node.left, out);
      collectLiterals(node.right, out);
      break;
    case "ConditionalExpression":
      collectLiterals(node.consequent, out);
      collectLiterals(node.alternate, out);
      break;
    case "ArrayExpression":
      for (const element of node.elements) collectLiterals(element, out);
      break;
    case "ObjectExpression":
      for (const property of node.properties) {
        if (property.type === "Property" && property.key) collectLiterals(property.key, out);
      }
      break;
    default:
      break;
  }
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

    return {
      JSXAttribute(node) {
        if (node.name?.name !== "className") return;

        const literals = [];
        collectLiterals(node.value, literals);

        const fills = [];
        const foregrounds = [];
        for (const literal of literals) {
          for (const raw of literal.value.split(/\s+/)) {
            if (!raw) continue;
            const utility = baseUtility(raw);
            if (isFillClass(utility)) fills.push(raw);
            else if (isLiteralForeground(utility)) foregrounds.push({ raw, node: literal.node });
          }
        }

        if (fills.length === 0) return;
        for (const foreground of foregrounds) {
          if (isAllowed(foreground.raw)) continue;
          context.report({
            node: foreground.node,
            messageId: "hardcoded",
            data: { foreground: foreground.raw, fill: fills[0] },
          });
        }
      },
    };
  },
};

export default rule;
