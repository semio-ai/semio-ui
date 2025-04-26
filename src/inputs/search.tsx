import {
  memo,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
  type InputHTMLAttributes,
  useRef,
} from "react";
import { IconSearch } from "@tabler/icons-react";
import { Size, Variant } from "../types";
import { TextField } from "./text-field";

interface SearchAdditionalProps {
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string, event: KeyboardEvent) => void;
  variant?: Variant;
  size?: Size;
}

export type SearchProps = SearchAdditionalProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange">;

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
      subtle
      size={size}
      variant={variant}
      icon={<IconSearch className="h-3/5 w-3/5" />}
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
  // return (
  //   <div
  //     className={clsx(
  //       "flex flex-row gap-2 w-full items-center dark:bg-neutral-950/10 bg-neutral-50/10",
  //       "dark:focus-within:bg-neutral-950 focus-within:bg-neutral-50 transition-colors",
  //       getOutline(variant),
  //       getHeight(size),
  //       getTextCaretColor(variant),
  //       "dark:text-white text-black",
  //     )}
  //   >
  //     <IconSearch className="h-4 text-neutral-500" />
  //     <StyledInput
  //       ref={inputRef}
  //       {...forwardedProps}
  //       cursor="cursor-text"
  //       className="text-left flex"
  //       size={size}
  //       onChange={onChange ? (e) => onChange(e.target.value) : () => {}}
  //       onKeyDown={(event) => {
  //         // If the keydown event is enter, call the onSearch;
  //         if (event.key === "Enter" && inputRef?.current) {
  //           onSearch && onSearch(inputRef?.current.value ?? "");
  //         }
  //       }}
  //     />
  //   </div>
  // );
}

export const Search = memo(InnerSearch);
