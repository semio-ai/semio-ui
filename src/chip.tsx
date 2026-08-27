import { CSSProperties, type MouseEventHandler } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "./types";
import { Icon, resolveIcon, type IconValue } from "./icons/registry";

export interface ChipProps {
  children: string;
  variant?: Variant;
  size?: Size;
  color?: string;
  /** Leading icon: a registry key (e.g. `"user"`) or a rendered node. */
  icon?: IconValue;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * The icon and delete slots: a tint of the chip's own foreground over the chip's
 * fill, plus that foreground for the glyph.
 *
 * Both halves derive from the fill rather than from the colour scheme, because the
 * fill (`--standard-color`) does not flip with the scheme. A theme-flipped tint over
 * it lands on the wrong side in one theme for every hue — it lightened the warm fills
 * until the glyph measured 1.4:1 — and tinting toward the glyph's own colour instead
 * keeps slot and glyph on the same side of the fill in both themes. The `group-hover`
 * pair follows the fill's own hover swap to `--accent-color`, which crosses the
 * derivation's threshold in the opposite direction for some hues.
 */
const SLOT_VISUALS = clsx(
  "grid place-items-center rounded-[1px]",
  "bg-[color-mix(in_oklab,var(--on-standard-color)_20%,transparent)]",
  "text-[var(--on-standard-color)]",
  "group-hover/chip:bg-[color-mix(in_oklab,var(--on-accent-color)_20%,transparent)]",
  "group-hover/chip:text-[var(--on-accent-color)]",
);

export function Chip({ children, variant, size = Size.Md, color, icon, onDelete }: ChipProps) {
  // A slot value may be a registry key (string) or a node; resolveIcon turns a
  // key into a self-sizing <Icon>, otherwise passes the node through.
  const resolvedIcon = resolveIcon(icon);
  return (
    <div
      className={clsx(
        "group/chip variant-responsive-bg variant-responsive-text",
        "sized-text sized-height",
        "responsive grid grid-rows-1 place-items-center",
        "gap-2 p-0.5",
        resolvedIcon && children && onDelete && "grid-cols-[auto_1fr_auto]",
        resolvedIcon && children && !onDelete && "grid-cols-[auto_1fr]",
        !resolvedIcon && children && onDelete && "grid-cols-[1fr_auto]",
        resolvedIcon && !children && onDelete && "grid-cols-[auto_auto]",
        resolvedIcon && !children && !onDelete && "grid-cols-[auto]",
        color ? "custom-color" : variant,
        size,
      )}
      style={
        color
          ? ({
              "--custom-color": color,
            } as CSSProperties)
          : undefined
      }
    >
      {resolvedIcon && (
        <div className={clsx("responsive", size, "sized-inner-group-item", SLOT_VISUALS)}>
          {resolvedIcon}
        </div>
      )}
      {/* Derived from the fill, at full opacity. The fill is `--standard-color`, which
          has no dark-mode override — so no foreground chosen by colour scheme can be
          right in both themes here, whatever pair is picked. The label is an identifier
          (pose names, binding targets), so it carries the 4.5:1 bar rather than a
          decorative one, and the 75% alpha this used to carry cost roughly a stop on
          top of the wrong-extreme problem: alpha composites the label toward its own
          background, which is where the warm hues reached 1.6:1. */}
      <div className="px-2 text-[var(--on-standard-color)] group-hover/chip:text-[var(--on-accent-color)]">
        {children}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            onDelete(e);
            e.preventDefault();
            e.stopPropagation();
          }}
          className={clsx(size, "sized-inner-group-item", SLOT_VISUALS)}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
