import { ReactNode } from "react";
import { Collapsible } from "radix-ui";
import { IconChevronDown, IconChevronLeft } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface CollapseProps {
  title: string | ReactNode;
  children: ReactNode;
  onStateChange?: (open: boolean) => void;
  open?: boolean;
  direction?: "vertical" | "horizontal";
  disabled?: boolean;
  side?: "left" | "right";
}

export function Collapse({
  open,
  title,
  onStateChange = () => {},
  children,
  direction,
  disabled,
  side = "right",
}: CollapseProps): ReactNode {
  return (
    <Collapsible.Root open={open} onOpenChange={onStateChange} disabled={disabled}>
      <Collapsible.Trigger
        className={clsx(
          "flex w-full items-center bg-neutral-200 dark:bg-neutral-800",
          "cursor-pointer justify-between pt-1 pr-3 pb-1 pl-3",
          disabled ? "text-neutral-600 dark:text-neutral-400" : "text-black dark:text-white",
        )}
      >
        {side === "right" && title}
        {direction === "horizontal" ? (
          <IconChevronLeft
            className={clsx("h-5 w-5 transition-transform", open ? "rotate-0" : "-rotate-90")}
          />
        ) : (
          <IconChevronDown
            className={clsx("h-5 w-5 transition-transform", open ? "rotate-0" : "-rotate-90")}
          />
        )}
        {side === "left" && title}
      </Collapsible.Trigger>

      <Collapsible.Content
        className={clsx(
          "bg-transparent",
          direction === "horizontal"
            ? "CollapsibleHorizontalContent"
            : "CollapsibleVerticalContent",
        )}
      >
        <div className={direction === "vertical" ? "h-auto" : "w-auto"}>{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export const CollapsibleContent = Collapsible.Content;
export const CollapsibleTrigger = Collapsible.Trigger;
export const CollapsibleRoot = Collapsible.Root;
