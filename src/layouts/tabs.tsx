import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { memo, type ReactNode } from "react";
import { clsx } from "clsx";
import { Tooltip } from "../floating/tooltip";
import { Size, Variant } from "../types";
import { useTabsState, type TabChild } from "../hooks/use-tabs-state";
import { Icon, resolveIcon } from "../icons/registry";

export interface TabsProps {
  visuals?: "icons" | "labels" | "both";
  size?: Size;
  children: TabChild[];
  selected?: string;
  onTabChange: (key: string) => void;
  leftWidget?: ReactNode;
  rightWidget?: ReactNode;
  defaultContent?: ReactNode;
  emptyTabText?: string;
  tabsContainerClassName?: string;
}

/**
 * Internal tabs row component that renders the visual tab buttons with animated selection indicator.
 * @requires Must be used within a `Tabs.Root` from `@base-ui/react/tabs` for proper functionality.
 *
 * Features:
 * - Animated selection indicator driven by base-ui's `Tabs.Indicator` and the
 *   CSS variables it publishes (`--active-tab-left`, `--active-tab-width`, ...).
 *   Resize/layout changes are tracked internally by base-ui — no consumer wiring.
 * - Support for icons, labels, or both visual modes
 * - Configurable size and variant styling per tab
 * - Tooltips displaying tab titles on hover
 * - Left and right widget slots for additional controls
 * - Responsive design with container queries
 * - Automatic fallback icon for tabs without specified icons
 */
export function InnerTabsRow({
  visuals = "both",
  size,
  children,
  selected,
  leftWidget,
  rightWidget,
  tabsContainerClassName,
}: Omit<TabsProps, "onTabChange" | "defaultContent" | "emptyTabText">): ReactNode {
  const itemIndex = children.findIndex((tab) => tab.key === selected);
  const activeIndex = itemIndex === -1 ? 0 : itemIndex;
  const activeOption = children[activeIndex];

  return (
    <div className={clsx("flex items-center gap-1", tabsContainerClassName)}>
      {leftWidget}
      <TabsPrimitive.List
        className={clsx(
          "relative inline-flex flex-1 items-center rounded-sm",
          // When tabs sum to more than the container width, scroll horizontally
          // rather than crushing labels into each other. Scrollbar is hidden
          // visually; wheel/swipe/keyboard scroll still works.
          "overflow-x-auto overflow-y-hidden",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "dark:bg-layout-dark-deep-inset bg-layout-light-deep-inset group/list p-0.5",
        )}
      >
        <TabsPrimitive.Indicator
          renderBeforeHydration
          className={clsx(
            "responsive absolute",
            "sized-inner-group-item rounded-xs",
            "variant-static-bg-25",
            "variant-static-persistent-outline",
            "transition-[translate,width] duration-200 ease-out",
            size,
            activeOption?.variant ?? Variant.Default,
          )}
          // The List has p-0.5 (2px). `--active-tab-left` is measured from the
          // List's border edge, while absolute positioning anchors at the
          // padding edge — subtract the padding to align the indicator with
          // the active tab.
          style={{
            translate: "calc(var(--active-tab-left) - 0.125rem) 0",
            width: "var(--active-tab-width)",
          }}
        />

        {children.map((tabChild, tabIdx) => (
          <Tooltip key={tabChild.key} content={tabChild.title}>
            <TabsPrimitive.Tab
              data-state={tabIdx === activeIndex ? "on" : "off"}
              className={clsx(
                "responsive z-1",
                size,
                tabChild.variant,
                "sized-inner-group-item-height",
                "grid place-items-center transition-colors",
                // Both the label and the active indicator take their colour from the
                // tab's own variant, so a label can end up on a paler tint of itself.
                // This class clamps the label's lightness against the list ground it
                // is read on; an unmodified brand shade there measured 1.6:1 for the
                // warm hues. It applies to active and inactive alike — the active row
                // adds only a 25% tint of the same hue, which does not change which
                // side of the ground the label needs to sit on.
                "variant-text-on-inset",
                // `flex-1` distributes free space when tabs fit; `min-w-fit`
                // keeps each tab at content-size when they don't, allowing the
                // list to scroll horizontally instead of clipping labels.
                "flex-1 min-w-fit cursor-pointer",
              )}
              value={tabChild.key}
            >
              <div
                className={clsx(
                  "responsive grid place-items-center",
                  size,
                  (visuals === "icons" || visuals === "labels") && "grid-cols-1 grid-rows-1",
                  visuals === "both" && "grid-cols-[auto_auto] grid-rows-1",
                  visuals === "icons" && "sized-inner-group-item",
                )}
              >
                {(visuals === "icons" || visuals === "both") && (
                  <p
                    className={clsx(
                      "sized-inner-group-item grid place-items-center",
                      size,
                    )}
                  >
                    {resolveIcon(tabChild.icon) ?? <Icon name="option-placeholder" size="none" className="size-2/5" />}
                  </p>
                )}
                {(visuals === "labels" || visuals === "both") && (
                  <p
                    className={clsx(
                      "sized-text text-nowrap leading-none",
                      size,
                      visuals === "both" ? "pr-2" : "px-2",
                    )}
                  >
                    {tabChild.title}
                  </p>
                )}
              </div>
            </TabsPrimitive.Tab>
          </Tooltip>
        ))}
      </TabsPrimitive.List>
      {rightWidget}
    </div>
  );
}

export const TabsRow = memo(InnerTabsRow);

/**
 * Internal tabs content component. Renders one `Tabs.Panel` per tab; base-ui
 * shows the active panel and unmounts the others.
 */
function InnerTabsContent({
  childrenTabs,
}: {
  childrenTabs: TabChild[];
}): ReactNode {
  return (
    <>
      {childrenTabs.map((tab) => (
        <TabsPrimitive.Panel key={tab.key} value={tab.key} className="cursor-default">
          {tab.content}
        </TabsPrimitive.Panel>
      ))}
    </>
  );
}

export const TabsContent = memo(InnerTabsContent);

/**
 * Complete tabs component that combines tab navigation and content with smooth animations.
 * Built on top of Base UI's `Tabs` primitive — `Tabs.Indicator` drives the moving
 * background, eliminating the manual ref/spring/resize tracking the Radix-based
 * version required.
 *
 * @example
 * ```tsx
 * const [selectedTab, setSelectedTab] = useState("tab1");
 * const tabs = [
 *   { key: "tab1", title: "First Tab", icon: <IconUser />, content: <div>...</div> },
 *   { key: "tab2", title: "Second Tab", variant: Variant.Primary, content: <div>...</div> },
 * ];
 *
 * <Tabs
 *   visuals="both"
 *   size="md"
 *   children={tabs}
 *   selected={selectedTab}
 *   onTabChange={setSelectedTab}
 * />
 * ```
 */
export function InnerTabs(props: TabsProps): ReactNode {
  const { childrenTabs } = useTabsState(
    props.children,
    props.selected,
    props.defaultContent,
    props.emptyTabText,
  );

  return (
    <TabsPrimitive.Root
      className={clsx("@container flex w-full flex-col gap-0.5", "cursor-pointer rounded-sm")}
      value={props.selected ?? childrenTabs[0].key}
      onValueChange={(value) => {
        if (typeof value === "string") {
          props.onTabChange(value);
        }
      }}
    >
      <TabsRow {...props}>{childrenTabs}</TabsRow>
      <TabsContent childrenTabs={childrenTabs} />
    </TabsPrimitive.Root>
  );
}

export const Tabs = memo(InnerTabs);
