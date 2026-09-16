import type { ReactNode, Ref } from "react";
import { clsx } from "clsx";

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
}

/** The elements {@link Text} will render as. Text containers only. */
export type TextElement = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "dt" | "dd";

export interface TextProps {
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

  /** Native `title`, for the tooltip a truncated line needs. */
  title?: string;

  /** Native `id`, for `aria-labelledby` / `aria-describedby` on a surrounding control. */
  id?: string;

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
  children,
  className,
  title,
  id,
  ref,
}: TextProps) {
  return (
    <Component className={clsx(role, className)} title={title} id={id} ref={ref as Ref<never>}>
      {children}
    </Component>
  );
}
