import { IconView360, IconTransformPoint, IconRotate2, IconAnchor, IconRotate, IconPencil } from "@tabler/icons-react";

export function WorldElementEditorIcon({ type }: { type: string }) {
  let icon;

  switch (type) {
      case "shape":
          icon = <IconView360 size="20px" />;
          break;
      case "body":
          icon = <IconTransformPoint size="20px" />;
          break;
      case "revolute":
          icon = <IconRotate2 size="20px" />;
          break;
      case "fixed":
          icon = <IconAnchor size="20px" />;
          break;
      case "continuous":
          icon = <IconRotate size="20px" />;
          break;
      default:
          icon = <IconPencil size="20px" />;
          break;
  }

  return <div className="text-neutral-700 dark:text-neutral-300">{icon}</div>;
}
