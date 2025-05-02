import { IconSquare } from "@tabler/icons-react";
import { PaneSpec } from "../types";

export function createPane(): PaneSpec {
  return {
    id: crypto.randomUUID(),
    name: "New Pane",
    icon: <IconSquare className="w-3/5 h-3/5" />,
    size: "240px",
    content: <div className="w-full h-full bg-primary-500">New Pane Content</div>,
    inLeftMenu: true,
    inRightMenu: false,
  };
}
