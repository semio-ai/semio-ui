import React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { clsx } from "clsx";
import { Size } from "../types";
import { DisclosureIcon } from "../icons/registry";
import { LegacySizePanel } from "./legacy-size-panel";

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
    <BaseAccordion.Root className="relative" multiple defaultValue={defaultValue}>
      {items.map((item) => (
        <BaseAccordion.Item
          key={item.key}
          value={item.key}
          disabled={item.disabled}
          render={(props, state) => <div {...props} data-state={state.open ? "open" : "closed"} />}
        >
          <BaseAccordion.Header
            render={(props, state) => (
              <h3 {...props} data-state={state.open ? "open" : "closed"}>
                {props.children}
              </h3>
            )}
            className={clsx(
              "h-7 bg-neutral-300/50 backdrop-blur-md dark:bg-neutral-700/50",
              // Positioned panel content must paint beneath the stuck header's blur.
              sticky && "sticky z-1",
            )}
            style={
              sticky
                ? {
                    top: stickyOffset ?? 0,
                  }
                : {}
            }
          >
            <BaseAccordion.Trigger
              // The rendered native button owns disabled focus exclusion.
              disabled={false}
              render={(props, state) => (
                <button
                  {...props}
                  type="button"
                  tabIndex={undefined}
                  disabled={state.disabled}
                  aria-disabled={undefined}
                  data-state={state.open ? "open" : "closed"}
                />
              )}
              className="group grid w-full grid-cols-[auto_1fr] items-center gap-2 p-1 text-left text-sm"
            >
              <div
                className={clsx(
                  Size.Sm,
                  "sized-list-item-indicator grid-list-item-indicator grid place-items-center rounded-xs",
                )}
              >
                <DisclosureIcon fromGroupState className="size-3" />
              </div>
              <span className="flex flex-row text-neutral-700 dark:text-neutral-300">
                {item.header}
              </span>
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel
            render={(props, state) => (
              <LegacySizePanel {...props} data-state={state.open ? "open" : "closed"} accordion />
            )}
          >
            {item.content}
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
