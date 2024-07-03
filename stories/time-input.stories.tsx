import type { Meta, StoryObj } from "@storybook/react";
import { TimeDisplay, TimeInput, Variant } from "@semio/ui";

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
  render: (props) => <TimeInput {...props} />,
  name: "Button",
  args: {
    value: 0.5,
    // variant: Variant.PRIMARY,
    onChange: (): void => {
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    framerate: 24,
    size: "sm",
    variant: Variant.PRIMARY,
    display: TimeDisplay.SECONDS,
    disabled: false,
  },
};
