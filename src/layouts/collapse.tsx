import { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { clsx } from "clsx";
import { Icon, DisclosureIcon } from "../icons/registry";
import { LegacySizePanel } from "./legacy-size-panel";

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
      render={(props, state) => <div {...props} data-state={state.open ? "open" : "closed"} />}
    >
      <Collapsible.Trigger
        render={(props, state) => (
          <button
            {...props}
            type="button"
            tabIndex={undefined}
            data-state={state.open ? "open" : "closed"}
          />
        )}
        className={clsx(
          "flex w-full items-center bg-neutral-200 dark:bg-neutral-800",
          "cursor-pointer justify-between pt-1 pr-3 pb-1 pl-3",
          disabled ? "text-neutral-600 dark:text-neutral-400" : "text-black dark:text-white",
        )}
      >
        {side === "right" && title}
        {direction === "horizontal" ? (
          // Directional variant: horizontal collapse points its chevron left, so it
          // keeps its own glyph rather than the (downward) `disclosure` role.
          <Icon
            name="pane-collapse"
            className={clsx("h-5 w-5 transition-transform", open ? "rotate-0" : "-rotate-90")}
          />
        ) : (
          <DisclosureIcon open={open} className="h-5 w-5" />
        )}
        {side === "left" && title}
      </Collapsible.Trigger>

      <Collapsible.Panel
        render={(props, state) => (
          <LegacySizePanel {...props} data-state={state.open ? "open" : "closed"} />
        )}
        className={clsx(
          "bg-transparent",
          direction === "horizontal"
            ? "CollapsibleHorizontalContent"
            : "CollapsibleVerticalContent",
        )}
      >
        <div className={direction === "vertical" ? "h-auto" : "w-auto"}>{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
