import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip, Size, Variant } from "@semio/ui";
import { chipVariant } from "./figma-links";

// Per-story Figma design link → the matching Chip preview frame (1:1).
// Mirrors button.stories.tsx. Size / no-icon / no-delete stories reuse `info`.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Chip> = {
  component: Chip,
  title: "ui/Chip",
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

type Story = StoryObj<typeof Chip>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  parameters: design(chipVariant.primary),
  render: (props) => <Chip {...props} />,
  name: "Default Chip",
  args: {
    children: "Hello World",
    icon: "home",
    variant: Variant.Primary,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const CustomColor: Story = {
  parameters: design(chipVariant.primary),
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    icon: "home",
    color: "#ee11ee",
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const ExtraSmall: Story = {
  parameters: design(chipVariant.info),
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    icon: "home",
    size: Size.Xs,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const Small: Story = {
  parameters: design(chipVariant.info),
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    icon: "home",
    size: Size.Sm,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const Large: Story = {
  parameters: design(chipVariant.info),
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    icon: "home",
    size: Size.Lg,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const ExtraLarge: Story = {
  parameters: design(chipVariant.info),
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    icon: "home",
    size: Size.Xl,
    variant: Variant.Info,
    onDelete: () => {
      console.log("Delete");
    },
  },
};

export const NoIcon: Story = {
  parameters: design(chipVariant.info),
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
  parameters: design(chipVariant.info),
  render: (props) => <Chip {...props} />,
  args: {
    children: "Hello World",
    icon: "home",
    variant: Variant.Info,
  },
};
