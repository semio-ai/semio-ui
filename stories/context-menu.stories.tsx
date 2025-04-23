import { type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react";
import { type ArgsStoryFn } from "@storybook/core/csf";
import { Button, ContextMenu, Size, Variant, type ContextMenuProps } from "@semio/ui";
import { IconChevronDown } from "@tabler/icons-react";
import { NestedExample } from "./nested-example";

const meta: Meta<typeof ContextMenu> = {
  component: ContextMenu,
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

function ContextMenuRenderer(_props: ContextMenuProps): ReactNode {
  return (
    <ContextMenu
      trigger={
        <div className="p-5 w-96 h-52 border-dashed border-neutral-500 bg-neutral-500/50 rounded-sm grid place-items-center">
          Right Click Me
        </div>
      }
    >
      <NestedExample />
    </ContextMenu>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: ContextMenuRenderer as ArgsStoryFn<ReactRenderer, ContextMenuProps>,
  args: {
    children: "See Example Code",
    trigger: "See Example Code",
    variant: Variant.Default,
  },
};
