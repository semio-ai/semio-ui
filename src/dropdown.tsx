import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { ReactNode } from "react";
import { Variant } from "./types";
import { getBasicTextColor, getBorder } from "./variant-colors";

export interface DropdownProps {
  title?: string;
  trigger: ReactNode;
  content: ReactNode;
  open?: boolean;
  onStateChange?: (open: boolean) => void;
  variant?: Variant;
}

function Dropdown({
  title,
  trigger,
  content,
  open,
  onStateChange,
  variant,
}: DropdownProps) {
  return (
    <div className="relative inline-block text-left">
      <DropdownPrimitive.Root open={open} onOpenChange={onStateChange} modal={false}>
        <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
        <DropdownPrimitive.Content
          align="center"
          sideOffset={4}
          className={clsx(
            "DropdownContent",
            "w-48 p-4 shadow-md md:w-56",
            // "bg-neutral-50/75 dark:bg-neutral-950/75 backdrop-blur-lg",
            "border-t-2 border-solid",
            // `border-${rootVariant[variant ?? Variant.WARNING]}-500`,
            getBorder(variant),
          )}
        >
          <DropdownPrimitive.Arrow
            className={clsx("fill-current", getBasicTextColor(variant))}
          />

          <div className="flex justify-between">
            <span>{title}</span>
          </div>
          {content}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Root>
    </div>
  );
}

export { Dropdown };
