import clsx from "clsx";
import { ReactNode } from "react";

export interface TextButtonProps {
  /**
   * The text to display on the button
   */
  children: ReactNode;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Optional class name
   */
  className?: string;
}
export function TextButton({
  children,
  disabled,
  onClick,
  className,
}: TextButtonProps) {
  return (
    <button
      className={clsx(
        "transition-colors",
        "dark:text-white text-black",
        "dark:bg-neutral-600 bg-neutral-400",
        "hover:bg-neutral-500",
        "pt-2 pb-2 pr-4 pl-4",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
