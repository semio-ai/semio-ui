import { IconSquare } from "@tabler/icons-react";
import { Variant } from "../types";
import { ActionItem } from "../layouts/layout/types";
import { ICON_CLASS_NAME } from "../constants/icon";

export function createActionItem(): ActionItem {
  return {
    id: crypto.randomUUID(),
    left: <IconSquare className={ICON_CLASS_NAME} />,
    children: [],
    label: "Action Item",
    variant: Variant.Default,
  };
}
