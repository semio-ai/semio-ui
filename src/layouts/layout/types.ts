import { ConfiguredNestedMenu } from "../../nested-elements/types";

export interface ActionItemPlaceholder {
  id: string;
  type: "placeholder";
}

/** Footer actions open a menu by default; onClick makes the entry a direct action. */
export type ActionItem = (ConfiguredNestedMenu & { onClick?: () => void }) | ActionItemPlaceholder;

export const isPlaceholder = (
  item: Partial<ActionItem> | ActionItem,
): item is ActionItemPlaceholder => {
  return "type" in item && item.type === "placeholder";
};
