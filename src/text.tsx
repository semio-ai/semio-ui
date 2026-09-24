import type { HTMLAttributes, ReactNode, Ref } from "react";
import { clsx } from "clsx";
import type { Variant } from "./types";

/**
 * What a piece of text IS, which is what decides how it is painted and whether it can
 * be selected.
 *
 * **Deliberately not a size.** A size scale cannot express the rule this component
 * exists to apply: a fact's value and the label naming it are both 14px, and the
 * difference between them — one is content a reader will want to copy, the other is
 * chrome that happens to be words — is invisible to the scale. Several roles may
 * resolve to the same rung; that is the point rather than a collision, and it is why a
 * Figma `Text/*` style maps onto these many-to-one rather than one-to-one.
 *
 * Each role resolves to a `.text-role-*` class in the package stylesheet, which is
 * where the rung, the light/dark colour pair and the selection rule are declared
 * together. See the block comment there for why the pairing has to live in a class
 * rather than in utilities this component spreads.
 *
 * **Adding a role is a member here plus one block in the stylesheet.** Nothing else
 * enumerates them: the shared declarations match on the `text-role-` class PREFIX, so a
 * new role picks them up whether or not this component put the class there, and the
 * browser tests and the Storybook story both derive their lists from
 * `Object.values(TextRole)`. A role added without its stylesheet block reddens the
 * light/dark test rather than shipping unstyled.
 *
 * ⚠ A role that should take the ambient variant on its own colour also needs adding to
 * the muted selector in the stylesheet. Only the muted pair derives; `value` and `body`
 * are deliberately excluded, and the block there says why.
 */
export enum TextRole {
  /**
   * The primary reading of a thing: a fact's value, a name, the content of a field.
   * 14px at full contrast, and **selectable** — this is the text a reader came for.
   */
  Value = "text-role-value",

  /**
   * The name of something, in the application's own voice: a section heading, a fact's
   * label, a column head. 12px, muted, uppercase.
   *
   * **Not selectable**, because it is chrome. Dragging across a fact list should take
   * the values and leave the scaffolding behind.
   */
  Label = "text-role-label",

  /**
   * Secondary content attached to something else: a subtitle, a timestamp, the sentence
   * under a setting. 12px and muted like {@link TextRole.Label}, but sentence case and
   * **selectable** — it is content, not scaffolding, and the case is what tells a reader
   * which of the two they are looking at.
   */
  Caption = "text-role-caption",

  /**
   * Running prose: a description, an explanation, a paragraph meant to be read rather
   * than scanned. 14px at a contrast between {@link TextRole.Value} and
   * {@link TextRole.Caption}, and **selectable**.
   */
  Body = "text-role-body",

  /**
   * The application speaking in its own right, at the size prose is read at: an empty
   * state, a stated absence, an instruction above a field. Muted like
   * {@link TextRole.Caption}, sized like {@link TextRole.Body}, and **selectable**.
   *
   * **The axis this completes is voice, not prominence.** {@link TextRole.Value} and
   * {@link TextRole.Body} are the subject's own words — a fact it holds, a description
   * it wrote — and {@link TextRole.Label} is the application naming one of them. This
   * is the application saying something itself, which happens at the length and rung of
   * prose rather than of a field name.
   *
   * ⚠ **Not a quieter `body`.** A subject's own prose stays at `body` however short it
   * is; what puts text here is that the subject did not write it. Choosing on
   * prominence instead is how "no description is available" and a real description end
   * up at the same rung, which is the one distinction this role exists to draw.
   */
  Note = "text-role-note",
}

/**
 * How far the active {@link Variant} is allowed to show on this text.
 *
 * A qualifier on `variant`, not a prominence axis of its own: with no variant in play the
 * two settings look the same, because both resolve against the default accent. That is why
 * it is named for the variant's mode of use rather than for how loud the text is.
 */
export enum VariantMode {
  /**
   * Default. The variant shows only where the role already lets it: in the selection
   * tint, and — for the muted roles — as the hue of the role's own colour, at the
   * lightness that role would have had anyway.
   *
   * Named for the level rather than for the selection, because the selection is not the
   * whole of it: a `caption` in a `primary` pane is primary-hued at rest, not only when
   * a reader drags across it.
   *
   * ⚠ On {@link TextRole.Label} the selection half cannot show — a label is chrome and
   * carries `select-none`, so there is nothing to tint. The muted hue still applies.
   */
  Ambient = "ambient",

  /**
   * The text itself carries the variant's colour — an error message that is red because it
   * is an error, rather than a neutral line that happens to sit in an error panel.
   *
   * Resolved through the lightness clamp rather than the raw accent-text token, so it stays
   * legible on any ground. The raw token is calibrated against the deep-inset surface only
   * and measures 1.6:1 for the warm hues elsewhere.
   *
   * With **no** `variant` named it takes whichever variant is in context, and falls back to
   * the role's own colour where there is none — so setting it alone never costs the text
   * its paint. The stylesheet's `variant-text-on-inset` block carries the mechanism.
   */
  Static = "static",
}

/** The elements {@link Text} will render as. Text containers only. */
export type TextElement = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "dt" | "dd";

/**
 * Everything a text container natively accepts, minus the three this component owns.
 *
 * - `role` is shadowed by {@link TextProps.role} — see the prop's own note.
 * - `className` is re-declared below so it can document what it lands on.
 * - `color` is the presentational HTML attribute, and a colour named there would sit
 *   outside the role's light/dark pair in exactly the way the roles exist to prevent.
 *
 * Widening to the native attributes rather than listing them is what lets a caller reach
 * the DOM at all: `data-testid`, `aria-label`, `aria-hidden`, `style`, `onClick` and the
 * rest are how a run of text is targeted by a test, named to a screen reader, or made
 * interactive, and an allowlist silently drops every attribute nobody thought to add.
 */
type NativeTextProps = Omit<HTMLAttributes<HTMLElement>, "role" | "className" | "color">;

export interface TextProps extends NativeTextProps {
  /**
   * What this text is. Required, with no default: the default would be the one thing a
   * caller could skip deciding, and deciding it is the entire job — an unconsidered role
   * is how a value ends up unselectable or a label ends up draggable.
   *
   * ⚠ **This shadows the DOM `role` attribute, and does not forward one.** That is
   * deliberate rather than an oversight: ARIA roles describe a region's purpose and
   * belong on the container, not on the run of text inside it — a live region stays a
   * `div role="status"` with a `Text` in it. TypeScript rejects `role="status"` here, so
   * the collision is a compile error rather than a silently dropped attribute.
   */
  role: TextRole;

  /**
   * The element to render. Defaults to `span`, which is inert in every layout.
   *
   * Pick from the document's structure, not from the look — the role already carries the
   * look, so a heading that needs to be small is `h3` with {@link TextRole.Label}, not a
   * `span` styled down. Changing this changes what a screen reader announces and what a
   * heading outline contains; it changes nothing visual.
   */
  as?: TextElement;

  /**
   * Which variant's colours this text draws on. **Omit it to inherit the surrounding
   * context**, which is the common case — a caption inside a `primary` pane is primary
   * without anyone saying so.
   *
   * Name it when the text carries a variant its container does not: a validation message
   * that is `Error` inside an ordinary form, without wrapping it in a `variant-scope error`
   * element. {@link Variant.Default} is the explicit opt-out — a timestamp that should stay
   * neutral even though it sits in an error panel.
   */
  variant?: Variant;

  /**
   * How far that variant shows. Defaults to {@link VariantMode.Ambient} — present, but
   * only as far as the role already allows.
   */
  mode?: VariantMode;

  children?: ReactNode;

  /**
   * Extra classes for **the rendered element itself** — this component renders exactly
   * one node and there is no inner wrapper, so this always lands there.
   *
   * Layout is the expected use: `truncate`, `min-w-0`, a margin. A `text-*` utility here
   * overrides the role's own paint in BOTH themes, because utilities sit in a later
   * cascade layer than the role's class — which is the escape hatch working as intended,
   * not a bug. If you find yourself reaching for it to restyle text, the role is wrong
   * or a role is missing.
   */
  className?: string;

  /** React 19+: `ref` arrives as an ordinary prop, so this is not supported on React 18. */
  ref?: Ref<HTMLElement>;
}

/**
 * A run of text that declares what it is.
 *
 * ```tsx
 * <Text role={TextRole.Label} as="dt">Owner</Text>
 * <Text role={TextRole.Value} as="dd" className="truncate">@semio-ai</Text>
 * ```
 *
 * The component is thin on purpose — it resolves a role to a class and renders one
 * element. The class is the load-bearing part, and it is what a hand-written element or
 * a Figma Code Connect mapping can reach for when a component is not wanted. What the
 * component adds is a **named target**: something for an author, an agent or Code
 * Connect to point at, so the role travels with the text instead of being re-derived
 * from a pile of utilities at each site.
 */
export function Text({
  role,
  as: Component = "span",
  variant,
  mode = VariantMode.Ambient,
  children,
  className,
  ref,
  ...rest
}: TextProps) {
  return (
    <Component
      // Native attributes first, so nothing a caller passes can displace the role class
      // or the ref — `className` and `ref` are destructured above and therefore absent
      // from `rest`, but spreading last would still let a future addition to that list
      // land after them silently.
      {...rest}
      className={clsx(
        role,
        // `variant-scope` is what DECLARES the variant custom properties — the `@variant`
        // blocks are nested inside it, so a bare variant class sets nothing. Emitting both
        // re-roots the accent context on this element, which is why it is only done when a
        // variant is named: without it the text inherits the surrounding one, and that is
        // the behaviour a caller gets by leaving the prop off.
        variant && `variant-scope ${variant}`,
        // The clamped variant text, rather than the raw accent-text token: the clamp keeps
        // the hue while guaranteeing the contrast, which the token does not away from the
        // one ground it was calibrated against.
        mode === VariantMode.Static && "variant-text-on-inset",
        className,
      )}
      ref={ref as Ref<never>}
    >
      {children}
    </Component>
  );
}
