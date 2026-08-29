import { clsx } from "clsx";
import { Size, Variant } from "../types";

/** Cap the popup height to the available space below the anchor. */
export const POPUP_MAX_HEIGHT_CLASS = "max-h-[calc(var(--available-height)-4px)]";

/**
 * Class for the Positioner element.
 *
 * **Carries no `z-index`, and a replacement belongs to the host rather than here.** The
 * popup portals to the end of `<body>` and stacks at `auto`, which is what every other
 * overlay in this package does and is sufficient against this app's chrome — measured in
 * `floating/overlay-stacking.browser.tsx`, which also records the one property holding
 * that up. A host stacking against something taller passes `portalContainer` and owns the
 * ordering itself; a number picked here would be a guess about a page the library cannot
 * see, and would have to keep being raised.
 *
 * **If a `z-index` ever does belong on this component, it goes here and not on the Popup.**
 * Positioner is the actually-positioned (`position: absolute`) element, so it is the one a
 * `z-index` applies to at all; the same value on the non-positioned Popup child does
 * nothing. That is also why `popupClassName` cannot reach this — by design, since what it
 * would reach is the element where the property is inert.
 */
export function positionerClassName(extras?: string) {
  return clsx(extras);
}

export function popupClassName(opts?: { variant?: Variant; color?: string; extras?: string }) {
  return clsx(
    // Variant/custom-color class first, so anything inside the popup that reads an
    // accent resolves it against the same variant as the input/trigger. It no longer
    // tints the popup's own edge: `.card-overlay` has no border, so the variant
    // reaches only the content.
    opts?.color ? "custom-color" : (opts?.variant ?? Variant.Default),
    "responsive card-overlay dropdown-content",
    "m-0.5 rounded-sm",
    "w-[calc(var(--available-width)-4px)]",
    "desktop:w-[calc(var(--anchor-width)+10px)]",
    POPUP_MAX_HEIGHT_CLASS,
    "overflow-hidden outline-hidden",
    "origin-[var(--transform-origin)]",
    "transition-[opacity,transform] duration-150",
    "data-starting-style:opacity-0 data-starting-style:scale-95",
    "data-ending-style:opacity-0 data-ending-style:scale-95",
    opts?.extras,
  );
}

/** Wrapper around the ScrollArea so it can scroll within the popup's max-height. */
export function popupScrollWrapperClassName() {
  return POPUP_MAX_HEIGHT_CLASS;
}

/** Inner viewport — applies the popup's content padding and child gap. */
export function popupViewportClassName() {
  return clsx(POPUP_MAX_HEIGHT_CLASS, "flex flex-col gap-0.5 p-0.5");
}

export function listClassName() {
  return "flex flex-col gap-0.5";
}

/**
 * Item class soup matches `NestedRadio` / `NestedItem` so popups feel identical
 * to Select's. Pair with a `data-state="checked"|"unchecked"` attribute on the
 * item — base-ui exposes `data-selected` but the project's `check-indicator` /
 * `highlight-list-item` styles key off `data-state`.
 */
export function itemClassName(opts?: { variant?: Variant; color?: string; extras?: string }) {
  return clsx(
    "group/item flex items-center rounded-xs leading-none",
    "relative h-7 px-1.25 pl-7.5 text-sm outline-hidden select-none",
    "data-disabled:pointer-events-none",
    "responsive highlight-list-item",
    opts?.color ? "custom-color" : (opts?.variant ?? Variant.Default),
    opts?.extras,
  );
}

export function itemIndicatorClassName(opts?: { variant?: Variant; color?: string }) {
  return clsx(
    "absolute top-1/2 left-1 grid -translate-y-1/2 place-items-center",
    "responsive check-indicator",
    opts?.color ? "custom-color" : (opts?.variant ?? Variant.Default),
  );
}

export function groupLabelClassName() {
  return clsx(
    "px-2 pt-1.5 pb-0.5",
    "text-xs font-medium tracking-wide text-neutral-500",
    "uppercase",
  );
}

/**
 * Empty/loading row geometry mirrors `itemClassName` (height, paddings, text size)
 * so the message lines up with where item labels would render.
 */
export function emptyClassName() {
  return clsx("flex items-center leading-none", "h-7 px-1.25 pl-7.5 text-sm", "text-neutral-500");
}

export function statusClassName() {
  return "sr-only";
}

export function inputGroupClassName(size: Size) {
  return clsx("relative flex flex-row outline-hidden", "sized-height w-full", size);
}

export function inputClassName(
  size: Size,
  variant: Variant,
  opts?: {
    bg?: boolean;
    outline?: "hidden" | "interact" | "always";
    readOnly?: boolean;
    leftPadded?: boolean;
    rightPadded?: boolean;
  },
) {
  const {
    bg = true,
    outline = "interact",
    readOnly = false,
    leftPadded = true,
    rightPadded = true,
  } = opts ?? {};
  return clsx(
    "responsive",
    bg && "bg-neutral-50/20 dark:bg-neutral-950/20",
    "rounded-xs",
    outline === "interact" && !readOnly && "variant-responsive-appearing-outline",
    outline === "always" && !readOnly && "variant-responsive-persistent-outline",
    outline === "hidden" && "outline-hidden focus:outline-hidden",
    size,
    variant,
    "peer cursor-text disabled:cursor-not-allowed",
    "sized-text sized-height flex min-w-10 flex-1",
    leftPadded ? "sized-inner-group-left-padding" : "pl-2",
    rightPadded ? "sized-inner-group-right-padding" : "pr-2",
    "variant-text-caret-color",
    "text-black dark:text-white",
  );
}

export function leftIconClassName(size: Size, variant: Variant) {
  return clsx(
    variant,
    size,
    "responsive pointer-events-none absolute top-0.5 left-0.5 grid place-items-center",
    "sized-inner-group-item variant-responsive-input-extra-text rounded-[1px]",
  );
}

export function rightButtonClassName(size: Size, variant: Variant) {
  return clsx(
    variant,
    size,
    "absolute top-0.5 right-0.5 grid place-items-center",
    "responsive transition-all transition-discrete delay-75",
    "sized-inner-group-item variant-responsive-input-extra-button-text rounded-[1px]",
    "outline-hidden",
  );
}

export function rightChevronClassName(size: Size, variant: Variant) {
  // The `select-indicator` is a static double chevron (it signals "opens a list",
  // not a direction), so the trigger no longer flips 180° on open — that caret
  // rotation was for the old single chevron and read as a glitchy sweep on the
  // symmetric double chevron. Just the base button styling now.
  return rightButtonClassName(size, variant);
}
