import { clsx } from "clsx";
import { DisclosureIcon } from "../icons/registry";

export interface TreeToggleProps {
  /** Whether the group is expanded (chevron points down) or collapsed (right). */
  expanded?: boolean;
  /** Called with the next expanded state. When omitted, the toggle is inert. */
  onToggle?: (expanded: boolean) => void;
  disabled?: boolean;
  /** Chevron color; defaults to the inherited text color. */
  color?: string;
  /**
   * Accessible name for the toggle. Prefer naming what it controls
   * (e.g. `"Expand color"`). When omitted, a generic "Expand"/"Collapse"
   * name is used so the button is never nameless. Ignored if
   * {@link TreeToggleProps.ariaLabelledBy} is set.
   */
  ariaLabel?: string;
  /** Id of the element that labels this toggle (usually the row's label). Takes
   *  precedence over {@link TreeToggleProps.ariaLabel}. */
  ariaLabelledBy?: string;
  /** Id of the region this toggle expands/collapses, if one exists. */
  ariaControls?: string;
}

/**
 * Expand/collapse chevron for a group row in a hierarchical list. Promoted
 * from the animation package's `GroupToggle` so every hierarchical list shares
 * one affordance.
 *
 * Implements the WAI-ARIA APG **disclosure** pattern: a native `<button>` with
 * `aria-expanded`, a guaranteed accessible name, and optional `aria-controls`.
 * Enter/Space activation and focusability come from the native button for free.
 *
 * Uses the shared DisclosureIcon state and registry override contract.
 */
export function TreeToggle({
  expanded = true,
  onToggle,
  disabled = false,
  color,
  ariaLabel,
  ariaLabelledBy,
  ariaControls,
}: TreeToggleProps) {
  const isDisabled = disabled || !onToggle;
  // aria-labelledby wins over aria-label per spec; only fall back to a name
  // when no external label is referenced. Never leave the icon button nameless.
  const resolvedAriaLabel = ariaLabelledBy ? undefined : (ariaLabel ?? (expanded ? "Collapse" : "Expand"));
  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-controls={ariaControls}
      aria-expanded={expanded}
      // Stop pointer-down AND click from reaching row-level selection handlers
      // (a click still bubbles even when pointer-down propagation is stopped).
      onPointerDown={(e) => e.stopPropagation()}
      onClick={
        isDisabled
          ? undefined
          : (e) => {
              e.stopPropagation();
              onToggle?.(!expanded);
            }
      }
      className={clsx(
        "flex items-center justify-center",
        "size-5 cursor-pointer rounded-xs",
        "transition-colors hover:bg-neutral-500/20",
        isDisabled && "pointer-events-none opacity-40",
      )}
      style={{ color: color ?? "currentColor" }}
    >
      <DisclosureIcon open={expanded} className="size-4" />
    </button>
  );
}
