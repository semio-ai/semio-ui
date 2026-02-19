import {
  memo,
  forwardRef,
  type ReactNode,
  type ForwardedRef,
  useState,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { clsx } from "clsx";
import { IconPlus } from "@tabler/icons-react";
import { Variant, Size } from "../types";
import { Chip } from "../chip";
import { NestedOption } from "../nested-elements/types";
import { Dropdown } from "../floating/dropdown";
import { NestedSelect } from "../nested-elements/select";
import { Button } from "../buttons/button";
import { ICON_CLASS_NAME } from "../constants/icon";

export interface ChipInputProps {
  selectedValues: string[];
  options: NestedOption[];
  onChange?: (values: string[]) => void;
  variant?: Variant;
  size?: Size;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  subtle?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCustomValues?: boolean;
}

/**
 * A chip input component that displays selected options as chips within a TextArea-like container
 * and provides a dropdown for selecting/deselecting options.
 * @param selectedValues - Array of selected option values
 * @param options - Available options to choose from
 * @param onChange - Callback when selection changes
 * @param variant - Visual variant of the component
 * @param size - Size of the chips
 * @param bg - Whether to show background
 * @param outline - Outline behavior
 * @param subtle - Whether to use subtle text styling
 * @param placeholder - Placeholder text when no chips selected
 * @param disabled - Whether the component is disabled
 * @param className - Additional CSS classes
 * @param allowCustomValues - Whether to allow typing custom values
 */
const InnerChipInput = forwardRef(
  (
    {
      selectedValues,
      options,
      onChange,
      variant = Variant.Default,
      size = Size.Md,
      bg = false,
      outline = "interact",
      subtle,
      placeholder = "Select options...",
      disabled = false,
      className,
      allowCustomValues = false,
    }: ChipInputProps,
    ref: ForwardedRef<HTMLDivElement>,
  ): ReactNode => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOptions = selectedValues.map((value) => {
      const option = options.find((o) => o.value === value);
      return option ?? { label: value, value };
    });

    const handleChipDelete = (valueToRemove: string) => {
      if (onChange && !disabled) {
        onChange(selectedValues.filter((value) => value !== valueToRemove));
      }
    };

    const addCustomValue = (value: string) => {
      const trimmedValue = value.trim();
      if (trimmedValue && onChange && !selectedValues.includes(trimmedValue)) {
        onChange([...selectedValues, trimmedValue]);
      }
      setInputValue("");
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (!allowCustomValues) return;

      // Handle Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomValue(inputValue);
      }
      // Handle Backspace on empty input to delete last chip
      else if (e.key === "Backspace" && inputValue === "" && selectedValues.length > 0) {
        e.preventDefault();
        const lastValue = selectedValues[selectedValues.length - 1];
        handleChipDelete(lastValue);
      }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!allowCustomValues) return;

      const value = e.target.value;
      const lastChar = value[value.length - 1];

      // Check if the last character is a delimiter
      if (lastChar === "," || lastChar === ";" || lastChar === ".") {
        e.preventDefault();
        // Add the value without the delimiter
        addCustomValue(value.slice(0, -1));
      } else {
        setInputValue(value);
      }
    };

    const handleContainerClick = () => {
      if (allowCustomValues && !disabled && inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        allowCustomValues &&
        !disabled &&
        inputRef.current
      ) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    return (
      <div
        ref={ref}
        onClick={handleContainerClick}
        onKeyDown={handleContainerKeyDown}
        role={allowCustomValues && !disabled ? "button" : undefined}
        tabIndex={allowCustomValues && !disabled ? 0 : undefined}
        className={clsx(
          "responsive relative grid grid-cols-[minmax(0,1fr)_auto] gap-1",
          bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
          "rounded-xs",
          outline === "interact" && "parent-outline variant-responsive-appearing-outline",
          outline === "always" && "parent-outline variant-responsive-persistent-outline",
          variant,
          disabled && "cursor-not-allowed opacity-50",
          !disabled && allowCustomValues && "cursor-text",
          "p-1",
          subtle && "variant-responsive-text",
          !subtle && "text-black dark:text-white",
          className,
        )}
      >
        <div className="flex flex-wrap gap-1 items-start">
          {selectedOptions.length > 0 &&
            selectedOptions.map((option) => (
              <Chip
                key={option.value}
                variant={option.variant ?? variant}
                size={size}
                color={option.color}
                renderIcon={
                  option.icon
                    ? (iconClassName: string) => <div className={iconClassName}>{option.icon}</div>
                    : undefined
                }
                onDelete={
                  !disabled && !option.disabled ? () => handleChipDelete(option.value) : undefined
                }
              >
                {option.label}
              </Chip>
            ))}
          {selectedOptions.length === 0 && (!allowCustomValues || !inputValue) && (
            <span
              className={clsx(size, "flex sized-text sized-height text-left pl-1 items-center")}
            >
              {placeholder}
            </span>
          )}
          {allowCustomValues && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              className={clsx(
                size,
                "flex-1 min-w-[100px] bg-transparent outline-none border-none sized-text sized-height pl-1",
                "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
              )}
              placeholder={
                selectedOptions.length === 0 && !inputValue ? "" : "Type and press Enter..."
              }
            />
          )}
        </div>
        {options.length > 0 && (
          <Dropdown
            trigger={
              <Button
                visuals="inverted"
                size={size}
                leftIcon={<IconPlus className={ICON_CLASS_NAME} />}
              />
            }
            variant={variant}
            disabled={disabled}
          >
            <NestedSelect
              variant={variant}
              disabled={disabled}
              onChange={onChange}
              values={selectedValues}
              options={options}
            />
          </Dropdown>
        )}
      </div>
    );
  },
);

InnerChipInput.displayName = "ChipInput";

export const ChipInput = memo(InnerChipInput);
