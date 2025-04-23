import { type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react";
import { type ArgsStoryFn } from "@storybook/core/csf";
import { Popover, Variant, type PopoverProps } from "@semio/ui";

const meta: Meta<typeof Popover> = {
  component: Popover,
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

type Story = StoryObj<typeof Popover>;

function PopoverRenderer(props: PopoverProps): ReactNode {
  return (
    <Popover
      {...props}
      trigger={
        <div
          className={`p-5 w-96 h-24 card grid place-items-center ${props.variant ?? "default"} colored-text`}
        >
          Click Me
        </div>
      }
    >
      <div className="p-2 w-96 h-24 grid grid-cols-1 grid-rows-[40px_1fr]">
        <p className={`text-lg font-bold ${props.variant ?? "default"} colored-text`}>
          Header Text
        </p>
        <div className="dark:bg-layout-dark-inset bg-layout-light-inset rounded-xs w-full dark:text-white text-black p-1">
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
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Default,
  },
};

export const Primary: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: PopoverRenderer as ArgsStoryFn<ReactRenderer, PopoverProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Error,
  },
};
