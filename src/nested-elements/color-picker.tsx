import { RawColor } from "@semio/utils";
import { ColorPickerInput } from "../inputs/color-picker-input";
import { Variant } from "../types";
import { NestedMenu } from "./menu";

export interface NestedColorPickerProps<T extends string | RawColor> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  label?: string;
  variant?: Variant;
}

export function NestedColorPicker<T extends string | RawColor>({
  value,
  onChange,
  disabled,
  label,
  variant,
}: NestedColorPickerProps<T>) {
  return (
    <NestedMenu
      variant={variant}
      label={label ?? "Select a color"}
      disabled={disabled}
    >
      <ColorPickerInput value={value} onChange={onChange} />
    </NestedMenu>
  );
}
