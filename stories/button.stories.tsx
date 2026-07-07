import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, IconHome, Size, Variant } from "@semio/ui";
import { IconPlus } from "@tabler/icons-react";
import { buttonVariant } from "./figma-links";

// Per-story Figma design link → the matching Button variant (1:1), instead of the
// whole variant set. `type` is a const so it satisfies addon-designs' typing.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Button> = {
  component: Button,
  title: "ui/Button",
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
  parameters: design(buttonVariant.defaultPrimary),
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
  parameters: design(buttonVariant.defaultSecondary),
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
  parameters: design(buttonVariant.invertedPrimary),
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
  parameters: design(buttonVariant.invertedSecondary),
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.borderedSecondary),
};

// Size stories: Figma has no Size axis (size is an examples demo), so these reuse
// the inverted-border/primary variant node — same visual+variant, different size.
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
};

// Custom-color stories: color is a prop, not a Figma variant → link the base visual.
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
  parameters: design(buttonVariant.defaultPrimary),
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
  parameters: design(buttonVariant.invertedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.defaultPrimary),
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
  parameters: design(buttonVariant.invertedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
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
  parameters: design(buttonVariant.borderedPrimary),
};

// call-to-action is a documented single example, not a Figma variant → no design link.
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
