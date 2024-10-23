import type { Meta, StoryObj } from "@storybook/react";
import { Chip, Size, Variant } from "@semio/ui";
import { IconUser } from "@tabler/icons-react";

const meta: Meta<typeof Chip> = {
  component: Chip,
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
    value: "Hello World",
    icon: <IconUser />,
    variant: Variant.Primary,
    onDelete: () => {
      // eslint-disable-next-line no-console -- This is a demo
      console.log("Delete");
    },
  },
};

export const CustomColor: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    value: "Hello World",
    icon: <IconUser />,
    color: "#ee11ee",
    onDelete: () => {
      // eslint-disable-next-line no-console -- This is a demo
      console.log("Delete");
    },
  },
};

export const ExtraSmall: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    value: "Hello World",
    icon: <IconUser />,
    size: Size.Xs,
    variant: Variant.Info,
    onDelete: () => {
      // eslint-disable-next-line no-console -- This is a demo
      console.log("Delete");
    },
  },
};

export const Small: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    value: "Hello World",
    icon: <IconUser />,
    size: Size.Sm,
    variant: Variant.Info,
    onDelete: () => {
      // eslint-disable-next-line no-console -- This is a demo
      console.log("Delete");
    },
  },
};

export const Large: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    value: "Hello World",
    icon: <IconUser />,
    size: Size.Lg,
    variant: Variant.Info,
    onDelete: () => {
      // eslint-disable-next-line no-console -- This is a demo
      console.log("Delete");
    },
  },
};

export const NoIcon: Story = {
  render: (props) => <Chip {...props} />,
  args: {
    value: "Hello World",
    variant: Variant.Info,
    onDelete: () => {
      // eslint-disable-next-line no-console -- This is a demo
      console.log("Delete");
    },
  },
};
