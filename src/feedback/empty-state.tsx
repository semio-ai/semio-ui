import type { ReactNode, Ref } from "react";
import { clsx } from "clsx";
import { resolveIcon, type IconValue } from "../icons/registry/icon";
import { Text, TextRole } from "../text";
import { Size } from "../types";

export interface EmptyStateProps {
  /**
   * The glyph naming what is absent — a registry key, or an element carrying
   * `.icon-standard` (which `<Icon>` does by default).
   *
   * Painted in the {@link TextRole.Note} colour, the same as the sentence beneath it,
   * so the two read as one statement at one contrast in both themes. Sized by
   * `.sized-icon` at {@link Size.Xl}, which is an explicit step rather than a fraction
   * of a box: an element WITHOUT `.icon-standard` (an `<Icon size="none">`) opts out of
   * that step and keeps whatever size it carries.
   */
  icon?: IconValue;

  /**
   * A heading above the sentence, for an empty state that stands in for a whole page
   * ("Not available") rather than for the rows of a listing. Painted as
   * {@link TextRole.Value}, semibold.
   */
  title?: ReactNode;

  /**
   * The heading's element. Defaults to `h2`. Pick from the document outline: a state
   * that replaces a page's content is that page's `h1`.
   */
  titleAs?: "h1" | "h2" | "h3";

  /**
   * The sentence saying what is absent and, where it helps, why. Rendered in a `p` as
   * {@link TextRole.Note} — the application speaking in its own voice, which is what an
   * empty state is — so pass phrasing content, not blocks.
   */
  children: ReactNode;

  /**
   * The next step: usually one `Button`, or a few side by side. Laid out in a wrapping,
   * centred row under the sentence. Each control keeps its own colours and states.
   */
  actions?: ReactNode;

  /**
   * Extra classes for **the root** — a centred flex column with no padding and no
   * minimum height of its own. Its host decides how much room an empty state takes, so
   * the expected use is a `min-h-*`, a padding, or `h-full`. A `text-*` colour here
   * does not reach the glyph or the sentence, both of which declare their role.
   */
  className?: string;

  /** React 19+: `ref` arrives as an ordinary prop, so this is not supported on React 18. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * What a surface shows when it has nothing to show: a glyph, an optional heading, a
 * sentence and an optional next step, centred.
 *
 * ```tsx
 * <EmptyState icon="asset" actions={<Button …>Browse the marketplace</Button>}>
 *   You have no published assets yet.
 * </EmptyState>
 * ```
 *
 * The composition exists so that the glyph and the sentence are painted by the text
 * roles rather than by hand. A glyph dimmed with `opacity-*` and a sentence set to one
 * neutral rung look acceptable in the theme they were tuned in and fall well below the
 * surrounding text's contrast in the other; the role carries both halves of the
 * light/dark pair and the variant-derived hue, so a caller cannot drop one.
 */
export function EmptyState({
  icon,
  title,
  titleAs = "h2",
  children,
  actions,
  className,
  ref,
}: EmptyStateProps) {
  return (
    <div
      ref={ref}
      className={clsx("flex flex-col items-center justify-center gap-3 text-center", className)}
    >
      {icon && (
        // The glyph box carries the Note role so the glyph's `currentColor` is the
        // sentence's colour, and `sized-icon` + a size class so `.icon-standard` resolves
        // to an explicit pixel step.
        <Text
          role={TextRole.Note}
          aria-hidden
          data-empty-state-glyph=""
          className={clsx("grid place-items-center", "sized-icon", Size.Xl)}
        >
          {resolveIcon(icon)}
        </Text>
      )}
      {title && (
        <Text role={TextRole.Value} as={titleAs} className="font-semibold">
          {title}
        </Text>
      )}
      <Text role={TextRole.Note} as="p" className="max-w-prose">
        {children}
      </Text>
      {actions && <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}
