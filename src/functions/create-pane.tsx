import { IconSquare } from "@tabler/icons-react";
import { PaneSpec } from "../types";
import { ICON_CLASS_NAME } from "../constants/icon";

export function createPane(): PaneSpec {
  return {
    id: crypto.randomUUID(),
    name: "New Pane",
    icon: <IconSquare className={ICON_CLASS_NAME} />,
    size: "240px",
    inLeftMenu: true,
    inRightMenu: false,
  };
}
