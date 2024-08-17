import { IconView360, IconTransformPoint, IconRotate2, IconAnchor, IconRotate, IconPencil } from "@tabler/icons-react";



export function WorldElementEditorIcon({type}: {type: string}) {
    switch (type) {
      case "shape":
        return (
          <div className="text-neutral-700 dark:text-neutral-300">
            <IconView360 size="20px" />
          </div>
        );
      case "body":
        return (
          <div className="text-neutral-700 dark:text-neutral-300">
             <IconTransformPoint size="20px" />
          </div>
        );
      case "revolute":
        return (
          <div className="text-neutral-700 dark:text-neutral-300">
             <IconRotate2 size="20px" />
          </div>
        );
      case "fixed":
        return (
          <div className="text-neutral-700 dark:text-neutral-300">
             <IconAnchor size="20px" />
          </div>
        );
      case "continuous":
        return (
          <div className="text-neutral-700 dark:text-neutral-300">
             <IconRotate size="20px" />
          </div>
        );
      default:
        return (
          <div className="text-neutral-700 dark:text-neutral-300">
             <IconPencil size="20px" />
          </div>
        );
    }
}
