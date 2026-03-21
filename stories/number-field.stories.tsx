import type { Meta, StoryObj } from "@storybook/react-vite";
import { Size, NumberField, type NumberFieldProps, Variant } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  title: "ui/NumberField",
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

type Story = StoryObj<typeof NumberField>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function NumberFieldWithHooks(props: NumberFieldProps): JSX.Element {
  const [value, setValue] = useState<number>(props.value);
  const [label, setLabel] = useState<string | undefined>(props.label);
  return (
    <div className="grid place-items-center grid-cols-[auto_1fr] grid-rows-1 gap-2 w-[50%]">
      <p className="text-black dark:text-white">{value}</p>
      <NumberField
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
    return <NumberFieldWithHooks {...props} />;
  },
  args: {
    value: 0.5,
    onChange: (value: number) => {
       
      console.log(value);
    },
    variant: Variant.Primary,
    size: Size.Sm,
    disabled: false,
  },
};

export const PrimaryLabel: Story = {
  render: (props) => {
    return <NumberFieldWithHooks {...props} />;
  },
  args: {
    value: 0.5,
    onChange: (value: number) => {
       
      console.log(value);
    },
    variant: Variant.Primary,
    size: Size.Sm,
    disabled: false,
    label: "Field Value",
  },
};

export const PrimaryLabelUnits: Story = {
  render: (props) => {
    return <NumberFieldWithHooks {...props} />;
  },
  args: {
    value: 0.5,
    onChange: (value: number) => {
       
      console.log(value);
    },
    variant: Variant.Primary,
    size: Size.Sm,
    disabled: false,
    label: "Field Value",
    units: "units",
  },
};

export const CustomLabelUnits: Story = {
  render: (props) => {
    return <NumberFieldWithHooks {...props} />;
  },
  args: {
    value: 0.5,
    onChange: (value: number) => {
       
      console.log(value);
    },
    color: "#ee33ee",
    size: Size.Sm,
    disabled: false,
    label: "Field Value",
    units: "units",
  },
};
