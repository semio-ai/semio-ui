import { IconSquare } from "@tabler/icons-react";
import { Variant } from "../types";
import { ActionItem } from "../nested-elements/types";

export function createActionItem(): ActionItem {
  return {
    id: crypto.randomUUID(),
    left: <IconSquare className="w-3/5 h-3/5" />,
    children: [],
    label: "Action Item",
    variant: Variant.Default,
  };
}
