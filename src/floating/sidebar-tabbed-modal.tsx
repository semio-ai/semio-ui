import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog } from "radix-ui";
import { clsx } from "clsx";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronRightPipe,
  IconX,
} from "@tabler/icons-react";
import { Button } from "../buttons/button";
import { MenuButton } from "../buttons/menu-button";
import { MenuButtonProvider } from "../context/menu-button-context";
import { ICON_CLASS_NAME } from "../constants/icon";
import { ScrollArea } from "../layouts/scroll-area";
import { NestedSelect } from "../nested-elements/select";
import { Variant } from "../types";
import { ContextMenu } from "./context-menu";

export interface SidebarTab {
  key: string;
  title: string;
  icon?: ReactNode;
  variant?: Variant;
  content: ReactNode;
  /** Per-tab footer rendered at the bottom of the content pane. */
  contentFooter?: ReactNode;
}

export interface SidebarTabbedModalProps {
  open: boolean;
  onStateChange: (open: boolean) => void;
  /** Modal title — rendered as the sidebar header. */
  title: string | ReactNode;
  tabs: SidebarTab[];
  /** Controlled selected tab key. */
  selected?: string;
  onTabChange?: (key: string) => void;
  /** Optional bottom-of-sidebar slot (modal-level footer). */
  sidebarFooter?: ReactNode;
  /**
   * Icon shown in the sidebar header when the sidebar is collapsed on
   * desktop. Swaps in for the title text in that one state. Use a small
   * icon (e.g. `<IconSettings className={ICON_CLASS_NAME} />`) — the
   * collapsed rail is narrow.
   */
  collapsedIcon?: ReactNode;
  /**
   * Optional content prepended to the desktop right-click context menu on
   * the sidebar. The expand/collapse toggle is appended after these. Use
   * the project's `Nested*` primitives (e.g. `NestedRadio`, `NestedSelect`,
   * `NestedItem`) so styling matches.
   *
   * The context menu is disabled on mobile.
   */
  contextMenuExtras?: ReactNode;
  variant?: Variant;
  dismissDisabled?: boolean;
}

const PLACEHOLDER_TAB: SidebarTab = {
  key: "__placeholder__",
  title: "No content",
  content: <div className="grid h-full place-items-center text-neutral-500">No content</div>,
};

/**
 * A two-pane modal with a fixed-width sidebar of tabs on the left and the
 * active tab's content on the right. Each tab supplies its own title (used
 * both as the sidebar list label and the content-pane header), content, and
 * optional content footer. The modal-level `sidebarFooter` slot renders below
 * the sidebar tab list — analogous to the action items at the bottom of the
 * main app menu.
 *
 * Layout:
 * - Desktop: both panes side-by-side at equal height (via flex stretch). The
 *   modal is sized to a viewport-relative `clamp(...)` width so it doesn't
 *   reflow when the active tab's content changes; internals can react to the
 *   modal's width via container queries (`@container` is set on the content
 *   pane body).
 * - Mobile: sidebar fills the modal initially. Tapping a tab drills into the
 *   content pane (with a back chevron in its header). X close stays available
 *   on both views.
 *
 * Layout responsiveness uses the project's `desktop:` Tailwind variant
 * (= `(width >= 48rem) and (height >= 48rem)`) — no app-level layout atoms
 * are read, so the modal works in any context (Storybook, isolated renders).
 *
 * The sidebar tab buttons render via `MenuButton` inside a local
 * `MenuButtonProvider` so the modal's expand/collapse is independent of the
 * main app menu.
 */
export function SidebarTabbedModal({
  open,
  onStateChange,
  title,
  tabs,
  selected,
  onTabChange,
  sidebarFooter,
  collapsedIcon,
  contextMenuExtras,
  variant,
  dismissDisabled = false,
}: SidebarTabbedModalProps) {
  const tabList = useMemo<SidebarTab[]>(() => (tabs.length > 0 ? tabs : [PLACEHOLDER_TAB]), [tabs]);

  const [internalSelected, setInternalSelected] = useState<string>(tabList[0].key);
  const activeKey = selected ?? internalSelected;
  const activeTab = tabList.find((tab) => tab.key === activeKey) ?? tabList[0];

  // Mobile drill-down state. On desktop, both panes render via CSS regardless
  // of this value; on mobile, this controls which pane is visible.
  const [showingContent, setShowingContent] = useState(false);

  // Desktop-only collapse state. On mobile the sidebar always shows labels
  // (it fills the screen), so the toggle is irrelevant — we OR with
  // `!isDesktop` when reading.
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Local viewport detection for a11y attributes and viewport-aware JS only
  // (the layout itself is still pure CSS via the `desktop:` variant). A11y
  // attributes like `aria-hidden` can't be gated by media queries — they're
  // DOM attributes — so we need to know in JS whether we're on desktop.
  // Local `matchMedia` works in any context (Storybook, tests, etc.) without
  // the layout-root atom.
  const isDesktop = useIsDesktop();
  // Sidebar is "expanded" (labels visible) on mobile always, and on desktop
  // when not collapsed. Drives `data-ui` and the `MenuButtonProvider`.
  const sidebarExpanded = !isDesktop || !desktopCollapsed;

  // Stable ID prefix for tab/panel ARIA wiring.
  const baseId = useId();
  const tabId = useCallback((key: string) => `${baseId}-tab-${key}`, [baseId]);
  const panelId = useCallback((key: string) => `${baseId}-panel-${key}`, [baseId]);

  useEffect(() => {
    if (!open) {
      setShowingContent(false);
    }
  }, [open]);

  const handleSelect = useCallback(
    (key: string) => {
      if (selected === undefined) {
        setInternalSelected(key);
      }
      onTabChange?.(key);
      // Always set; harmless on desktop (CSS shows both panes anyway).
      setShowingContent(true);
    },
    [onTabChange, selected],
  );

  return (
    <Dialog.Root open={open} onOpenChange={!dismissDisabled ? onStateChange : undefined}>
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className={clsx(
            "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut transition-opacity",
            "fixed top-0 right-0 bottom-0 left-0 grid place-items-center",
            "p-0 bg-black/40",
          )}
        >
          <Dialog.Content
            forceMount
            aria-describedby={undefined}
            className={clsx(
              "responsive focus:outline-hidden",
              "animated-modal",
              variant,
              // Single `card` surrounds the whole modal — sidebar and content
              // panes share one bordered surface. On desktop the modal's bg
              // becomes a frosted-glass layer (mirroring `card-transparent`'s
              // recipe); the content pane covers its area with a solid bg so
              // only the SIDEBAR region reads as frosted. Mobile keeps
              // `card`'s solid `inset` bg.
              "card",
              "desktop:bg-layout-light-inset/90 desktop:dark:bg-layout-dark-inset/90",
              "desktop:backdrop-blur-xl",
              // `relative` so the absolute-positioned panes anchor here on
              // mobile; `overflow-hidden` clips the off-screen pane during
              // the slide transition AND keeps content inside the card's
              // rounded corners.
              "relative overflow-hidden",
              "flex flex-row",
              // Mobile: fill viewport.
              "h-[calc(100dvh-4px)] w-[calc(100vw-4px)]",
              // Desktop: viewport-relative clamped width AND height so the
              // modal doesn't reflow when the active tab's content changes
              // and so the inner ScrollAreas have a definite bound to scroll
              // against (rather than the modal expanding to fit all tabs).
              "desktop:w-[clamp(40rem,80vw,72rem)]",
              "desktop:h-[clamp(24rem,75dvh,calc(100dvh-4rem))]",
            )}
          >
            <MenuButtonProvider
              value={{
                expanded: sidebarExpanded,
                desktop: isDesktop,
                // Width depends on (viewport, expanded). Mobile is always
                // expanded so the base `!w-full` applies. Desktop default is
                // `w-9` (icon-only collapsed). Desktop+expanded re-applies
                // `w-full` via the `data-ui="expanded"` group selector. The
                // descendant selector in the third class has higher
                // specificity than the second, so it wins on desktop+expanded.
                expandedWidthClassName: clsx(
                  "!w-full",
                  "desktop:!w-9",
                  "desktop:group-data-expanded/menu:!w-full",
                ),
                // Same pattern for label opacity. `pr-3` adds 12px of
                // breathing room INSIDE the label (so the text doesn't run
                // flush to the right edge of the sidebar). The label fills
                // its grid cell with `w-full`, so the cell — and therefore
                // the button and the `w-fit` nav — grow by the padding to
                // accommodate it. Active-state bg still covers the full
                // row because the button itself is unchanged.
                expandedLabelClassName: clsx(
                  "!opacity-100 w-full pr-3",
                  "desktop:!opacity-0",
                  "desktop:group-data-expanded/menu:!opacity-100",
                ),
              }}
            >
              <SidebarPane
                title={title}
                tabs={tabList}
                activeKey={activeKey}
                onSelect={handleSelect}
                variant={variant}
                sidebarFooter={sidebarFooter}
                collapsedIcon={collapsedIcon}
                dismissDisabled={dismissDisabled}
                offScreenOnMobile={showingContent}
                ariaHidden={!isDesktop && showingContent}
                sidebarExpanded={sidebarExpanded}
                desktopCollapsed={desktopCollapsed}
                onToggleDesktopCollapsed={() => setDesktopCollapsed((prev) => !prev)}
                contextMenuExtras={contextMenuExtras}
                isDesktop={isDesktop}
                tabId={tabId}
                panelId={panelId}
              />
            </MenuButtonProvider>
            <ContentPane
              tab={activeTab}
              onBack={() => setShowingContent(false)}
              variant={variant}
              dismissDisabled={dismissDisabled}
              offScreenOnMobile={!showingContent}
              ariaHidden={!isDesktop && !showingContent}
              tabId={tabId(activeTab.key)}
              panelId={panelId(activeTab.key)}
            />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SidebarPane({
  title,
  tabs,
  activeKey,
  onSelect,
  variant,
  sidebarFooter,
  collapsedIcon,
  dismissDisabled,
  offScreenOnMobile,
  ariaHidden,
  sidebarExpanded,
  desktopCollapsed,
  onToggleDesktopCollapsed,
  contextMenuExtras,
  isDesktop,
  tabId,
  panelId,
}: {
  title: string | ReactNode;
  tabs: SidebarTab[];
  activeKey: string;
  onSelect: (key: string) => void;
  variant?: Variant;
  sidebarFooter?: ReactNode;
  collapsedIcon?: ReactNode;
  dismissDisabled: boolean;
  offScreenOnMobile: boolean;
  ariaHidden: boolean;
  sidebarExpanded: boolean;
  desktopCollapsed: boolean;
  onToggleDesktopCollapsed: () => void;
  contextMenuExtras?: ReactNode;
  isDesktop: boolean;
  tabId: (key: string) => string;
  panelId: (key: string) => string;
}) {
  const tabListRef = useRef<HTMLDivElement>(null);

  // Roving tabindex + arrow-key navigation across the tab buttons. Tab
  // enters the tablist on the active tab (only one is `tabIndex=0`); arrows
  // move focus AND activate the new tab (auto-activation), so on desktop the
  // content pane stays in sync with focus. Home/End jump to first/last.
  const moveFocus = useCallback(
    (delta: 1 | -1 | "first" | "last") => {
      const buttons = Array.from(
        tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
      );
      if (buttons.length === 0) return;
      const currentIndex = buttons.findIndex((btn) => btn === document.activeElement);
      let nextIndex: number;
      if (delta === "first") {
        nextIndex = 0;
      } else if (delta === "last") {
        nextIndex = buttons.length - 1;
      } else {
        const base = currentIndex === -1 ? 0 : currentIndex;
        nextIndex = (base + delta + buttons.length) % buttons.length;
      }
      buttons[nextIndex]?.focus();
      // DOM order matches `tabs` order, so use the array index to look up
      // the key rather than threading it through a data attribute.
      const nextKey = tabs[nextIndex]?.key;
      if (nextKey !== undefined) {
        onSelect(nextKey);
      }
    },
    [tabs, onSelect],
  );

  const handleNavKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveFocus(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveFocus(-1);
          break;
        case "Home":
          event.preventDefault();
          moveFocus("first");
          break;
        case "End":
          event.preventDefault();
          moveFocus("last");
          break;
        default:
      }
    },
    [moveFocus],
  );

  const sidebarNav = (
    <nav
      aria-label="Sections"
      data-ui={sidebarExpanded ? "expanded" : ""}
      aria-hidden={ariaHidden ? true : undefined}
      className={clsx(
        // The outer Dialog.Content carries `card` (one card surrounds both
        // panes). The nav here just provides the `group/menu` scope for
        // descendant `data-expanded` selectors and a right-edge divider on
        // desktop matching the card border color.
        "group/menu",
        "overflow-hidden",
        // Mobile: full-bleed overlay that slides off the left edge when the
        // user drills into the content pane.
        "absolute inset-0 flex flex-col",
        "transition-transform duration-300 ease-out",
        offScreenOnMobile && "-translate-x-full",
        // Desktop: normal flex flow side-by-side, no translation. Width
        // depends on the desktop collapse state — `w-11` collapsed (44px:
        // 44 − 4px symmetric `p-0.5` = 40px inner, leaving 4px of slack
        // around the 36px button), `w-fit` (content-sized, capped by
        // `max-w-72`) expanded. The nav targets ITSELF via `data-expanded`
        // (`&[data-ui~="expanded"]`); the descendant
        // `group-data-expanded/menu` form would only match children.
        // The boundary between sidebar and content panes is distinguished
        // by background-color tiers (header/footer = base, tab list =
        // inset, content body = deep-inset) rather than a hard divider.
        "desktop:relative desktop:inset-auto",
        "desktop:flex! desktop:flex-col desktop:h-auto",
        "desktop:translate-x-0",
        "desktop:w-11",
        "desktop:data-expanded:w-fit",
        "desktop:data-expanded:max-w-72",
        "desktop:transition-[width,max-width] desktop:duration-200 desktop:ease-out",
        // No bg override here — the sidebar inherits `Dialog.Content`'s
        // frosted-glass layer on desktop. The content pane gets the solid
        // bg instead (see `ContentPane`).
        // Suppress pointer events while slid off — desktop variant restores.
        offScreenOnMobile && "pointer-events-none",
        "desktop:pointer-events-auto",
        variant,
      )}
    >
      <ScrollArea
        orientation="vertical"
        shrinkHeight={false}
        // Hide the scrollbar element only when the sidebar is collapsed —
        // it would overlap the icons in the narrow rail. Visible when
        // expanded (mobile and desktop expanded). Targets descendants with
        // `data-orientation` (only the Radix Scrollbar exposes that under
        // ScrollArea's tree).
        wrapperClassName={clsx(
          "h-full",
          !sidebarExpanded && "[&_[data-orientation=vertical]]:hidden",
        )}
        className="flex flex-col gap-0.5 p-0.5"
        header={
          <header
            className={clsx(
              "flex flex-row items-center gap-2 h-12",
              // Padding tightens when collapsed (narrow rail).
              sidebarExpanded ? "justify-between px-3" : "justify-center px-1",
              "bg-neutral-50/50 dark:bg-neutral-950/50",
            )}
          >
            {/* Dialog.Title always rendered for Radix; visually hidden when
                collapsed so the icon takes its place. */}
            <Dialog.Title
              className={clsx(
                variant,
                "responsive variant-static-text",
                "text-base/7 font-medium",
                sidebarExpanded ? "min-w-0 flex-1 truncate" : "sr-only",
              )}
            >
              {title}
            </Dialog.Title>
            {!sidebarExpanded && collapsedIcon && (
              <span
                aria-hidden="true"
                className={clsx(
                  variant,
                  "responsive variant-static-text",
                  "grid place-items-center",
                )}
              >
                {collapsedIcon}
              </span>
            )}
            {/* Mobile-only — content pane carries the X on desktop. */}
            {!dismissDisabled && (
              <Dialog.Close asChild className="desktop:hidden">
                <Button variant={variant} leftIcon={<IconX />} altText="Close" />
              </Dialog.Close>
            )}
          </header>
        }
        footer={
          sidebarFooter ? (
            <footer
              className={clsx(
                "px-2 py-1.5",
                "bg-neutral-50/50 dark:bg-neutral-950/50",
                "border-t border-neutral-500/15",
              )}
            >
              {sidebarFooter}
            </footer>
          ) : undefined
        }
      >
        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation="vertical"
          // tabIndex={-1} keeps the tablist programmatically focusable (so
          // the lint rule for interactive roles is satisfied) without
          // putting it in the natural tab order — Tab still flows directly
          // to the active tab via roving tabindex.
          tabIndex={-1}
          onKeyDown={handleNavKeyDown}
        >
          {tabs.map((tab) => (
            <SidebarTabRow
              key={tab.key}
              tab={tab}
              active={tab.key === activeKey}
              onSelect={onSelect}
              tabId={tabId(tab.key)}
              panelId={panelId(tab.key)}
            />
          ))}
        </div>
      </ScrollArea>
    </nav>
  );

  return (
    <ContextMenu
      // Disabled on mobile rather than unmounted — see the comment in
      // ContextMenu about not swapping the tree mid-interaction.
      disabled={!isDesktop}
      content={
        <>
          {contextMenuExtras}
          <NestedSelect
            values={!desktopCollapsed ? ["open"] : []}
            options={[
              {
                label: !desktopCollapsed ? "Collapse Sidebar" : "Expand Sidebar",
                value: "open",
                icon: (
                  <IconChevronRightPipe
                    className={clsx(
                      ICON_CLASS_NAME,
                      "transition-transform",
                      !desktopCollapsed ? "rotate-180" : "rotate-0",
                    )}
                  />
                ),
                closeOnSelect: true,
              },
            ]}
            onChange={onToggleDesktopCollapsed}
          />
        </>
      }
    >
      {sidebarNav}
    </ContextMenu>
  );
}

function SidebarTabRow({
  tab,
  active,
  onSelect,
  tabId,
  panelId,
}: {
  tab: SidebarTab;
  active: boolean;
  onSelect: (key: string) => void;
  tabId: string;
  panelId: string;
}) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onSelect(tab.key);
    },
    [onSelect, tab.key],
  );

  return (
    // `flex justify-center` centers the collapsed button (`w-9` = 36px) in
    // its row (~38px content area on the collapsed rail), splitting the
    // 2px slack evenly. Has no effect when the button is `w-full` on
    // mobile / desktop expanded — there's no extra space to distribute.
    <div className="relative flex justify-center">
      <MenuButton
        id={tabId}
        role="tab"
        // Roving tabindex: only the active tab is in the natural focus order.
        // Arrow keys (handled on the parent <nav>) move focus between tabs.
        tabIndex={active ? 0 : -1}
        aria-selected={active}
        aria-controls={panelId}
        icon={tab.icon ?? <span className="bg-neutral-500/40 size-3 rounded-xs" />}
        active={active}
        hoverable
        bg
        activeOnDesktopOnly
        variant={tab.variant ?? Variant.Primary}
        onClick={handleClick}
      >
        {tab.title}
      </MenuButton>
      {/* Drill-in chevron — mobile only. */}
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2",
          "text-neutral-500 desktop:hidden",
        )}
      >
        <IconChevronRight className="size-4" />
      </span>
    </div>
  );
}

function ContentPane({
  tab,
  onBack,
  variant,
  dismissDisabled,
  offScreenOnMobile,
  ariaHidden,
  tabId,
  panelId,
}: {
  tab: SidebarTab;
  onBack: () => void;
  variant?: Variant;
  dismissDisabled: boolean;
  offScreenOnMobile: boolean;
  ariaHidden: boolean;
  tabId: string;
  panelId: string;
}) {
  return (
    <section
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      aria-hidden={ariaHidden ? true : undefined}
      className={clsx(
        // The outer Dialog.Content carries `card`. The content pane just
        // needs its own clip + scroll layout.
        "overflow-hidden",
        // Mobile: full-bleed overlay that slides in from the right when the
        // user picks a tab.
        "absolute inset-0 flex flex-col",
        "transition-transform duration-300 ease-out",
        offScreenOnMobile && "translate-x-full",
        // Desktop: normal flex flow, fill remaining width, no translation.
        "desktop:relative desktop:inset-auto",
        "desktop:flex! desktop:flex-col desktop:h-auto desktop:flex-1",
        "desktop:translate-x-0",
        // Solid content bg on desktop — the parent `Dialog.Content` is
        // frosted-glass on desktop, and the content pane covers its area
        // so the sidebar (which inherits the parent) reads as the
        // transparent region. Mobile inherits the card's solid bg, so no
        // override needed.
        "desktop:bg-layout-light-inset desktop:dark:bg-layout-dark-inset",
        offScreenOnMobile && "pointer-events-none",
        "desktop:pointer-events-auto",
        variant,
      )}
    >
      <ScrollArea
        orientation="vertical"
        shrinkHeight={false}
        wrapperClassName="h-full"
        className="p-3"
        header={
          <header
            className={clsx(
              "flex flex-row items-center gap-2 px-3",
              "h-12",
              "bg-neutral-50/50 dark:bg-neutral-950/50",
            )}
          >
            <Button
              variant={variant}
              leftIcon={<IconChevronLeft />}
              onClick={onBack}
              altText="Back"
              className="desktop:hidden"
            />
            <h2
              className={clsx(
                "responsive default variant-static-text",
                "min-w-0 flex-1 truncate text-base/7 font-medium",
              )}
            >
              {tab.title}
            </h2>
            {!dismissDisabled && (
              <Dialog.Close asChild>
                <Button variant={variant} leftIcon={<IconX />} altText="Close" />
              </Dialog.Close>
            )}
          </header>
        }
        footer={
          tab.contentFooter ? (
            <footer
              className={clsx(
                "px-3 py-2",
                "bg-neutral-50/50 dark:bg-neutral-950/50",
                "border-t border-neutral-500/15",
              )}
            >
              {tab.contentFooter}
            </footer>
          ) : undefined
        }
      >
        {/* `@container` so consumer-supplied content can use container queries
            (`@md:`, `@lg:`, etc.) keyed off the modal's content-pane width
            rather than the viewport. */}
        <div className="@container text-black dark:text-white">{tab.content}</div>
      </ScrollArea>
    </section>
  );
}

/**
 * Local viewport detection for a11y attributes only. Layout itself stays
 * CSS-driven (via the `desktop:` Tailwind variant). Local `matchMedia` —
 * unlike the `useDesktopState` layout atom — works in any render context
 * (Storybook, tests) without the layout root.
 */
const DESKTOP_QUERY = "(width >= 48rem) and (height >= 48rem)";

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(DESKTOP_QUERY).matches;
  });
  useEffect(() => {
    const matcher = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(matcher.matches);
    const listener = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };
    matcher.addEventListener("change", listener);
    return () => {
      matcher.removeEventListener("change", listener);
    };
  }, []);
  return isDesktop;
}
