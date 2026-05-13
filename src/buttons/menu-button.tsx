import {
  type AriaAttributes,
  type AriaRole,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { clsx } from "clsx";
import { Variant } from "../types";
import { Status } from "../feedback/status";
import { Tooltip } from "../floating/tooltip";
import { useMenuButtonContext } from "../context/menu-button-context";

export interface MenuButtonProps {
  children: string;
  altText?: string;
  icon: ReactNode;
  onClick?: MouseEventHandler;
  active?: boolean;
  hoverable?: boolean;
  /**
   * Show a subtle accent-tinted background on hover, and a darker tint when
   * the button has `active` (i.e. `data-active`). Off by default — opt in
   * for menu-style lists where rows should react visually to the cursor.
   */
  bg?: boolean;
  /**
   * When true, all visual active-state styling (background tint *and* the
   * accent text/icon color from `variant-responsive-selectable-text`) only
   * applies at the `desktop:` breakpoint. `aria-current` and `data-active`
   * are unaffected so semantics stay correct.
   *
   * Useful for sidebars that drill-in on mobile — once the user navigates
   * away from the list, a "selected" highlight on the sidebar is misleading.
   */
  activeOnDesktopOnly?: boolean;
  variant?: Variant;
  status?: {
    variant?: Variant;
    placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    text?: string;
  };
  className?: string;
  textClassName?: string;
  /** Pass-through for native button focus/role/aria-* used by the tablist pattern. */
  tabIndex?: number;
  role?: AriaRole;
  "aria-selected"?: AriaAttributes["aria-selected"];
  "aria-controls"?: AriaAttributes["aria-controls"];
  id?: string;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  /** Ref to the underlying `<button>` element. */
  ref?: Ref<HTMLButtonElement>;
}

export function MenuButton({
  children,
  altText,
  icon,
  onClick,
  active,
  hoverable,
  bg,
  activeOnDesktopOnly,
  status,
  variant,
  className,
  textClassName,
  tabIndex,
  role,
  "aria-selected": ariaSelected,
  "aria-controls": ariaControls,
  id,
  onKeyDown,
  ref,
}: MenuButtonProps) {
  const { expanded, desktop, expandedWidthClassName, expandedLabelClassName } =
    useMenuButtonContext();
  const Wrapper = status ? Status : "div";
  // Override the active accent color (set by `variant-responsive-selectable-text`'s
  // `:where(.group/tab)[data-active] *` rule) on mobile, then re-apply at
  // desktop. Tailwind utilities here have higher specificity than the
  // base-layer rule, so they win.
  const activeOverride = activeOnDesktopOnly
    ? clsx(
        "group-data-active/tab:text-default-500",
        "desktop:group-data-active/tab:text-[var(--accent-color)]",
      )
    : undefined;
  const wrapperProps = status
    ? {
        variant: status.variant,
        placement: status.placement,
        text: status.text,
        className: clsx(
          "responsive",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          activeOverride,
        ),
      }
    : {
        className: clsx(
          "responsive",
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          "grid h-9 w-9 place-items-center",
          activeOverride,
        ),
      };

  return (
    <button
      ref={ref}
      type="button"
      id={id}
      role={role}
      tabIndex={tabIndex}
      aria-current={active ? "page" : undefined}
      aria-selected={ariaSelected}
      aria-controls={ariaControls}
      data-active={active ? "" : undefined}
      onKeyDown={onKeyDown}
      className={clsx(
        variant,
        // `responsive` so the variant's `--accent-color` is set on the
        // button itself — needed by both the optional `bg` highlight and
        // the focus-visible outline below. Children re-set `responsive`
        // independently, so this doesn't change inherited values for them.
        "responsive",
        "cursor-pointer disabled:cursor-default",
        "group/tab h-9 w-9 overflow-hidden",
        expandedWidthClassName,
        "transition-all",
        "grid grid-cols-[36px_1fr] grid-rows-1 place-items-center gap-1.5",
        // Suppress the UA-default focus ring (Chrome's blue ring etc.) and
        // replace with an inset accent outline shown only on keyboard focus
        // (`focus-visible`). Mouse clicks → no outline. Inset offset keeps
        // the outline from bleeding into adjacent rows in a list.
        "focus:outline-none",
        "focus-visible:outline-2 focus-visible:outline-solid",
        "focus-visible:outline-offset-[-2px]",
        "focus-visible:outline-[var(--accent-color)]",
        // Optional hover/active background.
        bg && [
          "rounded-sm",
          "hover:bg-[color-mix(in_oklab,var(--accent-color)_15%,transparent)]",
          activeOnDesktopOnly
            ? [
                "desktop:data-active:bg-[color-mix(in_oklab,var(--accent-color)_25%,transparent)]",
                "desktop:data-active:hover:bg-[color-mix(in_oklab,var(--accent-color)_35%,transparent)]",
              ]
            : [
                "data-active:bg-[color-mix(in_oklab,var(--accent-color)_25%,transparent)]",
                "data-active:hover:bg-[color-mix(in_oklab,var(--accent-color)_35%,transparent)]",
              ],
        ],
        className,
      )}
      onClick={onClick}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Tooltip
        invert
        variant={active ? variant : Variant.Default}
        disabled={expanded}
        content={altText ?? children}
        side={desktop ? "right" : "top"}
      >
        <Wrapper {...wrapperProps}>{icon}</Wrapper>
      </Tooltip>
      <span
        className={clsx(
          "responsive",
          "desktop:group-data-expanded/menu:opacity-100",
          "text-left opacity-0 truncate",
          expandedLabelClassName,
          hoverable ? "variant-responsive-selectable-text" : "variant-static-text",
          variant,
          activeOverride,
          textClassName,
        )}
      >
        {children}
      </span>
    </button>
  );
}
