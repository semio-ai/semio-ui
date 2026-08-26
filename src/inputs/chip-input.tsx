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
import { Variant, Size } from "../types";
import { Chip } from "../chip";
import { NestedOption } from "../nested-elements/types";
import { Dropdown } from "../floating/dropdown";
import { NestedSelect } from "../nested-elements/select";
import { Button } from "../buttons/button";
import { Icon } from "../icons/registry";

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
 * @param placeholder - Prompt shown while the field accepts more input. Defaults
 *   by mode, because the two modes ask for different actions: a field that takes
 *   typing says how to commit it, a field that only opens a menu does not.
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
      placeholder,
      disabled = false,
      className,
      allowCustomValues = false,
    }: ChipInputProps,
    ref: ForwardedRef<HTMLDivElement>,
  ): ReactNode => {
    const [inputValue, setInputValue] = useState("");
    /**
     * One prompt, in every state.
     *
     * There were two, and which one showed depended on whether any chip had been
     * added: the caller's `placeholder` while the field was empty, and a
     * hardcoded "Type and press Enter..." as soon as it was not — so a caller
     * could name the field's prompt and then watch it be replaced by wording it
     * had never chosen. They were styled differently too, the caller's as body
     * text and the built-in as a real placeholder, which made an empty field
     * look like it already CONTAINED the word rather than being empty.
     */
    const prompt =
      placeholder ?? (allowCustomValues ? "Type and press Enter..." : "Select options...");
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
          bg && "bg-neutral-50/20 dark:bg-neutral-950/20",
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
        <div className="flex flex-wrap items-start gap-1">
          {selectedOptions.length > 0 &&
            selectedOptions.map((option) => (
              <Chip
                key={option.value}
                variant={option.variant ?? variant}
                size={size}
                color={option.color}
                icon={option.icon}
                onDelete={
                  !disabled && !option.disabled ? () => handleChipDelete(option.value) : undefined
                }
              >
                {option.label}
              </Chip>
            ))}
          {/* Only when there is no input to carry a native placeholder. With
              one, this span would render the same words a second time, beside
              it. Muted to match `placeholder:text-neutral-400` below: it stands
              in for a placeholder, so it has to read as one rather than as
              something already entered. */}
          {selectedOptions.length === 0 && !allowCustomValues && (
            <span
              className={clsx(
                size,
                "sized-text sized-height flex items-center pl-1 text-left",
                "text-neutral-400 dark:text-neutral-600",
              )}
            >
              {prompt}
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
                "sized-text sized-height min-w-[100px] flex-1 border-none bg-transparent pl-1 outline-none",
                "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
              )}
              placeholder={prompt}
            />
          )}
        </div>
        {options.length > 0 && (
          <Dropdown
            trigger={
              <Button
                visuals="inverted"
                size={size}
                leftIcon={<Icon name="plus" />}
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
