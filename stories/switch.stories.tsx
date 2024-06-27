import type { Meta, StoryObj } from "@storybook/react";
import { Switch, Variant } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof Switch> = {
  component: Switch,
};

export default meta;

type Story = StoryObj<typeof Switch>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    const [value, setValue] = useState<boolean>(props.value);
    return (
      <Switch
        {...props}
        onChange={(v): void => {
          setValue(v);
          props.onChange(v);
        }}
        value={value}
      />
    );
  },
  name: "Button",
  args: {
    value: false,
    onChange: (value: boolean): void => {
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value ? "on" : "off"}`);
    },
    disabled: false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Storybook stupidity
    variant: Variant.SUCCESS,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Storybook stupidity
    offVariant: Variant.ERROR,
    square: false,
    size: "md",
  },
};
