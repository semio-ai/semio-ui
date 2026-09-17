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
  /**
   * How much the chip asserts.
   *
   * - `"default"` — the variant's own fill. The chip's colour IS the statement.
   * - `"subtle"` — a neutral surface that takes no variant colour, for a chip whose
   *   meaning is carried by what it holds rather than by its ground: a status chip
   *   whose colour lives in its dot, a metadata chip that should not read as an
   *   alert. A solid variant fill there makes the container compete with its mark.
   *
   * ⚠ Under `"subtle"` the slots carry no ground and force no colour, so whatever
   * they hold keeps its own: a `StatusDot` stays the state's colour, a glyph inherits
   * the chip's. `variant-on-fill-slot` is applied only on a variant fill, because
   * both its tint and its foreground derive from `--on-standard-color` — the
   * foreground of a fill a subtle chip does not paint.
   */
  visuals?: "default" | "subtle";
  onDelete?: MouseEventHandler<HTMLButtonElement>;
}

export function Chip({
  children,
  variant,
  size = Size.Md,
  color,
  icon,
  visuals = "default",
  onDelete,
}: ChipProps) {
  // A slot value may be a registry key (string) or a node; resolveIcon turns a
  // key into a self-sizing <Icon>, otherwise passes the node through.
  const resolvedIcon = resolveIcon(icon);
  return (
    <div
      className={clsx(
        // NOT `variant-responsive-text`: it resolves to the same -500 shade this fill
        // paints with, so anything inheriting it would render at 1:1. The fill
        // declares a foreground derived from itself, and the label inherits it.
        //
        // Both grounds declare their own foreground, so exactly one is applied and
        // never both — a chip carrying two fills would take its background from one
        // and its text colour from whichever lost, with nothing reporting it.
        //
        // Which of the two variant fills applies turns on INTERACTIVITY, not on
        // appearance. `onDelete` is the only handler a chip takes, so a chip without
        // one cannot be acted on at all — and `variant-responsive-bg` carries a
        // `:hover` rule that swaps fill and foreground together, which on a plain
        // label promises a click that does nothing. `variant-static-bg` is the same
        // colour pair with no hover rule; a non-clickable `Avatar` already picks
        // between the two this way, for this reason.
        visuals === "default" && onDelete !== undefined && "variant-responsive-bg",
        visuals === "default" && onDelete === undefined && "variant-static-bg",
        visuals !== "default" && "variant-subtle-bg",
        // The chip states its own radius rather than inheriting whichever fill it
        // took. `variant-responsive-bg` and `variant-subtle-bg` both happen to declare
        // `rounded-xs`, but `variant-static-bg` declares nothing except the colour
        // pair — deliberately, so it can serve shapes as different as a chip and a
        // round avatar. Left to the fill, a deletable chip would be rounded and an
        // identical plain one square.
        "rounded-xs",
        "sized-text sized-height",
        "responsive grid grid-rows-1 place-items-center",
        "sized-chip-gap p-0.5",
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
        <div
          className={clsx(
            size,
            "sized-inner-group-item",
            // `variant-on-fill-slot` ONLY on a variant fill. Both halves of it are
            // derived from `--on-standard-color` — the foreground of the fill this
            // chip would be painted with — so on a neutral ground it tints a box from
            // a colour nothing paints, and recolours the slot's contents away from the
            // label beside them. Under `subtle` the slot is layout only, and whatever
            // it holds keeps its own colour: a status dot stays the state's colour, a
            // glyph inherits the chip's.
            visuals === "default" ? "variant-on-fill-slot" : "grid place-items-center",
          )}
        >
          {resolvedIcon}
        </div>
      )}
      {/* No colour of its own — it inherits the one the fill declares, which follows
          the fill through hover. Full opacity matters independently of which extreme
          gets chosen: alpha composites a foreground toward the very background it has
          to contrast against, and the label is an identifier (pose names, binding
          targets) carrying the 4.5:1 bar rather than a decorative one. */}
      {/* `data-slot` so a test or a consumer can find the label without naming a
          utility class. Selecting on the padding class instead couples them to a
          spacing decision: renaming `px-2` here silently stops such a selector
          matching, and a `find` that returns nothing reads as a broken component
          rather than a stale selector. */}
      <div data-slot="label" className="sized-chip-label-padding">
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
          className={clsx(
            size,
            "sized-inner-group-item",
            // Same rule as the icon slot: the tint derives from the variant fill's
            // foreground, so it only means anything on a variant fill.
            visuals === "default" ? "variant-on-fill-slot" : "grid place-items-center",
          )}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
