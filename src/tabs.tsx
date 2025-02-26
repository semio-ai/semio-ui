import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactNode } from "react";
import useMeasure from "react-use-measure";
import { clsx } from "clsx";
import { Select } from "./select";
import { Size } from "./types";
import { Tooltip } from "./tooltip";

export interface TabChild {
  title: string;
  key: string;
  content: ReactNode;
}

export interface TabsProps {
  children: TabChild[];
  selected?: string;
  onTabChange: (key: string) => void;
  leftWidget?: ReactNode;
  rightWidget?: ReactNode;
  defaultContent?: ReactNode;
  emptyTabText?: string;
}

export function Tabs({
  children,
  selected,
  onTabChange,
  leftWidget,
  rightWidget,
  defaultContent,
  emptyTabText = "No tabs",
}: TabsProps): ReactNode {
  const [mainRef, mainBounds] = useMeasure();
  const [leftRef, leftBounds] = useMeasure();
  const [rightRef, rightBounds] = useMeasure();

  const childrenTabs =
    children.length > 0
      ? children
      : [{ key: "default", title: emptyTabText, content: defaultContent ?? "No Contents" }];

  const neededWidth = MIN_OPEN_TAB_WIDTH + MIN_CLOSED_TAB_WIDTH * (childrenTabs.length - 1);
  const rootWidth = mainBounds.width ?? 0;
  const leftWidth = leftBounds?.width ?? 0;
  const rightWidth = rightBounds?.width ?? 0;
  const mini = rootWidth - leftWidth - rightWidth < neededWidth;

  return (
    <div ref={mainRef}>
      {mini && (
        <div
          className={clsx(
            "flex flex-row",
            "divide-x divide-solid dark:divide-layout-darksep/50 divide-layout-lightsep/50",
            "border-b dark:border-layout-darksep/50 border-layout-lightsep/50",
          )}
        >
          {leftWidget && (
            <div ref={leftRef} className="flex flex-1 items-center">
              {leftWidget}
            </div>
          )}
          <div className="flex-1 p-[0.3rem]">
            <Select
              size={Size.Xs}
              value={selected ?? childrenTabs[0].key}
              onChange={(v) => onTabChange(v as string)}
              options={childrenTabs.map((child) => ({ value: child.key, label: child.title }))}
            />
          </div>
          {rightWidget && (
            <div ref={rightRef} className="flex flex-1 items-center">
              {rightWidget}
            </div>
          )}
        </div>
      )}
      {!mini && (
        <TabsPrimitive.Root
          className={clsx("flex flex-col w-full", "cursor-pointer")}
          value={selected ?? childrenTabs[0].key}
          onValueChange={onTabChange}
        >
          <TabsPrimitive.List
            className={clsx(
              "flex flex-row items-center",
              "dark:bg-layout-darkbase bg-layout-lightbase",
              "dark:text-neutral-200 text-neutral-800",
              "divide-x divide-solid dark:divide-layout-darksep/50 divide-layout-lightsep/50",
              "border-b dark:border-layout-darksep/50 border-layout-lightsep/50",
            )}
          >
            {leftWidget && <div ref={leftRef}>{leftWidget}</div>}
            {childrenTabs.map((tabChild) => (
              <Tooltip key={tabChild.key} content={tabChild.title}>
                <TabsPrimitive.Trigger
                  className={clsx(
                    "flex-1 text-nowrap px-2 h-[30px] transition-all",
                    "dark:aria-selected:bg-layout-darkinset",
                    "aria-selected:bg-layout-lightinset",
                    "hover:dark:bg-[#2D2D2D]",
                    "hover:bg-[#d9d9d9]",
                    "text-neutral-500 aria-selected:text-neutral-900 aria-selected:dark:text-neutral-100",
                    "ring-[1px] ring-transparent aria-selected:ring-neutral-500/50 ring-inset",
                    "aria-selected:min-w-[140px] min-w-10",
                    "overflow-hidden overflow-ellipsis",
                    "text-xs",
                  )}
                  value={tabChild.key}
                  key={tabChild.key}
                >
                  {tabChild.title}
                </TabsPrimitive.Trigger>
              </Tooltip>
            ))}
            {rightWidget && <div ref={rightRef}>{rightWidget}</div>}
          </TabsPrimitive.List>
          {childrenTabs.map((tabChild) => (
            <TabsPrimitive.Content key={tabChild.key} value={tabChild.key}>
              <div
                className={clsx(
                  "cursor-default",
                  // `border-${rootVariant[variant ?? Variant.WARNING]}-500`,
                  // getBorder(variant),
                )}
              >
                {tabChild.content}
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      )}
      {mini && (childrenTabs.find((child) => child.key === selected)?.content ?? null)}
    </div>
  );
}

const MIN_OPEN_TAB_WIDTH = 140;
const MIN_CLOSED_TAB_WIDTH = 40;
