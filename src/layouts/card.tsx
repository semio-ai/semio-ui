import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { clsx } from "clsx";

/** Aspect ratios the media slot offers. */
export type CardMediaAspect = "video" | "square" | "wide";

const MEDIA_ASPECT: Record<CardMediaAspect, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[3/1]",
};

/** How the footer's content distributes along the row. */
export type CardFooterAlign = "start" | "end" | "between";

const FOOTER_ALIGN: Record<CardFooterAlign, string> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
};

export interface CardProps {
  /**
   * Preview content, filling the card's top edge with no padding — an image, a
   * canvas, a placeholder glyph. The slot carries a neutral tint of its own, so an
   * empty or still-loading media area already looks deliberate; content that
   * should cover it (a real image) needs `size-full object-cover`.
   *
   * Omit both this and {@link mediaCorner} and the slot is not rendered at all,
   * rather than collapsing to a zero-height band.
   */
  media?: ReactNode;
  /** Aspect ratio of the media slot. Defaults to `video`. */
  mediaAspect?: CardMediaAspect;
  /**
   * Overlaid in the media slot's top-right corner. For a secondary affordance —
   * an overflow menu, a pin — that should stay clear of the primary action in the
   * footer. Renders the media slot even when `media` is absent.
   */
  mediaCorner?: ReactNode;
  /** Primary label. Gets the card's title treatment, and truncates. */
  title?: ReactNode;
  /** Trailing element on the title row, e.g. a `Chip`. Never truncates. */
  titleTrailing?: ReactNode;
  /** Body content below the title — metadata lines and the like. */
  children?: ReactNode;
  /**
   * Pinned to the bottom of the card, below the body. Cards in a grid stretch to
   * a shared row height, so footers line up across a row regardless of how much
   * body content each card has.
   */
  footer?: ReactNode;
  /** Footer distribution. Defaults to `end`. */
  footerAlign?: CardFooterAlign;
  /**
   * The card's single default verb, rendered full-width across the bottom.
   *
   * Distinct from {@link footer}, which takes arbitrary content: this encodes the
   * contract that a card face carries exactly *one* action. Anything additional
   * belongs where there is room and context — a preview pane, the item's own page,
   * or an overflow menu — rather than competing for the face. Which verb is the
   * default may vary by surface (open it, in a library; get it, in a browse view),
   * so the choice is the consumer's; the singularity is not.
   *
   * Pass a `Button` with `className="w-full"`. Ignored when `footer` is given.
   */
  primaryAction?: ReactNode;
  /**
   * Renders as selected. Purely presentational — the consumer owns selection
   * state, exactly as `ListRow` takes a resolved `visual` rather than tracking
   * its own.
   */
  selected?: boolean;
  /** Marks the card as activatable, so it gets a pointer and hover emphasis. */
  interactive?: boolean;
  /** Classes for the outer surface. */
  className?: string;
  /** Classes for the padded body column, e.g. to change its spacing. */
  bodyClassName?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A content card: an optional media slot, a title row, body content, and a footer
 * pinned to the bottom.
 *
 * This is the *structure* only. What goes in each slot — which glyph stands in for
 * a missing preview, which badge sits beside the title, which actions the footer
 * holds — is the consumer's, exactly as with {@link ListRow}. Slots are props
 * rather than compound children, matching the rest of the package.
 *
 * **It declares its own foreground.** The `.card` utility class supplies a surface
 * and a border but no text colour, so a card built on the bare class inherits
 * whatever its host page provides — and a host that provides nothing falls through
 * to the user-agent default black: fine on a light surface, unreadable on a dark
 * one. This is the same trap `ListRow` and `TreeRow` fell into. Declaring the
 * colour here means a card is readable wherever it is placed, and it is why body
 * content should state a muted colour outright rather than reaching for `opacity`
 * — opacity over an inherited black is still black, which is what made the bug
 * look intentional.
 *
 * **Full height by design.** `h-full` so a card fills its grid cell; combined with
 * the footer's `mt-auto`, that is what aligns footers across a row of cards with
 * unequal body content.
 */
export function Card({
  media,
  mediaAspect = "video",
  mediaCorner,
  title,
  titleTrailing,
  children,
  footer,
  footerAlign = "end",
  primaryAction,
  selected = false,
  interactive = false,
  className,
  bodyClassName,
  ref,
  ...rest
}: CardProps & Omit<ComponentPropsWithoutRef<"div">, keyof CardProps>) {
  const hasMedia = media !== undefined || mediaCorner !== undefined;
  const hasTitleRow = title !== undefined || titleTrailing !== undefined;

  return (
    <div
      ref={ref}
      // `responsive` + `custom-color`-free: selection is drawn with the accent ring
      // the rest of the package uses for a chosen item, rather than a bespoke
      // colour, so a selected card matches a selected row.
      data-selected={selected ? "true" : undefined}
      className={clsx(
        "card relative flex h-full flex-col overflow-hidden",
        // See the note above: the surface class carries no foreground, so this must.
        "text-neutral-900 dark:text-neutral-100",
        // `responsive` sets `--accent-color`, which the tint layer below resolves
        // against — so selection adapts to the theme and to any variant, exactly as
        // a row's does.
        (interactive || selected) && "responsive",
        // `group` so the tint layer can react to hovering the CARD. The layer is
        // `pointer-events-none`, so a `hover:` on it would never fire.
        interactive && "group cursor-pointer",
        selected && "border-(--accent-color)",
        className,
      )}
      {...rest}
    >
      {/* Selection/emphasis tint, as its own layer rather than a `bg-*` utility on
          the root. A background utility would REPLACE `.card`'s surface, and since
          these tints mix toward `transparent` the card would turn see-through
          instead of tinting. `ListRow` solves it the same way, with the same
          intensities: 18% when selected, 8% on hover. In-flow content below is
          `relative` so it paints above this absolutely-positioned layer.

          Hover is applied only when NOT selected. Both states set the same
          property, and the `hover:` variant wins on source order — which made a
          selected card lose its highlight for as long as the cursor stayed on it. */}
      {(interactive || selected) && (
        <div
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-0 transition-colors duration-150 ease-out",
            // `bg-(--accent-color)/N`, Tailwind's variable shorthand with an
            // opacity modifier — the same form as `border-(--accent-color)` above.
            // An arbitrary `bg-[color-mix(...)]` works unprefixed but silently
            // resolves to transparent under `group-hover:`, so both states use the
            // shorthand rather than one of each.
            selected ? "bg-(--accent-color)/18" : "group-hover:bg-(--accent-color)/8",
          )}
        />
      )}
      {hasMedia && (
        <div
          className={clsx(
            // `relative` twice over: it positions `mediaCorner`, and it lifts this
            // in-flow block above the absolutely-positioned tint layer.
            "relative grid shrink-0 place-items-center overflow-hidden",
            // The empty-media look, so a card without a preview is not a void.
            "bg-neutral-300/40 dark:bg-neutral-700/40",
            MEDIA_ASPECT[mediaAspect],
          )}
        >
          {media}
          {mediaCorner !== undefined && (
            <div className="absolute top-1.5 right-1.5">{mediaCorner}</div>
          )}
        </div>
      )}

      {/* `relative` lifts the body above the tint layer. */}
      <div className={clsx("relative flex flex-1 flex-col gap-2 p-3", bodyClassName)}>
        {hasTitleRow && (
          <div className="flex flex-row items-start justify-between gap-2">
            {title !== undefined && (
              <span className="min-w-0 truncate text-sm font-medium">{title}</span>
            )}
            {titleTrailing !== undefined && <div className="flex-none">{titleTrailing}</div>}
          </div>
        )}

        {children}

        {footer !== undefined ? (
          <div
            className={clsx(
              "mt-auto flex flex-row items-center gap-1 pt-1",
              FOOTER_ALIGN[footerAlign],
            )}
          >
            {footer}
          </div>
        ) : (
          primaryAction !== undefined && (
            // Full-width, and `[&>*]:w-full` so the consumer can pass a plain
            // `Button` without having to know to stretch it.
            <div className="mt-auto pt-1 [&>*]:w-full">{primaryAction}</div>
          )
        )}
      </div>
    </div>
  );
}
