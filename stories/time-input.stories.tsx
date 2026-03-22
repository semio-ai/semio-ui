import type { Meta, StoryObj } from "@storybook/react-vite";
import { Size, TimeDisplay, TimeInput, type TimeInputProps, Variant } from "@semio/ui";
import { useState, type ReactElement } from "react";

const meta: Meta<typeof TimeInput> = {
  component: TimeInput,
  title: "ui/TimeInput",
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

type Story = StoryObj<typeof TimeInput>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function TimeInputWithHooks(props: TimeInputProps): ReactElement {
  const [t, setT] = useState(props.value);

  return (
    <TimeInput
      {...props}
      value={t}
      onChange={(v) => {
        setT(v);
        props.onChange(v);
      }}
    />
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Seconds: Story = {
  render: (props) => <TimeInputWithHooks {...props} />,
  args: {
    value: 5000,
    label: "Current",
    onChange: (): void => {
      console.log("Hello World!");
    },
    framerate: 24,
    size: Size.Sm,
    variant: Variant.Primary,
    display: TimeDisplay.Seconds,
    disabled: false,
  },
};

export const Frames: Story = {
  render: (props) => <TimeInputWithHooks {...props} />,
  args: {
    value: 5000,
    onChange: (): void => {
      console.log("Hello World!");
    },
    label: "Current",
    framerate: 24,
    size: Size.Sm,
    variant: Variant.Primary,
    display: TimeDisplay.Frames,
    disabled: false,
  },
};
