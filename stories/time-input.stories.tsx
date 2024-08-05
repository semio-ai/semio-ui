import type { Meta, StoryObj } from "@storybook/react";
import { Size, TimeDisplay, TimeInput, Variant } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof TimeInput> = {
  component: TimeInput,
};

export default meta;

type Story = StoryObj<typeof TimeInput>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
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
  },
  name: "Sec + Msec",
  args: {
    value: 25030,
    label: "s",
    onChange: (): void => {
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    framerate: 24,
    size: Size.Sm,
    variant: Variant.Primary,
    display: TimeDisplay.SecondsPlusMilliseconds,
    disabled: false,
  },
};

export const Frames: Story = {
  render: (props) => {
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
  },
  args: {
    value: 25030,
    onChange: (): void => {
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    label: "f",
    framerate: 24,
    size: Size.Sm,
    variant: Variant.Primary,
    display: TimeDisplay.Frames,
    disabled: false,
  },
};
