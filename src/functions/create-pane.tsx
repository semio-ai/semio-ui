import { IconSquare } from "@tabler/icons-react";
import { PaneSpec } from "../types";

export function createPane(): PaneSpec {
  return {
    id: crypto.randomUUID(),
    name: "New Pane",
    icon: <IconSquare className="size-3/5" />,
    size: "240px",
    inLeftMenu: true,
    inRightMenu: false,
  };
}
