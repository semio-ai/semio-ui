import type { ReactNode, Ref } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface StatusDotProps {
  /** The state being reported, as a colour the rest of the system already uses. */
  variant?: Variant;
  size?: Size;
  /**
   * The state in words, for assistive technology.
   *
   * ⚠ **Required whenever no visible text names the state.** Nothing about a coloured
   * circle reaches a screen reader, so an unlabelled dot reports nothing at all.
   *
   * Omit it only where the words are already adjacent and announced — inside a `Chip`,
   * whose own label says the state, passing one makes it announce twice.
   */
  srLabel?: string;
  /** Replaces the dot — a spinner for a state that is still resolving. */
  mark?: ReactNode;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * One state, as a coloured mark and nothing else.
 *
 * **It carries no label and no ground, deliberately.** A mark with a word beside it on
 * a filled pill is precisely what `Chip` already is, down to the leading slot — so a
 * labelled form here would be a second implementation of one layout. To label a state,
 * compose the two:
 *
 * ```tsx
 * <Chip size={Size.Xs} visuals="subtle" icon={<StatusDot variant={Variant.Success} />}>
 *   Connected
 * </Chip>
 * ```
 *
 * The chip owns the ground, the rounding, the size scale and the label; this owns the
 * state's colour. It survives the icon slot because the mark paints `background-color`
 * from its own `--standard-color`, while `variant-on-fill-slot` forces only `color` —
 * which is what lets one chip carry a neutral ground and a coloured state at once.
 *
 * **Distinct from `StatusBadge`, which decorates something else.** That one positions a
 * mark at a corner of its required `children`, so it cannot report a state with nothing
 * to attach to. This stands alone.
 *
 * **It knows nothing about what the state is.** A consumer maps its own domain onto a
 * `Variant` and keeps that mapping, so the library carries no assumption about any one
 * app's states. The variant vocabulary is the one every other component reads, so a
 * state shown here matches a button or a chip reporting the same thing, and follows
 * brand and theme without a second table of colours to maintain.
 */
export function StatusDot({
  variant = Variant.Default,
  size = Size.Sm,
  srLabel,
  mark,
  className,
  ref,
}: StatusDotProps) {
  return (
    <span
      ref={ref}
      className={clsx(variant, size, "variant-scope", "inline-flex shrink-0", className)}
    >
      <span
        aria-hidden
        className={clsx(
          "sized-status grid shrink-0 place-items-center rounded-full",
          // A spinner brings its own shape, so a ground would sit behind it as a solid
          // disc. Only the bare dot paints one.
          !mark && "variant-static-bg",
        )}
      >
        {mark}
      </span>
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
    </span>
  );
}
