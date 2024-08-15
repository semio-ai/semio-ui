import React, { useMemo } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import useMeasure from "react-use-measure";
import { IconTriangle } from '@tabler/icons-react';

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
        type="multiple"
        className="w-full bg-blue-500"
        // defaultValue={items[0]?.key}
        style={{ height: bounds.height }}
      >
        {items.map((item) => (
          <Accordion.Item key={item.key} value={item.key}>
            <Accordion.Header className="h-7 dark:bg-neutral-700 bg-neutral-300">
              <Accordion.Trigger className="w-full text-left p-1 text-sm group m-0">
                <span className="text-neutral-700 dark:text-neutral-300 flex flex-row">
                  <div className="group-data-[state=closed]:rotate-90 rotate-180 m-1">
                    <IconTriangle size={12} />
                  </div>
                  {item.header}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              className="transition-all duration-500 overflow-auto"
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
