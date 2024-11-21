import { ReactNode } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import type {
  CollapsibleContentProps,
  CollapsibleTriggerProps,
  CollapsibleProps,
} from "@radix-ui/react-collapsible";
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
          "bg-neutral-200 dark:bg-neutral-800 flex items-center w-full",
          "justify-between cursor-pointer pl-3 pt-1 pb-1 pr-3",
          disabled ? "dark:text-neutral-400 text-neutral-600" : "dark:text-white text-black",
        )}
      >
        {side === "right" && title}
        {direction === "horizontal" ? (
          <IconChevronLeft
            className={clsx("transition-transform w-5 h-5", open ? "rotate-0" : "-rotate-90")}
          />
        ) : (
          <IconChevronDown
            className={clsx("transition-transform w-5 h-5", open ? "rotate-0" : "-rotate-90")}
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

export function CollapsibleContent(props: CollapsibleContentProps) {
  return (
    <Collapsible.Content {...props} className={clsx("CollapsibleVerticalContent", props.className)}>
      <div className="h-auto">{props.children}</div>
    </Collapsible.Content>
  );
}

export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return (
    <Collapsible.Trigger {...props} className={props.className}>
      {props.children}
    </Collapsible.Trigger>
  );
}

export function CollapsibleRoot(props: CollapsibleProps) {
  return (
    <Collapsible.Root {...props} className={props.className}>
      {props.children}
    </Collapsible.Root>
  );
}
