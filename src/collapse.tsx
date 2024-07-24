import { ReactNode } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { IconChevronUp, IconChevronLeft } from "@tabler/icons-react";
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
    <Collapsible.Root
      open={open}
      onOpenChange={onStateChange}
      disabled={disabled}
      // className="border-t-2 border border-solid border-t-semio-yellow/50 border-semio-yellow/25"
    >
      <Collapsible.Trigger
        className={clsx(
          "dark:bg-black bg-white flex items-center w-full",
          "justify-between cursor-pointer pl-3 pt-1 pb-1 pr-3",
          disabled
            ? "dark:text-neutral-400 text-neutral-600"
            : "dark:text-white text-black",
        )}
      >
        {side === "right" && title}
        {direction === "horizontal" ? (
          <IconChevronLeft
            className={clsx(
              "transition-transform w-5 h-5",
              open ? "rotate-0" : "rotate-180",
            )}
          />
        ) : (
          <IconChevronUp
            className={clsx(
              "transition-transform w-5 h-5",
              open ? "rotate-0" : "rotate-180",
            )}
          />
        )}
        {side === "left" && title}
      </Collapsible.Trigger>

      <Collapsible.Content
        className={clsx(
          direction === "horizontal"
            ? "CollapsibleHorizontalContent"
            : "CollapsibleVerticalContent",
        )}
      >
        <div className={direction === "vertical" ? "h-auto" : "w-auto"}>
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
