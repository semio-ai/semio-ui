import type { Meta, StoryObj } from "@storybook/react-vite";
import { Size, ToggleGroup, type ToggleGroupProps, Variant, ICON_CLASS_NAME } from "@semio/ui";
import { ReactElement, useState } from "react";
import {
  IconLetterA,
  IconLetterB,
  IconLetterC,
  IconLetterD,
  IconLetterE,
} from "@tabler/icons-react";

const meta: Meta<typeof ToggleGroup> = {
  component: ToggleGroup,
  title: "ui/ToggleGroup",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center bg-neutral-500 p-5">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function ToggleGroupWithHooks(props: ToggleGroupProps): ReactElement {
  const [toggleValue, setToggleValue] = useState<string>(props.value);
  return (
    <ToggleGroup
      {...props}
      onChange={(v): void => {
        setToggleValue(v);
        props.onChange(v);
      }}
      value={toggleValue}
    />
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Small: Story = {
  render: (props) => {
    return <ToggleGroupWithHooks {...props} />;
  },
  args: {
    value: "a",
    onChange: (value: string): void => {
      console.log(`Value changed to ${value}`);
    },
    size: Size.Sm,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className={ICON_CLASS_NAME} />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className={ICON_CLASS_NAME} />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className={ICON_CLASS_NAME} />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className={ICON_CLASS_NAME} />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className={ICON_CLASS_NAME} />,
        variant: Variant.Default,
      },
    ],
  },
};

export const Medium: Story = {
  render: (props) => {
    return <ToggleGroupWithHooks {...props} />;
  },
  args: {
    value: "a",
    onChange: (value: string): void => {
      console.log(`Value changed to ${value}`);
    },
    size: Size.Md,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className={ICON_CLASS_NAME} />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className={ICON_CLASS_NAME} />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className={ICON_CLASS_NAME} />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className={ICON_CLASS_NAME} />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className={ICON_CLASS_NAME} />,
        variant: Variant.Default,
      },
    ],
  },
};

export const Large: Story = {
  render: (props) => {
    return <ToggleGroupWithHooks {...props} />;
  },
  args: {
    value: "a",
    onChange: (value: string): void => {
      console.log(`Value changed to ${value}`);
    },
    size: Size.Lg,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className={ICON_CLASS_NAME} />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className={ICON_CLASS_NAME} />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className={ICON_CLASS_NAME} />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className={ICON_CLASS_NAME} />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className={ICON_CLASS_NAME} />,
        variant: Variant.Default,
      },
    ],
  },
};

export const Labels: Story = {
  render: (props) => {
    return <ToggleGroupWithHooks {...props} />;
  },
  args: {
    visuals: "labels",
    value: "a",
    onChange: (value: string): void => {
      console.log(`Value changed to ${value}`);
    },
    size: Size.Md,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className={ICON_CLASS_NAME} />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className={ICON_CLASS_NAME} />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className={ICON_CLASS_NAME} />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className={ICON_CLASS_NAME} />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className={ICON_CLASS_NAME} />,
        variant: Variant.Default,
      },
    ],
  },
};

export const IconsAndLabels: Story = {
  render: (props) => {
    return <ToggleGroupWithHooks {...props} />;
  },
  args: {
    visuals: "both",
    value: "a",
    onChange: (value: string): void => {
      console.log(`Value changed to ${value}`);
    },
    size: Size.Md,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className={ICON_CLASS_NAME} />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className={ICON_CLASS_NAME} />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className={ICON_CLASS_NAME} />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className={ICON_CLASS_NAME} />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className={ICON_CLASS_NAME} />,
        variant: Variant.Default,
      },
    ],
  },
};
