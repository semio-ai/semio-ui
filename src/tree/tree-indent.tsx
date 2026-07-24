import { memo, type ReactNode } from "react";

/**
 * Small centered dot used as the default leaf icon so the icon column reads
 * consistently next to group chevrons. Decorative (`aria-hidden`); consumers
 * override per-row via a leaf-icon getter, or suppress it entirely.
 */
export function TreeLeafDot() {
  return (
    <span
      aria-hidden
      className="tree-leaf-dot block size-1.5 rounded-full bg-current opacity-40"
    />
  );
}

export interface TreeIndentProps {
  /** Nesting depth (0 = top-level). */
  depth: number;
  /** Content of the rightmost slot — the expand toggle or a type icon. */
  icon?: ReactNode;
  /**
   * Per-ancestor "is last child" flags (root-to-parent, length === `depth`).
   * When supplied, a continuation guide-line is drawn only for ancestors that
   * are NOT their last child; when omitted, a guide-line is drawn at every
   * ancestor level (the animation package's current behavior).
   */
  ancestorIsLast?: boolean[];
  /** Width of each nesting slot in pixels. */
  slotWidth?: number;
}

/** Default width of each nesting slot; matches the animation track list. */
export const TREE_SLOT_WIDTH = 24;

/**
 * Indentation + tree guide-lines + icon column for one row of a hierarchical
 * list. Generalized from the animation package's `TreeIconColumn`.
 *
 * The element is `(depth + 1) * slotWidth` wide. Each depth level is a
 * fixed-width slot: ancestor slots may carry a vertical guide-line, and the
 * rightmost slot holds the icon, both centered within their slot.
 *
 * ```
 * depth=0:  [icon]
 * depth=1:  [guide₀][icon]
 * depth=2:  [guide₀][guide₁][icon]
 * ```
 */
export const TreeIndent = memo(function TreeIndent({
  depth,
  icon,
  ancestorIsLast,
  slotWidth = TREE_SLOT_WIDTH,
}: TreeIndentProps) {
  const width = (depth + 1) * slotWidth;

  return (
    <div className="relative flex h-full shrink-0 items-center" style={{ width }}>
      {/* Guide-lines are decorative; hide them from assistive tech. */}
      {Array.from({ length: depth }, (_, i) => {
        // Draw a continuation line unless we know this ancestor is a last child.
        const drawGuide = ancestorIsLast ? !ancestorIsLast[i] : true;
        if (!drawGuide) return null;
        return (
          <div
            key={i}
            aria-hidden
            className="absolute top-0 h-full w-px bg-neutral-500/20"
            style={{ left: i * slotWidth + slotWidth / 2 }}
          />
        );
      })}

      <div
        className="absolute flex items-center justify-center overflow-visible"
        style={{ left: depth * slotWidth, width: slotWidth, height: "100%" }}
      >
        {icon}
      </div>
    </div>
  );
});
