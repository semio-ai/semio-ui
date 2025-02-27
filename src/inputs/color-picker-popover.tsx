// import { type RawColor } from "@semio/utils";

// import "./color-picker-popover.css";
// import { useState } from "react";
// import { ColorPickerInput } from "./color-picker-input";

// export interface ColorPickerPopoverProps<T extends string | RawColor> {
//   value: T;
//   onChange: (color: T) => void;
// }

// export function ColorPickerPopover<T extends string | RawColor>({
//   value,
//   onChange,
// }: ColorPickerPopoverProps<T>) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <section className="p-3">
//       <div
//         //   TODO: Fix type on background color
//         style={{ backgroundColor: value as string }}
//         className="h-6 w-6 border-3 border-white shadow-md cursor-pointer"
//         onClick={() => setIsOpen(!isOpen)}
//       ></div>
//       {isOpen && (
//         <div>
//           <ColorPickerInput value={value} onChange={onChange} />
//         </div>
//       )}
//     </section>
//   );
// }
