import { Icon } from "./registry/icon";

/** @deprecated Legacy robot sidebar helper; no mounted Studio consumer. Avoid new usage. */
export function WorldElementIcon({ type }: { type: string }) {
  switch (type) {
    case "shape":
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="view360" size="none" className="size-5" />
        </div>
      );
    case "body":
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="transform-point" size="none" className="size-5" />
        </div>
      );
    case "revolute":
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="rotate2" size="none" className="size-5" />
        </div>
      );
    case "fixed":
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="pinned" size="none" className="size-5" />
        </div>
      );
    case "continuous":
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="rotate" size="none" className="size-5" />
        </div>
      );
    case "prismatic":
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="line" size="none" className="size-5" />
        </div>
      );
    default:
      return (
        <div className="text-neutral-700 dark:text-neutral-300">
          <Icon name="pencil" size="none" className="size-5" />
        </div>
      );
  }
}
