import type { Meta, StoryObj } from "@storybook/react";
import { Switch, type SwitchProps, Variant } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof Switch> = {
  component: Switch,
};

export default meta;

type Story = StoryObj<typeof Switch>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function SwitchWithHooks(props: SwitchProps): JSX.Element {
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
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    return <SwitchWithHooks {...props} />;
  },
  name: "Rounded",
  args: {
    value: false,
    onChange: (value: boolean): void => {
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value ? "on" : "off"}`);
    },
    disabled: false,
    variant: Variant.Success,
    offVariant: Variant.Error,
    square: false,
    size: "md",
  },
};

export const Square: Story = {
  render: (props) => {
    return <SwitchWithHooks {...props} />;
  },
  name: "Squared",
  args: {
    value: false,
    onChange: (value: boolean): void => {
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value ? "on" : "off"}`);
    },
    disabled: false,
    variant: Variant.Success,
    offVariant: Variant.Warning,
    square: true,
    size: "md",
  },
};
