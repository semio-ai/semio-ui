import { Variant } from "../types";
import { ActionItem } from "../layouts/layout/types";
import { Icon } from "../icons/registry";

export function createActionItem(): ActionItem {
  return {
    id: crypto.randomUUID(),
    left: <Icon name="action-placeholder" />,
    children: [],
    label: "Action Item",
    variant: Variant.Default,
  };
}
