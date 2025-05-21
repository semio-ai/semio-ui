import { Tabs as TabsPrimitive } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { IconHexagon } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Tooltip } from "../floating/tooltip";
import { Size, Variant } from "../types";

export interface TabChild {
  title: string;
  key: string;
  variant?: Variant;
  icon?: ReactNode;
  content: ReactNode;
}

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

export function Tabs({
  visuals = "both",
  size,
  children,
  selected,
  onTabChange,
  leftWidget,
  rightWidget,
  defaultContent,
  emptyTabText = "No tabs",
  tabsContainerClassName,
}: TabsProps): ReactNode {
  const childrenTabs: TabChild[] = useMemo(
    () =>
      children.length > 0
        ? children
        : [
            {
              key: "default",
              title: emptyTabText,
              variant: Variant.Default,
              content: defaultContent ?? <div className="w-full h-72">No Contents</div>,
            },
          ],
    [children, defaultContent, emptyTabText],
  );

  const itemIndex = childrenTabs.findIndex((tab) => tab.key === selected);
  const activeIndex = itemIndex === -1 ? 0 : itemIndex;
  const activeOption = childrenTabs[activeIndex];

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
  }, [activeIndex, updateTabPositions, childrenTabs]);

  return (
    <TabsPrimitive.Root
      className={clsx("@container flex flex-col w-full gap-0.5", "cursor-pointer rounded-sm")}
      value={selected ?? childrenTabs[0].key}
      onValueChange={onTabChange}
    >
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

          {childrenTabs.map((tabChild, tabIdx) => (
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
      {childrenTabs.map((tabChild) => (
        <TabsPrimitive.Content key={tabChild.key} value={tabChild.key}>
          <div className={clsx("cursor-default")}>{tabChild.content}</div>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
