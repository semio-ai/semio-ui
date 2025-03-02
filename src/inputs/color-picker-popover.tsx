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
import { Dropdown } from "../dropdown";

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
    <Dropdown
      trigger={
        <button
          type="button"
          style={{
            backgroundColor: convertColorToCSSString(value),
            width: 24,
            height: 24,
            border: "3px solid white",
            cursor: "pointer",
          }}
          className="h-6 w-6 border-3 border-white rounded-md shadow-md cursor-pointer"
          // onClick={() => setIsOpen(!isOpen)}
        />
      }
    >
      <ColorPickerInput value={value} onChange={onChange} />
    </Dropdown>
  );
}
