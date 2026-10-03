import { PaneSpec } from "../types";
import { Icon } from "../icons/registry";

export function createPane(): PaneSpec {
  return {
    id: crypto.randomUUID(),
    name: "New Pane",
    icon: <Icon name="pane-placeholder" />,
    size: "240px",
    inLeftMenu: true,
    inRightMenu: false,
  };
}
