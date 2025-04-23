import { type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react";
import { type ArgsStoryFn } from "@storybook/core/csf";
import { Button, Dropdown, Size, Variant, type DropdownProps } from "@semio/ui";
import { IconChevronDown } from "@tabler/icons-react";
import { NestedExample } from "./nested-example";

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
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

function DropdownRenderer(_props: DropdownProps): ReactNode {
  return (
    <Dropdown
      trigger={
        <Button
          variant={Variant.Primary}
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
