import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPickerInput, type ColorPickerInputProps } from "@semio/ui";
import { useState, type ReactElement } from "react";
import { type RawColor } from "@semio/utils";

const meta: Meta<typeof ColorPickerInput> = {
  component: ColorPickerInput,
  title: "ui/ColorPickerInput",
};

export default meta;

type Story = StoryObj<typeof ColorPickerInput>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function ColorPickerInputWithHooks({
  value,
  onChange,
}: ColorPickerInputProps<string | RawColor>): ReactElement {
  const [innerValue, setInnerValue] = useState<string | RawColor>(value);
  return (
    <>
      <p className="text-black dark:text-white">Current value: {JSON.stringify(innerValue)}</p>
      <ColorPickerInput
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
    return <ColorPickerInputWithHooks {...props} />;
  },
  name: "ColorPickerInput",
  args: {
    value: "#ff55aa",
    onChange: (value: string | RawColor) => {
      console.log(value);
    },
  },
};
