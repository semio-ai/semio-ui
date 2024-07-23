import type { Meta, StoryObj } from "@storybook/react";
import { SliderNumberField } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof SliderNumberField> = {
  component: SliderNumberField,
};

export default meta;

type Story = StoryObj<typeof SliderNumberField>;

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
  render: (props) => {
    const [value, setValue] = useState<number>(props.value);
    return (
      <SliderNumberField
        {...props}
        value={value}
        onChange={(v: number) => {
          setValue(v);
          props.onChange(v);
        }}
      />
    );
  },
  name: "SliderNumberField",
  args: {
    value: 0.5,
    onChange: (value: number) => {
      // eslint-disable-next-line no-console -- demo
      console.log(value);
    },
    min: 0,
    max: 1,
    units: undefined,
    color: "#ff00ff",
    strict: true,
    size: "sm",
    inactive: false,
    disabled: false,
  },
};
