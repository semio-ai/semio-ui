import { type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Dropdown, Size, Variant, type DropdownProps, ICON_CLASS_NAME } from "@semio/ui";
import { IconChevronDown } from "@tabler/icons-react";
import { NestedExample } from "./prebuilt/nested-example";

import { floatingExample } from "./figma-links";

const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Dropdown> = {
  parameters: design(floatingExample.dropdown),
  component: Dropdown,
  title: "ui/Dropdown",
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

type Story = StoryObj<typeof Dropdown>;

function DropdownRenderer(props: DropdownProps): ReactNode {
  return (
    <Dropdown
      {...props}
      trigger={
        <Button
          variant={props.variant}
          rightIcon={<IconChevronDown className={ICON_CLASS_NAME} />}
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
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Default,
  },
};

export const Primary: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: (args) => <DropdownRenderer {...args} />,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Error,
  },
};
