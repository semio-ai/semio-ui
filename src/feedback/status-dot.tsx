import type { ReactNode, Ref } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface StatusDotProps {
  /** The state being reported, as a colour the rest of the system already uses. */
  variant?: Variant;
  size?: Size;
  /**
   * What the colour means, in words.
   *
   * ⚠ **Give it one wherever there is room.** A bare dot encodes state in hue
   * alone, which is unreadable to anyone who cannot separate the hues and
   * unguessable to everyone else — green and lime differ by a step nobody can name.
   * Omit it only where the words are already adjacent, and pass {@link srLabel}
   * there so the state is still announced.
   */
  label?: ReactNode;
  /**
   * The state in words for assistive technology, when {@link label} is omitted.
   *
   * Without one, a dot is decoration: nothing about a coloured circle reaches a
   * screen reader, so the state simply is not reported.
   */
  srLabel?: string;
  /** Replaces the dot — a spinner for a state that is still resolving. */
  mark?: ReactNode;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * One state, reported on its own: a coloured mark and what it means.
 *
 * **Distinct from `Status`, which decorates something else.** `Status` positions a
 * badge at a corner of its required `children` — a count on an icon, a dot on a
 * tile — so it cannot report a state that has nothing to attach to. This stands
 * alone, which is what a listing row, a detail pane's media overlay and a device
 * page all actually need, and what each of them was hand-building for the want of
 * it.
 *
 * **It knows nothing about what the state is.** A consumer maps its own domain onto
 * a `Variant` and a label — which device states exist, which of them count as
 * healthy — and keeps that mapping. The variant vocabulary is the one every other
 * component reads, so a state rendered here matches a chip or a button reporting
 * the same thing, and it follows brand and theme without a second table of colours
 * to maintain.
 */
export function StatusDot({
  variant = Variant.Default,
  size = Size.Sm,
  label,
  srLabel,
  mark,
  className,
  ref,
}: StatusDotProps) {
  const labelled = label !== undefined && label !== null;
  return (
    <span
      ref={ref}
      className={clsx(
        variant,
        size,
        "responsive",
        "inline-flex flex-row items-center gap-1",
        // Only the labelled form carries a ground. A bare mark on a pill would be a
        // shape around a shape.
        //
        // `sized-status-text` supplies the height, the type scale AND the horizontal
        // padding, and no `px-*` is added over it: a fixed padding would hold still
        // while the box around it shrank, so the pill would stop being the same shape
        // at each rung. `gap-1` matches what that scale pads with at the default rung
        // for the same reason — the mark should sit as far from the edge as from the
        // word.
        labelled && "variant-static-bg sized-status-text rounded-full",
        className,
      )}
    >
      {mark ? (
        // The mark REPLACES the dot rather than sitting on it: the labelled dot paints
        // `bg-current`, so a spinner drawn inside it would spin over a solid disc.
        <span aria-hidden className="sized-status grid shrink-0 place-items-center">
          {mark}
        </span>
      ) : (
        <span
          aria-hidden
          className={clsx(
            "shrink-0 rounded-full",
            // The mark takes the ground when the row does not, and the derived
            // foreground when it does — so a dot beside a label reads as part of the
            // label rather than as a second colour next to it.
            //
            // Fixed at `size-1.5` in the labelled form, unlike the padding above: a
            // dot is a mark, not part of the box's shape, and it stays legible as one
            // across a scale whose type only spans 8px to 12px. A standalone dot IS
            // the whole component, so that one takes the scale.
            labelled ? "size-1.5 bg-current" : "sized-status variant-static-bg",
          )}
        />
      )}
      {labelled ? label : srLabel ? <span className="sr-only">{srLabel}</span> : null}
    </span>
  );
}
