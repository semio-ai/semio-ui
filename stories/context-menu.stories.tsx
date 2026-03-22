import { type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextMenu, Variant, type ContextMenuProps } from "@semio/ui";
import { NestedExample } from "./prebuilt/nested-example";

const meta: Meta<typeof ContextMenu> = {
  component: ContextMenu,
  title: "ui/ContextMenu",
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

type Story = StoryObj<typeof ContextMenu>;

function ContextMenuRenderer(props: ContextMenuProps): ReactNode {
  return (
    <ContextMenu {...props} content={<NestedExample />}>
      <div
        className={`p-5 w-96 h-52 card grid place-items-center ${props.variant ?? "default"} variant-static-text`}
      >
        Right Click Me
      </div>
    </ContextMenu>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Default,
  },
};

export const Primary: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: (args) => <ContextMenuRenderer {...args} />,
  args: {
    children: "See Example Code",
    content: "See Example Code",
    variant: Variant.Error,
  },
};
