import type { ReactNode } from "react";

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
 * The consuming component keeps the entry inert: it prevents Radix's `onSelect`, so the
 * menu stays open, and it refuses the entry's value or action.
 *
 * An entry that is disabled without a reason has nothing to say and still leaves the
 * focus order, exactly as Radix's `disabled` does.
 */
export interface DisabledReason {
  /** Disabled and carrying a reason: reachable, inert, described. */
  explained: boolean;
  /** The `disabled` to hand the Radix part. True only for an entry with no reason. */
  primitiveDisabled: boolean;
  /** Spread onto the Radix part. Empty unless `explained`. */
  itemProps: {
    "aria-disabled"?: true;
    "data-disabled"?: "";
    "aria-describedby"?: string;
  };
  /** Render beside the entry, inside the menu content. Null unless `explained`. */
  reasonElement: ReactNode;
}

/**
 * @param disabled - Whether the entry is disabled.
 * @param reason - Why, when the consumer gave a reason.
 * @param reasonId - A document-unique id for the reason element.
 */
export function disabledReason(
  disabled: boolean | undefined,
  reason: string | undefined,
  reasonId: string,
): DisabledReason {
  const explained = Boolean(disabled && reason);
  if (!explained) {
    return {
      explained,
      primitiveDisabled: Boolean(disabled),
      itemProps: {},
      reasonElement: null,
    };
  }
  return {
    explained,
    primitiveDisabled: false,
    itemProps: {
      "aria-disabled": true,
      "data-disabled": "",
      "aria-describedby": reasonId,
    },
    reasonElement: (
      <span id={reasonId} hidden>
        {reason}
      </span>
    ),
  };
}
