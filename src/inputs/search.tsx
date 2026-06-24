import { memo, type ReactNode, type ChangeEvent, type KeyboardEvent, useRef } from "react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { Icon } from "../icons/registry";
import { TextField, TextFieldProps } from "./text-field";

export interface SearchProps extends TextFieldProps {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string, event: KeyboardEvent) => void;
  variant?: Variant;
  size?: Size;
}

/**
 * Inherits from standard Input HTML element
 * @param value - the value of the field
 * @param onChange - the callback to call when the value changes
 * @param size - the size of the field
 * @param variant - the variant of the field
 */
function InnerSearch({
  size = Size.Md,
  onChange,
  onSearch,
  variant,
  ...forwardedProps
}: SearchProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <TextField
      ref={inputRef}
      className={clsx(
        "text-neutral-600 focus:text-black dark:text-neutral-400 dark:focus:text-white",
        forwardedProps.className,
      )}
      size={size}
      variant={variant}
      icon={<Icon name="search" />}
      onClear={() => {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }}
      onChange={onChange}
      onKeyDown={(event) => {
        // If the keydown event is enter, call the onSearch;
        if (event.key === "Enter" && inputRef?.current) {
          onSearch && onSearch(inputRef?.current.value ?? "", event);
        }
      }}
      {...forwardedProps}
    />
  );
}

export const Search = memo(InnerSearch);
