import { memo, forwardRef, type ReactNode, type ForwardedRef } from "react";
import { clsx } from "clsx";
import { IconPlus } from "@tabler/icons-react";
import { Variant, Size } from "../types";
import { Chip } from "../chip";
import { NestedOption } from "../nested-elements/types";
import { Dropdown } from "../floating/dropdown";
import { NestedSelect } from "../nested-elements/select";
import { Button } from "../buttons/button";

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
    }: ChipInputProps,
    ref: ForwardedRef<HTMLDivElement>,
  ): ReactNode => {
    const selectedOptions = options.filter((option) => selectedValues.includes(option.value));

    const handleChipDelete = (valueToRemove: string) => {
      if (onChange && !disabled) {
        onChange(selectedValues.filter((value) => value !== valueToRemove));
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "responsive relative grid grid-cols-[minmax(0,1fr)_auto] gap-1",
          bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
          "rounded-xs",
          outline === "interact" && "parent-outline variant-responsive-appearing-outline",
          outline === "always" && "parent-outline variant-responsive-persistent-outline",
          variant,
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-text",
          "p-1",
          subtle && "variant-responsive-text",
          !subtle && "text-black dark:text-white",
          className,
        )}
      >
        <div className="flex flex-wrap gap-1 items-start">
          {selectedOptions.length > 0 ? (
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
            ))
          ) : (
            <span
              className={clsx(size, "flex sized-text sized-height text-left pl-1 items-center")}
            >
              {placeholder}
            </span>
          )}
        </div>
        <Dropdown
          trigger={
            <Button visuals="inverted" size={size} leftIcon={<IconPlus className="size-3/5" />} />
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
      </div>
    );
  },
);

InnerChipInput.displayName = "ChipInput";

export const ChipInput = memo(InnerChipInput);
