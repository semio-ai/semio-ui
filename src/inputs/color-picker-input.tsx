import {
  instanceOfRawRGB,
  instanceOfRawHSL,
  type RawColor,
  RawRGB,
  RawHSL,
} from "@semio/utils";
import {
  HexColorPicker,
  RgbColorPicker,
  HslColorPicker,
  RgbStringColorPicker,
  HslStringColorPicker,
} from "react-colorful";
import "./color-picker-input.css";

export interface ColorPickerInputProps<T extends string | RawColor> {
  value: T;
  onChange: (color: T) => void;
}

export function ColorPickerInput<T extends string | RawColor>({
  value,
  onChange,
}: ColorPickerInputProps<T>) {
  return (
    <section className="p-3">
      {typeof value === "string" && value.startsWith("#") && (
        <HexColorPicker
          color={value}
          onChange={onChange as (v: string) => void}
        />
      )}
      {typeof value === "string" && value.startsWith("rgb") && (
        <RgbStringColorPicker
          color={value}
          onChange={onChange as (v: string) => void}
        />
      )}
      {typeof value === "string" && value.startsWith("hsl") && (
        <HslStringColorPicker
          color={value}
          onChange={onChange as (v: string) => void}
        />
      )}
      {instanceOfRawRGB(value) && (
        <RgbColorPicker
          color={value}
          onChange={onChange as (v: RawRGB) => void}
        />
      )}
      {instanceOfRawHSL(value) && (
        <HslColorPicker
          color={value}
          onChange={onChange as (v: RawHSL) => void}
        />
      )}
    </section>
  );
}
