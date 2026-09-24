import { clsx } from "clsx";
import { Variant } from "../types";

export interface AnchorProps {
  onClick: () => void;
  variant?: Variant;
  children: string;
}

export function Anchor({ onClick, variant, children }: AnchorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        variant,
        "variant-scope",
        "variant-responsive-text focus:outline-hidden",
        "cursor-pointer disabled:cursor-default",
      )}
    >
      {children}
    </button>
  );
}
