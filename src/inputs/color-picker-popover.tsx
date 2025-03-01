import { instanceOfRawHSL, instanceOfRawRGB, type RawColor } from "@semio/utils";

import "./color-picker-popover.css";
import { useState } from "react";
import { ColorPickerInput } from "./color-picker-input";

export interface ColorPickerPopoverProps<T extends string | RawColor> {
  value: T;
  onChange: (color: T) => void;
}

export function ColorPickerPopover<T extends string | RawColor>({
  value,
  onChange,
}: ColorPickerPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const toHex = (n: number) => {
    // https://github.com/omgovich/react-colorful/blob/master/src/utils/convert.ts#L161
    const h = n.toString(16);
    return h.length < 2 ? "0" + h : h;
  };

  const convertColorToCSSString = (v: string | RawColor) => {
    console.log(value);
    if (typeof v === "string") {
      return v;
    } else if (instanceOfRawRGB(v)) {
      console.log("#" + toHex(v.r) + toHex(v.b) + toHex(v.g));
      return "#" + toHex(v.r) + toHex(v.b) + toHex(v.g);
    } else if (instanceOfRawHSL(v)) {
      return "white";
    }
    return "red";
  };

  return (
    <section className="p-1">
      <div
        style={{ backgroundColor: convertColorToCSSString(value) }}
        className="h-6 w-6 border-3 border-white rounded-md shadow-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      ></div>
      {isOpen && (
        <div>
          <ColorPickerInput value={value} onChange={onChange} />
        </div>
      )}
    </section>
  );
}
