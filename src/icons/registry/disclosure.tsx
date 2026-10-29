import { clsx } from "clsx";
import { useOptionalContext } from "../../context/context-providers";
import { IconRegistryContext } from "./icon-context";
import { defaultIconRegistry } from "./default-registry";
import { Icon } from "./icon";

export interface DisclosureIconProps {
  /** Expanded state, for JS-driven consumers (e.g. `Collapse`). */
  open?: boolean;
  /**
   * Drive rotation from a Radix `group-data-[state]` ancestor instead of `open`,
   * for Radix-state components (e.g. `Accordion`). Always rotates — it can't swap,
   * since the open/closed state never reaches JS.
   */
  fromGroupState?: boolean;
  /** Sizing/extra classes. `DisclosureIcon` imposes no size of its own. */
  className?: string;
}

/**
 * The disclosure affordance — the accordion/collapse/dropdown chevron. Resolves
 * the `disclosure-closed` / `disclosure-open` role keys and picks behavior:
 *
 * - **Both keys resolve to the same component** (the default): render one element
 *   and rotate it — preserving the smooth chevron animation.
 * - **A consumer overrode them to different glyphs** (e.g. `plus`/`minus`): swap
 *   between the two (JS `open` only).
 *
 * The rotate-vs-swap decision lives here, once — not as a per-consumer branch.
 */
export function DisclosureIcon({
  open = false,
  fromGroupState = false,
  className,
}: DisclosureIconProps) {
  const registry = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  const sameGlyph =
    Boolean(registry["disclosure-open"]) &&
    registry["disclosure-open"] === registry["disclosure-closed"];

  if (fromGroupState) {
    return (
      <Icon
        name="disclosure-open"
        size="none"
        className={clsx(
          "transition-transform",
          "group-data-[state=closed]:-rotate-90 group-data-[state=open]:rotate-0",
          className,
        )}
      />
    );
  }

  if (sameGlyph) {
    return (
      <Icon
        name="disclosure-open"
        size="none"
        className={clsx("transition-transform", open ? "rotate-0" : "-rotate-90", className)}
      />
    );
  }

  return (
    <Icon name={open ? "disclosure-open" : "disclosure-closed"} size="none" className={className} />
  );
}
