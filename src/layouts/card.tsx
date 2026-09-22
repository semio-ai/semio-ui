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
  /**
   * A full-bleed row across the card's top edge, ABOVE {@link media}.
   *
   * For a card whose subject is named before it is shown — a header row carrying a
   * type mark and a name, matching a detail pane that heads itself the same way.
   * The alternative is the {@link title} slot, which sits in the body BELOW the
   * media; both exist because which reads correctly depends on whether the picture
   * or the name is the thing being scanned for.
   *
   * Supplying this moves the card's top rounding onto it, and the media meets it
   * square — otherwise two rounded edges would stack a few pixels apart. The
   * consumer states the row's own height, fill and padding; this slot states only
   * where it sits and that it spans the full width.
   */
  header?: ReactNode;
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
  /**
   * A second identity line, directly beneath the title with **no gap** — an
   * address, a scope, where the thing lives.
   *
   * Distinct from {@link children} because of that gap and nothing else. The body
   * is a `gap-2` stack, so a second line passed as the first body child sits 8px
   * under the title and reads as the first of the metadata rather than as part of
   * the name. This slot shares a wrapper with the title row so the body's gap
   * falls below the pair, which is what lets a card's name block match the two
   * tight lines a list row shows.
   *
   * Placement only: like {@link children} it states no size and no colour, so a
   * consumer whose rows and cards must agree can pass one component to both. See
   * the note on the component about why body content declares its own colour.
   */
  subtitle?: ReactNode;
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
  header,
  media,
  mediaAspect = "video",
  mediaCorner,
  title,
  titleTrailing,
  subtitle,
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
      // `variant-scope` + `custom-color`-free: selection is drawn with the accent ring
      // the rest of the package uses for a chosen item, rather than a bespoke
      // colour, so a selected card matches a selected row.
      data-selected={selected ? "true" : undefined}
      className={clsx(
        "card relative flex h-full flex-col overflow-hidden",
        // See the note above: the surface class carries no foreground, so this must.
        "text-neutral-900 dark:text-neutral-100",
        // `variant-scope` sets `--accent-color`, which the tint layer below resolves
        // against — so selection adapts to the theme and to any variant, exactly as
        // a row's does.
        (interactive || selected) && "variant-scope",
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
      {header !== undefined && (
        // `relative` to lift it above the tint layer, as the media and body do. The
        // inner radius is the card's own less its border width, so the curves stay
        // concentric — the same derivation the media slot uses, moved up here
        // because this is now the slot touching those corners.
        <div className="relative shrink-0 overflow-hidden rounded-t-[calc(var(--radius-sm)-2px)]">
          {header}
          {/* The header's own tint, because the card's sits BELOW the content and a
              header row paints an opaque fill over it — so the one place the card
              did not appear to respond to hover was the row naming what you were
              hovering. Stacked ABOVE the row rather than below it, which is the
              difference from the body: there is a fill here to cover, so a wash over
              the whole row including its text is the only version that shows. At 8%
              that reads as the row lighting up, not as text dimming. */}
          {(interactive || selected) && (
            <div
              aria-hidden
              className={clsx(
                "pointer-events-none absolute inset-0 transition-colors duration-150 ease-out",
                selected ? "bg-(--accent-color)/18" : "group-hover:bg-(--accent-color)/8",
              )}
            />
          )}
        </div>
      )}

      {hasMedia && (
        <div
          className={clsx(
            // `relative` twice over: it positions `mediaCorner`, and it lifts this
            // in-flow block above the absolutely-positioned tint layer.
            "relative grid shrink-0 place-items-center overflow-hidden",
            // The card's INNER radius, on the two corners this slot actually touches:
            // the card's own radius less its border width, so the curves are
            // concentric.
            //
            // Stated rather than left to the card's `overflow-hidden`, which does not
            // round a child that establishes its own clip — the media was trimmed to
            // the padding *box* with square corners, which shows as a hard 90° edge
            // cutting across the border's curve. Derived from `--radius-sm`, what
            // `.card` itself uses, so it tracks the card rather than drifting from it.
            // Only when the media IS the card's top edge. With a header above it the
            // rounding belongs to that row, and rounding both stacks two curves a
            // few pixels apart.
            header === undefined && "rounded-t-[calc(var(--radius-sm)-2px)]",
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
        {/* Title row and subtitle in ONE wrapper, so the body's `gap-2` falls below
            the pair rather than between the two halves of the name. `min-w-0` on the
            wrapper too, or the subtitle's truncation has nothing to resolve against.

            The subtitle is rendered BARE, with no wrapper of its own. A wrapping
            block establishes a line box at the inherited line-height, which put 24px
            of box around a 12px line and left the gap this slot exists to remove
            almost intact — measured at 9px where the intent was 2. As a direct flex
            item it is exactly as tall as what the consumer passed, and `stretch` on
            the cross axis still gives it the full width its `truncate` needs. */}
        {(hasTitleRow || subtitle !== undefined) && (
          <div className="flex min-w-0 flex-col">
            {hasTitleRow && (
              <div className="flex flex-row items-start justify-between gap-2">
                {title !== undefined && (
                  <span className="min-w-0 truncate text-sm font-medium">{title}</span>
                )}
                {titleTrailing !== undefined && <div className="flex-none">{titleTrailing}</div>}
              </div>
            )}
            {subtitle}
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
