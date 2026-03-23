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
              "h-7 bg-neutral-300/50 backdrop-blur-md dark:bg-neutral-700/50",
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
            <RadixAccordion.Trigger className="group grid w-full grid-cols-[auto_1fr] items-center gap-2 p-1 text-left text-sm">
              <div
                className={clsx(
                  Size.Sm,
                  "sized-list-item-indicator grid-list-item-indicator grid place-items-center rounded-xs",
                )}
              >
                <IconChevronDown
                  size={12}
                  className="transition-transform group-data-[state=closed]:-rotate-90 group-data-[state=open]:rotate-0"
                />
              </div>
              <span className="flex flex-row text-neutral-700 dark:text-neutral-300">
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
