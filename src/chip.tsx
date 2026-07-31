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
        "variant-responsive-bg variant-responsive-text",
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
        <div
          className={clsx(
            "responsive",
            size,
            "sized-inner-group-item",
            "grid place-items-center rounded-[1px] bg-white/50 dark:bg-black/50",
          )}
        >
          {resolvedIcon}
        </div>
      )}
      {/* `black` in dark mode, not `red`: this read `dark:text-red/75`, and `text-red`
          is not a colour Tailwind emits — the scale needs a number — so the
          declaration was dropped and the chip rendered `text-white/75` in BOTH
          modes. The variant fill inverts with the theme (light mode gets a mid-tone
          accent, dark mode a light one), so white was legible on light and vanished
          on dark. White-on-light / black-on-dark is the pairing the icon and delete
          slots below already use against the same fill. */}
      <div className="px-2 text-white/75 dark:text-black/75">{children}</div>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            onDelete(e);
            e.preventDefault();
            e.stopPropagation();
          }}
          className={clsx(
            size,
            "sized-inner-group-item",
            "grid place-items-center rounded-[1px] bg-white/50 dark:bg-black/50",
          )}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
