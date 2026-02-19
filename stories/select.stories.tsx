import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, type SelectProps, Size, Variant, ICON_CLASS_NAME } from "@semio/ui";
import { IconMessageCircle2, IconWorld } from "@tabler/icons-react";

const meta: Meta<typeof Select> = {
  component: Select,
  title: "ui/Select",
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

type Story = StoryObj<typeof Select>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function SelectWithHooks(props: SelectProps<string | string[]>): JSX.Element {
  const [value, setValue] = useState<string | string[]>(props.value ?? "");

  return (
    <div className="w-96">
      <Select {...props} value={value} onChange={setValue} />
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
    return <SelectWithHooks {...props} />;
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
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "both",
  },
};

export const Multiple: Story = {
  render: (props) => {
    return (
      <div className="w-full">
        <SelectWithHooks {...props} />
      </div>
    );
  },
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
    visuals: "both",
  },
};

export const VisualsBoth: Story = {
  render: (props) => {
    return <SelectWithHooks {...props} />;
  },
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "both",
  },
};

export const VisualsIcons: Story = {
  render: (props) => {
    return <SelectWithHooks {...props} />;
  },
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "icons",
  },
};

export const VisualsLabels: Story = {
  render: (props) => {
    return <SelectWithHooks {...props} />;
  },
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "labels",
  },
};
