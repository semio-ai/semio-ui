import { type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover, Variant, type PopoverProps } from "@semio/ui";

const meta: Meta<typeof Popover> = {
  component: Popover,
  title: "ui/Popover",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Popover>;

function PopoverRenderer(props: PopoverProps): ReactNode {
  return (
    <Popover
      {...props}
      trigger={
        <div
          className={`card grid h-24 w-96 place-items-center p-5 ${props.variant ?? "default"} responsive variant-static-text`}
        >
          Click Me
        </div>
      }
    >
      <div className="grid h-24 w-96 grid-cols-1 grid-rows-[40px_1fr] p-2">
        <p className={`text-lg font-bold ${props.variant ?? "default"} variant-static-text`}>
          Header Text
        </p>
        <div className="dark:bg-layout-dark-inset bg-layout-light-inset w-full rounded-xs p-1 text-black dark:text-white">
          Some Rich Content Here!
        </div>
      </div>
    </Popover>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Default,
  },
};

export const Primary: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: (args) => <PopoverRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Error,
  },
};
