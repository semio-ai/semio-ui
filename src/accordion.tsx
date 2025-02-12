import React from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { IconChevronDown } from "@tabler/icons-react";

export interface AccordionProps {
  items: { header: string; content: React.ReactNode; key: string }[];
  defaultOpen?: boolean;
}

export function Accordion({ items, defaultOpen = false }: AccordionProps) {
  return (
    <RadixAccordion.Root type="multiple" defaultValue={defaultOpen ? items.map((i) => i.key) : []}>
      {items.map((item) => (
        <RadixAccordion.Item key={item.key} value={item.key}>
          <RadixAccordion.Header className="h-7 dark:bg-neutral-700 bg-neutral-300">
            <RadixAccordion.Trigger className="w-full text-left p-1 text-sm group m-0">
              <span className="text-neutral-700 dark:text-neutral-300 flex flex-row">
                <div className="p-1">
                  <IconChevronDown
                    size={12}
                    className="transition-transform group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90"
                  />
                </div>
                {item.header}
              </span>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content>{item.content}</RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
