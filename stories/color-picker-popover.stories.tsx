import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPickerPopover, type ColorPickerPopoverProps } from "@semio/ui";
import { useState, type ReactElement } from "react";
import { type RawColor } from "@semio/utils";

const meta: Meta<typeof ColorPickerPopover> = {
  component: ColorPickerPopover,
  title: "ui/ColorPickerPopover",
};

export default meta;

type Story = StoryObj<typeof ColorPickerPopover>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function ColorPickerPopoverWithHooks({
  value,
  onChange,
}: ColorPickerPopoverProps<string | RawColor>): ReactElement {
  const [innerValue, setInnerValue] = useState<string | RawColor>(value);
  return (
    <>
      <p className="text-black dark:text-white">Current value: {JSON.stringify(innerValue)}</p>
      <ColorPickerPopover
        value={innerValue}
        onChange={(v) => {
          setInnerValue(v);
          (onChange as (v: string | RawColor) => void)(v);
        }}
      />
    </>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    return <ColorPickerPopoverWithHooks {...props} />;
  },
  name: "ColorPickerPopover",
  args: {
    value: "#ff55aa",
    onChange: (value: string | RawColor) => {
      console.log(value);
    },
  },
};
