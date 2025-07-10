import { Tabs as TabsPrimitive } from "radix-ui";
import { memo, useCallback, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { IconHexagon } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Tooltip } from "../floating/tooltip";
import { Size, Variant } from "../types";
import { useTabsState, type TabChild } from "../hooks/use-tabs-state";

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
 * @requires Must be used within a Radix Tabs.Root component for proper functionality
 *
 * This component handles only the visual representation of tabs (the clickable buttons) and does not
 * manage tab state or content rendering. It features a smooth animated selection indicator that
 * follows the active tab using motion springs.
 *
 * Features:
 * - Animated tab selection indicator with spring physics
 * - Support for icons, labels, or both visual modes
 * - Configurable size and variant styling per tab
 * - Tooltips displaying tab titles on hover
 * - Left and right widget slots for additional controls
 * - Responsive design with container queries
 * - Automatic fallback icon for tabs without specified icons
 *
 * @example
 * ```tsx
 * <Tabs.Root value={selectedTab} onValueChange={setSelectedTab}>
 *   <InnerTabsRow
 *     visuals="both"
 *     size="md"
 *     children={tabs}
 *     selected={selectedTab}
 *     leftWidget={<IconSettings />}
 *     rightWidget={<Button>Add Tab</Button>}
 *   />
 * </Tabs.Root>
 * ```
 *
 * @param visuals - Whether to show icons, labels, or both on tabs. Defaults to "both"
 * @param size - Size variant for the tabs
 * @param children - Array of tab objects with key, title, optional icon/variant, and content
 * @param selected - Key of the currently selected tab
 * @param leftWidget - Optional content to display on the left side of the tabs
 * @param rightWidget - Optional content to display on the right side of the tabs
 * @param tabsContainerClassName - Additional CSS classes for the tabs container
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

  const leftSpring = useSpring(0, { bounce: 0, visualDuration: 0.2 });
  const widthSpring = useSpring(0, { bounce: 0, visualDuration: 0.2 });

  const tabsRef = useRef<HTMLButtonElement[]>([]);

  const updateTabPositions = useCallback(
    (idx: number, immediate?: boolean) => {
      const currentTab = tabsRef.current[idx];
      if (immediate) {
        leftSpring.jump((currentTab?.offsetLeft ?? 0) - 2);
        widthSpring.jump(currentTab?.clientWidth ?? 0);
      } else {
        leftSpring.set((currentTab?.offsetLeft ?? 0) - 2);
        widthSpring.set(currentTab?.clientWidth ?? 0);
      }
    },
    [leftSpring, widthSpring],
  );

  useEffect(() => {
    updateTabPositions(activeIndex, false);
    const setTabPositionOnResize = () => updateTabPositions(activeIndex, true);
    window.addEventListener("resize", setTabPositionOnResize);

    return () => window.removeEventListener("resize", setTabPositionOnResize);
  }, [activeIndex, updateTabPositions, children]);

  return (
    <div className={clsx("flex items-center gap-1", tabsContainerClassName)}>
      {leftWidget}
      <TabsPrimitive.List
        className={clsx(
          "relative inline-flex flex-1 items-center rounded-sm overflow-clip",
          "dark:bg-layout-dark-deep-inset bg-layout-light-deep-inset p-0.5 group/list",
        )}
      >
        <motion.div
          // layout
          className={clsx(
            "absolute responsive",
            "rounded-xs sized-inner-group-item",
            "variant-static-bg-25",
            "variant-static-persistent-outline",
            size,
            activeOption?.variant ?? Variant.Default,
          )}
          style={{
            x: leftSpring,
            width: widthSpring,
          }}
        />

        {children.map((tabChild, tabIdx) => (
          <Tooltip key={tabChild.key} content={tabChild.title}>
            <TabsPrimitive.Trigger
              data-state={tabIdx === activeIndex ? "on" : "off"}
              ref={(el) => {
                if (el) {
                  tabsRef.current[tabIdx] = el;
                }
              }}
              className={clsx(
                "responsive z-1",
                size,
                tabChild.variant,
                "sized-inner-group-item-height",
                "grid place-items-center transition-colors",
                selected ? "variant-responsive-text" : "variant-static-text",
                "flex-1 cursor-pointer",
              )}
              value={tabChild.key}
              key={tabChild.key}
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
                  <p className="sized-inner-group-item grid place-items-center">
                    {tabChild.icon ?? <IconHexagon className="size-2/5" />}
                  </p>
                )}
                {(visuals === "labels" || visuals === "both") && (
                  <p className={clsx("text-nowrap", visuals === "both" ? "pr-2" : "px-2")}>
                    {tabChild.title}
                  </p>
                )}
              </div>
            </TabsPrimitive.Trigger>
          </Tooltip>
        ))}
      </TabsPrimitive.List>
      {rightWidget}
    </div>
  );
}

export const TabsRow = memo(InnerTabsRow);

/**
 * Internal tabs content component that renders animated tab content with directional sliding transitions.
 * @requires Must be used within a Radix Tabs.Root component for proper functionality
 *
 * This component handles the rendering of tab content with smooth sliding animations that indicate
 * the direction of navigation (forward/backward). It uses AnimatePresence for enter/exit animations
 * and Framer Motion for the sliding effects.
 *
 * Features:
 * - Directional sliding animations (left/right based on tab navigation direction)
 * - Smooth opacity transitions during tab changes
 * - Overflow management to prevent content from showing outside bounds
 * - Configurable animation duration and easing
 * - Automatic filtering to show only selected tab content
 *
 * @param childrenTabs - Processed array of tab objects
 * @param selected - Key of the currently selected tab
 * @param isMovingForward - Boolean indicating navigation direction for animation
 */
function InnerTabsContent({
  childrenTabs,
  selected,
  isMovingForward,
}: {
  childrenTabs: TabChild[];
  selected: string | undefined;
  isMovingForward: boolean;
}): ReactNode {
  const translateDistance = 24; // Adjust this value to control slide distance

  return (
    <div className="overflow-hidden">
      <AnimatePresence>
        {selected &&
          childrenTabs
            .filter((tab) => tab.key === selected)
            .map((tab) => (
              <MotionTabsPrimitiveContent
                key={tab.key}
                value={tab.key}
                initial={{
                  opacity: 0,
                  x: isMovingForward ? translateDistance : -translateDistance,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: isMovingForward ? -translateDistance : translateDistance,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <motion.div className={clsx("cursor-default")}>{tab.content}</motion.div>
              </MotionTabsPrimitiveContent>
            ))}
      </AnimatePresence>
    </div>
  );
}

export const TabsContent = memo(InnerTabsContent);
/**
 * Complete tabs component that combines tab navigation and content with smooth animations.
 * Built on top of Radix UI's Tabs primitive with enhanced visual effects and state management.
 *
 * This is the main tabs component that provides a complete tabbed interface experience. It includes
 * both the visual tab row and animated content area, with automatic state management and direction
 * tracking for smooth transitions.
 *
 * Features:
 * - Animated tab selection indicator with spring physics
 * - Directional sliding content animations (left/right based on navigation)
 * - Support for icons, labels, or both visual modes
 * - Configurable size and variant styling per tab
 * - Tooltips displaying tab titles on hover
 * - Left and right widget slots for additional controls
 * - Automatic default content when no tabs are provided
 * - Responsive design with container queries
 * - Built-in state management and change callbacks
 *
 * @example
 * ```tsx
 * const [selectedTab, setSelectedTab] = useState("tab1");
 * const tabs = [
 *   {
 *     key: "tab1",
 *     title: "First Tab",
 *     icon: <IconUser />,
 *     content: <div>Content for tab 1</div>
 *   },
 *   {
 *     key: "tab2",
 *     title: "Second Tab",
 *     variant: Variant.Primary,
 *     content: <div>Content for tab 2</div>
 *   }
 * ];
 *
 * <Tabs
 *   visuals="both"
 *   size="md"
 *   children={tabs}
 *   selected={selectedTab}
 *   onTabChange={setSelectedTab}
 *   leftWidget={<IconSettings />}
 *   rightWidget={<Button>Add Tab</Button>}
 * />
 * ```
 *
 * @param visuals - Whether to show icons, labels, or both on tabs. Defaults to "both"
 * @param size - Size variant for the tabs
 * @param children - Array of tab objects with key, title, optional icon/variant, and content
 * @param selected - Key of the currently selected tab
 * @param onTabChange - Callback fired when a tab is selected
 * @param leftWidget - Optional content to display on the left side of the tabs
 * @param rightWidget - Optional content to display on the right side of the tabs
 * @param defaultContent - Content to show when no tabs are provided
 * @param emptyTabText - Text to display when no tabs are provided. Defaults to "No tabs"
 * @param tabsContainerClassName - Additional CSS classes for the tabs container
 */
export function InnerTabs(props: TabsProps): ReactNode {
  const { childrenTabs, isMovingForward } = useTabsState(
    props.children,
    props.selected,
    props.defaultContent,
    props.emptyTabText,
  );

  return (
    <TabsPrimitive.Root
      className={clsx("@container flex flex-col w-full gap-0.5", "cursor-pointer rounded-sm")}
      value={props.selected ?? childrenTabs[0].key}
      onValueChange={props.onTabChange}
    >
      <TabsRow {...props}>{childrenTabs}</TabsRow>
      <TabsContent
        childrenTabs={childrenTabs}
        selected={props.selected}
        isMovingForward={isMovingForward}
      />
      {/* {childrenTabs.map((tabChild) => (
        <TabsPrimitive.Content key={tabChild.key} value={tabChild.key}>
          <div className={clsx("cursor-default")}>{tabChild.content}</div>
        </TabsPrimitive.Content>
      ))} */}
    </TabsPrimitive.Root>
  );
}

export const Tabs = memo(InnerTabs);

const MotionTabsPrimitiveContent = motion(TabsPrimitive.Content);
