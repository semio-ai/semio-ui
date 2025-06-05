import type { Meta, StoryObj } from "@storybook/react";
import { Size, SliderNumberField, type SliderNumberFieldProps } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof SliderNumberField> = {
  component: SliderNumberField,
  decorators: [
    (Story) => (
      <div className="grid place-items-center p-5 h-full">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SliderNumberField>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function SliderNumberFieldWithHooks(props: SliderNumberFieldProps): JSX.Element {
  const [value, setValue] = useState<number>(props.value);
  const [label, setLabel] = useState<string>(props.label ?? "Slider Value");
  return (
    <div className="grid place-items-center grid-cols-[auto_1fr] grid-rows-1 gap-2 w-[50%]">
      <p className="text-black dark:text-white w-40">{value}</p>
      <SliderNumberField
        {...props}
        value={value}
        onChange={(v: number, e) => {
          setValue(v);
          props.onChange(v, e);
        }}
        label={label}
        onLabelChange={(v: string) => {
          setLabel(v);
        }}
        className="w-full"
      />
    </div>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    return <SliderNumberFieldWithHooks {...props} />;
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
    color: "#ee33ee",
    size: Size.Sm,
    disabled: false,
    label: "Slider Value",
    units: "units",
  },
};
