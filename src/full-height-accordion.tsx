import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { IconChevronDown } from "@tabler/icons-react";

export interface FullHeightAccordionProps {
  items: { header: string; content: React.ReactNode; key: string }[];
  defaultOpen?: boolean;
}

export function FullHeightAccordion({ items, defaultOpen = false }: FullHeightAccordionProps) {
  return (
    <div className="h-full w-full">
      <Accordion.Root
        type="multiple"
        className="w-full h-full"
        defaultValue={defaultOpen ? items.map((i) => i.key) : []}
      >
        {items.map((item) => (
          <Accordion.Item key={item.key} value={item.key}>
            <Accordion.Header className="h-7 dark:bg-neutral-700 bg-neutral-300">
              <Accordion.Trigger className="w-full text-left p-1 text-sm group m-0">
                <span className="text-neutral-700 dark:text-neutral-300 flex flex-row">
                  <div className="p-1">
                    <IconChevronDown
                      size={12}
                      className="transition-transform group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90"
                    />
                  </div>
                  {item.header}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>{item.content}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
