import { createContext, useContext, type ReactNode } from "react";

/**
 * Layout state read by `MenuButton` to drive its expand/collapse behavior and
 * tooltip suppression. The context is required — `MenuButton` always reads
 * from it, and consumers pick the source of truth at the Provider site:
 *
 * - The main app menu wraps its `MenuButton`s in a Provider that pipes the
 *   global jotai atoms (`useMenuState()` / `useDesktopState()`) through.
 * - Modal sidebars (e.g. `SidebarModal`) wrap their `MenuButton`s in a
 *   Provider whose values are local component state, so the modal's sidebar
 *   expand/collapse is independent of the app menu.
 */
export interface MenuButtonContextValue {
  /** Whether the surrounding menu is in its labels-visible state. */
  expanded: boolean;
  /** Whether the layout is desktop-sized (controls tooltip side, etc.). */
  desktop: boolean;
  /**
   * Tailwind class applied to the `MenuButton` element when expanded.
   * The main menu uses `desktop:group-data-expanded/menu:w-47` (rigid).
   * Sidebars that should size to content use `desktop:group-data-expanded/menu:w-auto`.
   */
  expandedWidthClassName: string;
  /**
   * Tailwind class applied to the inner label `<span>` when expanded.
   * The main menu uses `w-37.5` (rigid). Content-sized sidebars pass `""`.
   */
  expandedLabelClassName: string;
}

const MenuButtonContext = createContext<MenuButtonContextValue | null>(null);

export function MenuButtonProvider({
  value,
  children,
}: {
  value: MenuButtonContextValue;
  children: ReactNode;
}) {
  return <MenuButtonContext.Provider value={value}>{children}</MenuButtonContext.Provider>;
}

export function useMenuButtonContext(): MenuButtonContextValue {
  const ctx = useContext(MenuButtonContext);
  if (!ctx) {
    throw new Error(
      "MenuButton must be wrapped in <MenuButtonProvider>. The main app menu provides one in `Menu`; modals like `SidebarModal` provide their own.",
    );
  }
  return ctx;
}
