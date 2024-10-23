import type { Meta, StoryObj } from "@storybook/react";
import { Size, SliderNumberField, type SliderNumberFieldProps } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof SliderNumberField> = {
  component: SliderNumberField,
};

export default meta;

type Story = StoryObj<typeof SliderNumberField>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function SliderNumberFieldWithHooks(props: SliderNumberFieldProps): JSX.Element {
  const [value, setValue] = useState<number>(props.value);
  const [label, setLabel] = useState<string>(props.label ?? "Slider Value");
  return (
    <SliderNumberField
      {...props}
      value={value}
      onChange={(v: number) => {
        setValue(v);
        props.onChange(v);
      }}
      label={label}
      onLabelChange={(v: string) => {
        setLabel(v);
      }}
    />
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
    units: undefined,
    color: "#ee11ee",
    strict: true,
    size: Size.Sm,
    inactive: false,
    disabled: false,
    label: "Slider Value",
  },
};
