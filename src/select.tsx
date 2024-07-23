import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Variant } from "./types";
import { getHoverButtonStyles } from "./style-functions";

export interface SelectProps {
  variant?: Variant;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; disabled?: boolean }[];
}

export function Select({ value, onChange, options, variant }: SelectProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <ListboxButton
        className={clsx(
          "transition-colors",
          "dark:text-white text-black",
          "min-w-40",
          getHoverButtonStyles(variant),
          "pt-2 pb-2 pr-4 pl-4 flex items-center justify-between gap-2",
        )}
      >
        {options.find((f) => f.value === value)?.label || "Select"}
        <IconChevronDown
          className={clsx(
            "transition-transform w-5 h-5",

            // open ? "rotate-0" : "rotate-180",
          )}
        />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        className={clsx(
          "w-[var(--button-width)] border border-white/5 dark:bg-neutral-800/50 bg-neutral-200/50 backdrop-blur-md p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
          "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
        )}
      >
        {options.map((f) => (
          <ListboxOption
            key={f.value}
            value={f.value}
            className="group flex cursor-default items-center gap-2 py-1.5 px-3 select-none data-[focus]:bg-white/10"
          >
            <IconCheck className="invisible size-4 group-data-[selected]:visible" />
            <div className="text-sm/6 text-white">{f.label}</div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
