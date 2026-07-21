import { type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Dropdown, Size, Variant, type DropdownProps, ICON_CLASS_NAME } from "@semio/ui";
import { IconChevronDown } from "@tabler/icons-react";
import { NestedExample } from "./prebuilt/nested-example";
import { menuExample } from "./figma-links";

// The nested-elements menu primitives (NestedItem / NestedLabel / NestedSeparator)
// only render inside a Dropdown/ContextMenu, so this story demonstrates them via a
// Dropdown and links to the composed Menu example frame in Figma.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  title: "ui/Menu",
  parameters: design(menuExample),
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

function MenuRenderer(props: DropdownProps): ReactNode {
  return (
    <Dropdown
      {...props}
      trigger={
        <Button variant={Variant.Default} rightIcon={<IconChevronDown className={ICON_CLASS_NAME} />} size={Size.Sm}>
          Open menu
        </Button>
      }
    >
      <NestedExample />
    </Dropdown>
  );
}

export const Default: Story = {
  render: (args) => <MenuRenderer {...args} />,
  args: { children: "Menu", trigger: "Menu", variant: Variant.Default },
};
