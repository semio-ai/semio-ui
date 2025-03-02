import {
  instanceOfRawHSL,
  instanceOfRawRGB,
  type RawColor,
  rawHSLToHex,
  rawRGBToHex,
} from "@semio/utils";
import { useState } from "react";
import { ColorPickerInput } from "./color-picker-input";
import "./color-picker-popover.css";

export interface ColorPickerPopoverProps<T extends string | RawColor> {
  value: T;
  onChange: (color: T) => void;
}

export function ColorPickerPopover<T extends string | RawColor>({
  value,
  onChange,
}: ColorPickerPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const convertColorToCSSString = (v: string | RawColor): string => {
    if (typeof v === "string") {
      return v;
    } else if (instanceOfRawRGB(v)) {
      return rawRGBToHex(v);
    } else if (instanceOfRawHSL(v)) {
      return rawHSLToHex(v);
    }
    return "red";
  };

  return (
    <section className="p-1">
      <button
        type="button"
        style={{ backgroundColor: convertColorToCSSString(value) }}
        className="h-6 w-6 border-3 border-white rounded-md shadow-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div>
          <ColorPickerInput value={value} onChange={onChange} />
        </div>
      )}
    </section>
  );
}
