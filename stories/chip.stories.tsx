import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip, Size, Variant } from "@semio/ui";
import { IconUser } from "@tabler/icons-react";

const meta: Meta<typeof Chip> = {
  component: Chip,
  title: "ui/Chip",
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

type Story = StoryObj<typeof Chip>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => <Chip {...props} />,
  name: "Default Chip",
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    variant: Variant.Primary,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const CustomColor: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    color: "#ee11ee",
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const ExtraSmall: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    size: Size.Xs,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const Small: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    size: Size.Sm,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const Large: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    size: Size.Lg,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const ExtraLarge: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    size: Size.Xl,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const NoIcon: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const NoDelete: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    renderIcon: (cn: string) => <IconUser className={cn} />,
    variant: Variant.Info,
  },
};
