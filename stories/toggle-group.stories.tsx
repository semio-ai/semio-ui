import type { Meta, StoryObj } from "@storybook/react";
import { Size, ToggleGroup, type ToggleGroupProps, Variant } from "@semio/ui";
import { useState } from "react";
import { IconLetterA, IconLetterB, IconLetterC } from "@tabler/icons-react";

const meta: Meta<typeof ToggleGroup> = {
  component: ToggleGroup,
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function ToggleGroupWithHooks(props: ToggleGroupProps): JSX.Element {
  const [value, setValue] = useState<string>(props.value);
  return (
    <ToggleGroup
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
    return <ToggleGroupWithHooks {...props} />;
  },
  name: "Toggle Group",
  args: {
    value: "a",
    onChange: (value: string): void => {
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    variant: Variant.Success,
    size: Size.Sm,
    options: [
      { value: "a", label: "Option A", icon: <IconLetterA /> },
      { value: "b", label: "Option B", icon: <IconLetterB /> },
      { value: "c", label: "Option C", icon: <IconLetterC /> },
    ],
  },
};
