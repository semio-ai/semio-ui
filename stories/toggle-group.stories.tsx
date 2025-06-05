import type { Meta, StoryObj } from "@storybook/react";
import { Size, ToggleGroup, type ToggleGroupProps, Variant } from "@semio/ui";
import { useState } from "react";
import {
  IconLetterA,
  IconLetterB,
  IconLetterC,
  IconLetterD,
  IconLetterE,
} from "@tabler/icons-react";

const meta: Meta<typeof ToggleGroup> = {
  component: ToggleGroup,
  decorators: [
    (Story) => (
      <div className="grid place-items-center p-5 h-full bg-neutral-500">
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
function ToggleGroupWithHooks(props: ToggleGroupProps): JSX.Element {
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
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    size: Size.Sm,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className="w-3/5 h-3/5" />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className="w-3/5 h-3/5" />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className="w-3/5 h-3/5" />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className="w-3/5 h-3/5" />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className="w-3/5 h-3/5" />,
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
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    size: Size.Md,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className="w-3/5 h-3/5" />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className="w-3/5 h-3/5" />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className="w-3/5 h-3/5" />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className="w-3/5 h-3/5" />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className="w-3/5 h-3/5" />,
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
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    size: Size.Lg,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className="w-3/5 h-3/5" />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className="w-3/5 h-3/5" />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className="w-3/5 h-3/5" />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className="w-3/5 h-3/5" />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className="w-3/5 h-3/5" />,
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
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    size: Size.Md,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className="w-3/5 h-3/5" />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className="w-3/5 h-3/5" />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className="w-3/5 h-3/5" />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className="w-3/5 h-3/5" />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className="w-3/5 h-3/5" />,
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
      // eslint-disable-next-line no-console -- alert for demo
      console.log(`Value changed to ${value}`);
    },
    size: Size.Md,
    options: [
      {
        value: "a",
        label: "Option A",
        icon: <IconLetterA className="w-3/5 h-3/5" />,
        variant: Variant.Primary,
      },
      {
        value: "b",
        label: "Option B",
        icon: <IconLetterB className="w-3/5 h-3/5" />,
        variant: Variant.Secondary,
      },
      {
        value: "c",
        label: "Option C",
        icon: <IconLetterC className="w-3/5 h-3/5" />,
        variant: Variant.Tertiary,
      },
      {
        value: "d",
        label: "Option D",
        icon: <IconLetterD className="w-3/5 h-3/5" />,
        color: "#ee33ee",
      },
      {
        value: "e",
        label: "Option E",
        icon: <IconLetterE className="w-3/5 h-3/5" />,
        variant: Variant.Default,
      },
    ],
  },
};
