import { RawColor } from "@semio/utils";
import { ColorPickerInput } from "../inputs/color-picker-input";
import { NestedMenu } from "./menu";
import { NestedColorPickerProps } from "./types";

export function NestedColorPicker<T extends string | RawColor>({
  value,
  onChange,
  disabled,
  label,
  variant,
}: NestedColorPickerProps<T>) {
  return (
    <NestedMenu variant={variant} label={label ?? "Select a color"} disabled={disabled}>
      <ColorPickerInput value={value} onChange={onChange} />
    </NestedMenu>
  );
}
