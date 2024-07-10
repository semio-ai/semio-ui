import React, { useMemo } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import useMeasure from "react-use-measure";

export interface FullHeightAccordionProps {
  items: { header: string; content: React.ReactNode; key: string }[];
}

export function FullHeightAccordion({ items }: FullHeightAccordionProps) {
  const [ref, bounds] = useMeasure();
  const contentHeight = useMemo(
    () => bounds.height - 28 * items.length,
    [items.length, bounds.height],
  );

  return (
    <div ref={ref} className="h-full w-full bg-red-500">
      <Accordion.Root
        type="single"
        className="w-full bg-blue-500"
        defaultValue={items[0]?.key}
        style={{ height: bounds.height }}
      >
        {items.map((item) => (
          <Accordion.Item key={item.key} value={item.key}>
            <Accordion.Header className="h-7 dark:bg-neutral-700 bg-neutral-300">
              <Accordion.Trigger className="w-full text-left p-1 text-sm">
                {item.header}
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              className="transition-all duration-300 overflow-y-scroll"
              style={{ height: contentHeight }}
            >
              {item.content}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
