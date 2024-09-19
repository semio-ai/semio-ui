import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, Size, Variant } from "@semio/ui";
import { IconMessageCircle2, IconWorld } from "@tabler/icons-react";

const meta: Meta<typeof Select> = {
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    const [value, setValue] = useState<string | string[]>(props.value);

    return (
      <div className="w-[100%]">
        <Select {...props} value={value} onChange={setValue} />
      </div>
    );
  },
  name: "Single",
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 size="13" />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld size="13px" />,
      },
    ],
    size: Size.Sm,
  },
};

export const Secondary: Story = {
  render: (props) => {
    const [value, setValue] = useState<string | string[]>(props.value);

    return (
      <div className="w-full">
        <Select {...props} value={value} onChange={setValue} />
      </div>
    );
  },
  name: "Multiple",
  args: {
    variant: Variant.Default,
    value: ["hello"],
    options: [
      { value: "hello", label: "Hello", color: "#ee11ee" },
      { value: "world", label: "World", color: "#11ee11" },
      { value: "i", label: "I", color: "#1111ee" },
      { value: "am", label: "Am", color: "#ee1111" },
      { value: "a", label: "A", color: "#11eeee" },
      { value: "multiple", label: "Multiple", color: "#eeee11" },
      { value: "select", label: "Select", color: "#11ee11" },
      { value: "default", label: "Default" },
    ],
    size: Size.Sm,
  },
};
