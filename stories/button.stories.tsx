import type { Meta, StoryObj } from "@storybook/react";
import { Button, IconHome, Size, Variant } from "@semio/ui";
import { IconPlus } from "@tabler/icons-react";

const meta: Meta<typeof Button> = {
  component: Button,
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

type Story = StoryObj<typeof Button>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const DefaultPrimary: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    disabled: false,
  },
};

export const DefaultSecondary: Story = {
  args: {
    children: "Hello",
    variant: Variant.Secondary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    disabled: false,
  },
};

export const InvertedPrimary: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted",
    disabled: false,
  },
};

export const InvertedSecondary: Story = {
  args: {
    children: "Hello",
    variant: Variant.Secondary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted",
    disabled: false,
  },
};

export const BorderedPrimary: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    disabled: false,
  },
};

export const BorderedSecondary: Story = {
  args: {
    children: "Hello",
    variant: Variant.Secondary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    disabled: false,
  },
};

export const PrimaryExtraSmall: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Xs,
    disabled: false,
  },
};

export const PrimarySmall: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Sm,
    disabled: false,
  },
};

export const PrimaryMedium: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Md,
    disabled: false,
  },
};

export const PrimaryLarge: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Lg,
    disabled: false,
  },
};

export const PrimaryExtraLarge: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Xl,
    disabled: false,
  },
};

export const CustomColorButton: Story = {
  args: {
    children: "Hello",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    size: Size.Md,
    disabled: false,
    color: "#FF00FF",
  },
};

export const CustomColorInvertedButton: Story = {
  args: {
    children: "Hello",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted",
    size: Size.Md,
    disabled: false,
    color: "#FF00FF",
  },
};

export const CustomColorBorderButton: Story = {
  args: {
    children: "Hello",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Md,
    disabled: false,
    color: "#FF00FF",
  },
};

export const PrimaryIconButton: Story = {
  args: {
    leftIcon: <IconHome />,
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    size: Size.Md,
    disabled: false,
  },
};

export const PrimaryInvertedIconButton: Story = {
  args: {
    leftIcon: <IconHome />,
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted",
    size: Size.Md,
    disabled: false,
  },
};

export const PrimaryBorderedIconButton: Story = {
  args: {
    leftIcon: <IconHome />,
    variant: Variant.Primary,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Md,
    disabled: false,
  },
};

export const PrimaryButtonIconText: Story = {
  args: {
    children: "Hello",
    variant: Variant.Primary,
    leftIcon: <IconHome />,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "inverted-border",
    size: Size.Md,
    disabled: false,
  },
};

export const PrimaryCallToActionButton: Story = {
  args: {
    children: "Join!",
    variant: Variant.Primary,
    leftIcon: <IconPlus />,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "call-to-action",
    size: Size.Md,
    disabled: false,
  },
};

export const CustomCallToActionButton: Story = {
  args: {
    children: "Join!",
    leftIcon: <IconPlus />,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    visuals: "call-to-action",
    size: Size.Md,
    disabled: false,
    color: "#FF33FF",
  },
};
