import type { Meta, StoryObj } from "@storybook/react";
import { ColorPickerInput, ColorPickerInputProps } from "@semio/ui";
import { useState } from "react";
import { RawColor } from "@semio/utils";

const meta: Meta<typeof ColorPickerInput> = {
  component: ColorPickerInput,
};

export default meta;

type Story = StoryObj<typeof ColorPickerInput>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  // decorators: [
  //   (storyFn) => (
  //     <div className="inline-flex w-40 h-20 bg-white p-2">{storyFn()}</div>
  //   ),
  // ],
  render: ({ value, onChange }: ColorPickerInputProps<string | RawColor>) => {
    const [innerValue, setInnerValue] = useState<string | RawColor>(value);
    return (
      <ColorPickerInput
        value={innerValue}
        onChange={(v) => {
          setInnerValue(v);
          (onChange as (v: string | RawColor) => void)(v);
        }}
      />
    );
  },
  name: "ColorPickerInput",
  args: {
    value: "#ff55aa",
    onChange: (value: string | RawColor) => {
      // eslint-disable-next-line no-console -- demo
      console.log(value);
    },
  },
};
