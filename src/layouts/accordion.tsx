import React from "react";
import { Accordion as RadixAccordion } from "radix-ui";
import { IconChevronDown } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size } from "../types";

export interface AccordionProps {
  sticky?: boolean;
  stickyOffset?: number;
  items: { header: string; content: React.ReactNode; key: string; disabled?: boolean }[];
  defaultOpen?: boolean | string[];
}

export function Accordion({ items, defaultOpen = false, sticky, stickyOffset }: AccordionProps) {
  let defaultValue: string[];
  if (typeof defaultOpen === "boolean") {
    defaultValue = defaultOpen ? items.filter((i) => !i.disabled).map((i) => i.key) : [];
  } else {
    defaultValue = defaultOpen;
  }

  return (
    <RadixAccordion.Root className="relative" type="multiple" defaultValue={defaultValue}>
      {items.map((item) => (
        <RadixAccordion.Item key={item.key} value={item.key} disabled={item.disabled}>
          <RadixAccordion.Header
            className={clsx(
              "h-7 dark:bg-neutral-700/50 bg-neutral-300/50 backdrop-blur-md",
              sticky && "sticky",
            )}
            style={
              sticky
                ? {
                    top: stickyOffset ?? 0,
                  }
                : {}
            }
          >
            <RadixAccordion.Trigger className="w-full text-left grid grid-cols-[auto_1fr] p-1 gap-2 text-sm group items-center">
              <div
                className={clsx(
                  Size.Sm,
                  "sized-list-item-indicator rounded-xs grid-list-item-indicator grid place-items-center",
                )}
              >
                <IconChevronDown
                  size={12}
                  className="transition-transform group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-90"
                />
              </div>
              <span className="text-neutral-700 dark:text-neutral-300 flex flex-row">
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
