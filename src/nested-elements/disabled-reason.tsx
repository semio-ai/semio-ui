import type { ReactNode, SyntheticEvent } from "react";

/**
 * How a disabled menu entry with a reason stays reachable by keyboard and screen reader.
 *
 * Radix drops a `disabled` item from its roving focus order, so arrow keys skip it and a
 * reason shown as a tooltip is reachable only by hovering. An entry that is disabled
 * AND carries a reason therefore does not hand `disabled` to the Radix part. It states
 * its own disabled-ness instead (`aria-disabled`, and the `data-disabled` the styles key
 * off), stays in the focus order, and names its reason as a permanent accessible
 * description. The reason lives in a `hidden` element beside the entry rather than in
 * the tooltip, because a tooltip's own description exists only while it is open, so a
 * screen reader landing on the entry would announce nothing.
 *
 * The entry stays inert by preventing its click. Radix routes every selection through
 * the item's click — Enter and Space call `click()`, and a pointer press ends in one —
 * and skips its select when that click is already prevented, so no `onSelect`, value
 * change or checkbox toggle follows. The reason's tooltip stays open through the
 * press: `Tooltip` ignores close requests while its `aria-disabled` trigger is being
 * pressed.
 *
 * An entry that is disabled without a reason has nothing to say and still leaves the
 * focus order, exactly as Radix's `disabled` does.
 */
export interface ExplainedDisabled {
  /** Disabled and carrying a reason: reachable, inert, described. */
  explained: boolean;
  /** The `disabled` to hand the Radix part. True only for an entry with no reason. */
  primitiveDisabled: boolean;
  /** Spread onto the Radix part, after any handler it already has. Empty unless `explained`. */
  itemProps: {
    "aria-disabled"?: true;
    "data-disabled"?: "";
    "aria-describedby"?: string;
    onClick?: (event: SyntheticEvent) => void;
  };
  /** Render beside the entry, inside the menu content. Null unless `explained`. */
  reasonElement: ReactNode;
}

const prevent = (event: SyntheticEvent) => {
  event.preventDefault();
};

/**
 * @param disabled - Whether the entry is disabled.
 * @param reason - Why, when the consumer gave a reason.
 * @param reasonId - A document-unique id for the reason element.
 */
export function explainDisabled(
  disabled: boolean | undefined,
  reason: string | undefined,
  reasonId: string,
): ExplainedDisabled {
  if (!disabled || !reason) {
    return {
      explained: false,
      primitiveDisabled: Boolean(disabled),
      itemProps: {},
      reasonElement: null,
    };
  }
  return {
    explained: true,
    primitiveDisabled: false,
    itemProps: {
      "aria-disabled": true,
      "data-disabled": "",
      "aria-describedby": reasonId,
      onClick: prevent,
    },
    reasonElement: (
      <span id={reasonId} hidden>
        {reason}
      </span>
    ),
  };
}
