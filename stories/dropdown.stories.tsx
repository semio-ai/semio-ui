import { type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react";
import { type ArgsStoryFn } from "@storybook/core/csf";
import { Button, Dropdown, Size, Variant, type DropdownProps } from "@semio/ui";
import { IconChevronDown } from "@tabler/icons-react";
import { NestedExample } from "./prebuilt/nested-example";

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: "ui/Dropdown",
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

type Story = StoryObj<typeof Dropdown>;

function DropdownRenderer(props: DropdownProps): ReactNode {
  return (
    <Dropdown
      {...props}
      trigger={
        <Button
          variant={props.variant}
          rightIcon={<IconChevronDown className="h-3/5 w-3/5" />}
          size={Size.Sm}
        >
          Open
        </Button>
      }
    >
      <NestedExample />
    </Dropdown>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Default,
  },
};

export const Primary: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: DropdownRenderer as ArgsStoryFn<ReactRenderer, DropdownProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Error,
  },
};
