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

export function Chip({ children, variant, size = Size.Md, color, icon, onDelete }: ChipProps) {
  // A slot value may be a registry key (string) or a node; resolveIcon turns a
  // key into a self-sizing <Icon>, otherwise passes the node through.
  const resolvedIcon = resolveIcon(icon);
  return (
    <div
      className={clsx(
        // NOT `variant-responsive-text`: it resolves to the same -500 shade this fill
        // paints with, so anything inheriting it would render at 1:1. The fill
        // declares a foreground derived from itself, and the label inherits it.
        "variant-responsive-bg",
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
        // Deliberately NOT `responsive`: that class re-declares the whole variant
        // token block, so a slot carrying it without the variant class resets
        // `--standard-color` to the neutral default and derives its foreground from a
        // fill it is not sitting on. The delete slot below has no `responsive` and
        // inherits the chip's, so the two tint toward opposite extremes on one chip.
        <div className={clsx(size, "sized-inner-group-item", "variant-on-fill-slot")}>
          {resolvedIcon}
        </div>
      )}
      {/* No colour of its own — it inherits the one the fill declares, which follows
          the fill through hover. Full opacity matters independently of which extreme
          gets chosen: alpha composites a foreground toward the very background it has
          to contrast against, and the label is an identifier (pose names, binding
          targets) carrying the 4.5:1 bar rather than a decorative one. */}
      <div className="px-2">{children}</div>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            onDelete(e);
            e.preventDefault();
            e.stopPropagation();
          }}
          className={clsx(size, "sized-inner-group-item", "variant-on-fill-slot")}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
