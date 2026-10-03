import type { Meta, StoryObj } from "@storybook/react-vite";
import { Size, SliderNumberField, type SliderNumberFieldProps } from "@semio/ui";
import { useState, type ReactElement } from "react";

import { sliderNumberFieldPreview } from "./figma-links";

const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof SliderNumberField> = {
  parameters: design(sliderNumberFieldPreview),
  component: SliderNumberField,
  title: "ui/SliderNumberField",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
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
function SliderNumberFieldWithHooks(props: SliderNumberFieldProps): ReactElement {
  const [value, setValue] = useState<number>(props.value);
  const [label, setLabel] = useState<string>(props.label ?? "Slider Value");
  return (
    <div className="grid w-[50%] grid-cols-[auto_1fr] grid-rows-1 place-items-center gap-2">
      <p className="w-40 text-black dark:text-white">{value}</p>
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
      console.log(value);
    },
    min: 0,
    max: 1,
    color: "#ee33ee",
    size: Size.Sm,
    disabled: false,
    label: "Slider Value",
    units: "mm",
  },
};

/**
 * A unit longer than four characters, as model authors sometimes write them: the
 * suffix keeps four characters' width and truncates the rest with an ellipsis, so
 * the value keeps its room and nothing runs past the field's edge.
 */
export const LongUnits: Story = {
  render: (props) => {
    return <SliderNumberFieldWithHooks {...props} />;
  },
  args: {
    value: 0.35,
    onChange: (value: number) => {
      console.log(value);
    },
    min: 0,
    max: 1,
    color: "#ee33ee",
    size: Size.Sm,
    disabled: false,
    units: "intensity",
  },
};
