import type { ReactNode } from "react";

/** A permanent accessible description for a disabled entry that supplies a reason. */
export interface ExplainedDisabled {
  explained: boolean;
  /** Base UI keeps disabled menu parts keyboard reachable and prevents activation. */
  primitiveDisabled: boolean;
  itemProps: { "aria-describedby"?: string };
  reasonElement: ReactNode;
}

export function explainDisabled(
  disabled: boolean | undefined,
  reason: string | undefined,
  reasonId: string,
): ExplainedDisabled {
  const explained = Boolean(disabled && reason);
  return {
    explained,
    primitiveDisabled: Boolean(disabled),
    itemProps: explained ? { "aria-describedby": reasonId } : {},
    reasonElement: explained ? (
      <span id={reasonId} hidden>
        {reason}
      </span>
    ) : null,
  };
}
