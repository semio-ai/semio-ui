import { useRef, useState } from "react";
import type { Result } from "@semio/utils";
import { Button } from "../buttons/button";
import type { IconName } from "../icons/registry";
import { NestedItem } from "../nested-elements/item";
import { Size, Variant } from "../types";
import { Dropdown } from "./dropdown";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: IconName;
  description?: string;
  disabled?: boolean;
  /** Success optionally supplies feedback; failures supply a user-facing explanation. */
  onSelect: () => Result<string | void, string> | Promise<Result<string | void, string>>;
}

export interface ActionMenuSpec {
  icon: IconName;
  label: string;
  items: ActionMenuItem[];
}

export interface ActionMenuFeedback {
  message: string;
  failed: boolean;
}

/** A caller-configured action menu. The caller owns all domain behavior and messages. */
export function ActionMenu({
  menu,
  iconOnly = false,
  variant = Variant.Default,
  side = "bottom",
  onOpenChange,
  onBusyChange,
  onFeedback,
  portalContainer,
}: {
  menu: ActionMenuSpec;
  iconOnly?: boolean;
  variant?: Variant;
  side?: "top" | "bottom";
  onOpenChange?: (open: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onFeedback?: (feedback: ActionMenuFeedback | undefined) => void;
  portalContainer?: HTMLElement | null;
}) {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [feedback, setFeedback] = useState<ActionMenuFeedback>();
  const publish = (value: ActionMenuFeedback | undefined) => {
    setFeedback(value);
    onFeedback?.(value);
  };
  const run = async (item: ActionMenuItem) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    onBusyChange?.(true);
    publish(undefined);
    try {
      // Invoke synchronously in the selection event, before awaiting, for browser user activation.
      const result = await item.onSelect();
      result.match(
        (message) => {
          if (message) publish({ message, failed: false });
        },
        (message) => publish({ message, failed: true }),
      );
    } catch {
      publish({ message: "Could not complete this action. Try again.", failed: true });
    } finally {
      busyRef.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };
  return (
    <>
      <Dropdown
        side={side}
        matchTriggerWidth={false}
        contentClassName="max-w-72"
        onOpenChange={onOpenChange}
        portalContainer={portalContainer}
        trigger={
          <Button
            size={iconOnly ? Size.Sm : Size.Md}
            variant={variant}
            visuals="inverted-border"
            leftIcon={menu.icon}
            rightIcon={iconOnly ? undefined : "menu-trigger"}
            altText={menu.label}
            title={menu.label}
            aria-disabled={busy || undefined}
          >
            {iconOnly ? undefined : menu.label}
          </Button>
        }
      >
        {menu.items.map((item) => (
          <NestedItem
            key={item.id}
            left={item.icon}
            description={item.description}
            disabled={busy || item.disabled}
            onClick={() => void run(item)}
          >
            {item.label}
          </NestedItem>
        ))}
      </Dropdown>
      {!onFeedback && (
        <span role="status" className={feedback ? "text-sm" : "sr-only"}>
          {feedback?.message ?? null}
        </span>
      )}
    </>
  );
}
