import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ReactNode } from "react";
import { clsx } from "clsx";
// import { Variant } from "./types";
// import { getBasicTextColor, getBorder } from "./variant-colors";

interface TabInterface {
  title: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabInterface[];
}

export function Tabs({
  tabs,
}: TabsProps): ReactNode {
  return (
    <TabsPrimitive.Root
      // className="border-t-2 border border-solid border-t-semio-yellow/50 border-semio-yellow/25"
      className={clsx(
        "dark:bg-black bg-white flex items-center w-full",
        "justify-between cursor-pointer flex flex-col",
        "dark:text-white text-black",
      )}
      defaultValue={tabs[0].title}
    >
      <TabsPrimitive.List
        className="shrink-0 flex border-b border-mauve6"
      >
        {tabs.map((k) => (
          <TabsPrimitive.Trigger
            className="px-2 h-[45px] flex-1 flex items-center justify-center text-[15px] 
            leading-none select-none first:rounded-tl-md last:rounded-tr-md 
            hover:text-primary data-[state=active]:text-secondary 
            outline-none cursor-default"
            value={k.title}
            key={k.title}
          >
            {k.title}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((k) => (

      <TabsPrimitive.Content
        key={k.title}
        value={k.title}
      >
        <div className={clsx(
            "PopoverContent",
            "bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-lg",
            // `border-${rootVariant[variant ?? Variant.WARNING]}-500`,
            // getBorder(variant),
          )}
          >
          {k.content}
        </div>
      </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
