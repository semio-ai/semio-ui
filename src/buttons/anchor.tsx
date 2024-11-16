import { clsx } from "clsx";
import { Variant } from "../types";
import { getHoverTextStyles } from "../style-functions";

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
      className={clsx(getHoverTextStyles(variant), "focus:outline-none")}
    >
      {children}
    </button>
  );
}
