import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@semio/ui";
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
        onClick={(v): void => {
          setValue(v);
          props.onClick(v);
        }}
        value={value}
      >
        Hello
      </Switch>
    );
  },
  name: "Button",
  args: {
    value: false,
    onClick: (value: boolean): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    disabled: false,
  },
};
