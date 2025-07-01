import { ConfiguredNestedMenu } from "../../nested-elements/types";

export interface ActionItemPlaceholder {
  id: string;
  type: "placeholder";
}

export type ActionItem = ConfiguredNestedMenu | ActionItemPlaceholder;

export const isPlaceholder = (
  item: Partial<ActionItem> | ActionItem,
): item is ActionItemPlaceholder => {
  return "type" in item && item.type === "placeholder";
};
