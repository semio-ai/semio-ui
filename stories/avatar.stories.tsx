import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Size, Variant, ICON_CLASS_NAME } from "@semio/ui";
import { IconUser } from "@tabler/icons-react";

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: "ui/Avatar",
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

type Story = StoryObj<typeof Avatar>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "default",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const PrimaryNoClick: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "default",
    alt: "Fred",
  },
};

export const PrimaryBorder: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "border",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const PrimaryBorderNoClick: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "border",
    alt: "Fred",
  },
};

export const PrimaryInverted: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "inverted",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const PrimaryInvertedNoClick: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "inverted",
    alt: "Fred",
  },
};

export const PrimaryInvertedBorder: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "inverted-border",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const PrimaryInvertedBorderNoClick: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "inverted-border",
    alt: "Fred",
  },
};

export const PrimarySrc: Story = {
  args: {
    variant: Variant.Primary,
    src: "https://avatars.githubusercontent.com/u/5341396?v=4&size=64",
    visuals: "default",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const PrimaryBorderSrc: Story = {
  args: {
    variant: Variant.Primary,
    src: "https://avatars.githubusercontent.com/u/5341396?v=4&size=64",
    visuals: "border",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const PrimaryStatusSrc: Story = {
  args: {
    variant: Variant.Primary,
    src: "https://avatars.githubusercontent.com/u/5341396?v=4&size=64",
    visuals: "default",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    status: {
      variant: Variant.Success,
      placement: "bottom-right",
    },
  },
};

export const PrimaryStatus: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "default",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    status: {
      variant: Variant.Success,
      placement: "bottom-right",
    },
  },
};

export const PrimaryIconStatus: Story = {
  args: {
    variant: Variant.Primary,
    icon: <IconUser className={ICON_CLASS_NAME} />,
    visuals: "default",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    status: {
      variant: Variant.Success,
      placement: "bottom-right",
    },
  },
};

export const PrimaryBorderStatusSrc: Story = {
  args: {
    variant: Variant.Primary,
    src: "https://avatars.githubusercontent.com/u/5341396?v=4&size=64",
    visuals: "border",
    alt: "Fred",
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
    status: {
      variant: Variant.Success,
      placement: "bottom-right",
    },
  },
};

export const PrimaryIcon: Story = {
  args: {
    variant: Variant.Primary,
    visuals: "default",
    alt: "Fred",
    icon: <IconUser className={ICON_CLASS_NAME} />,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const DefaultExtraSmall: Story = {
  args: {
    variant: Variant.Default,
    visuals: "default",
    alt: "Fred",
    size: Size.Xs,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const DefaultSmall: Story = {
  args: {
    variant: Variant.Default,
    visuals: "default",
    alt: "Fred",
    size: Size.Sm,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const DefaultMedium: Story = {
  args: {
    variant: Variant.Default,
    visuals: "default",
    alt: "Fred",
    size: Size.Md,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const DefaultLarge: Story = {
  args: {
    variant: Variant.Default,
    visuals: "default",
    alt: "Fred",
    size: Size.Lg,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};

export const DefaultExtraLarge: Story = {
  args: {
    variant: Variant.Default,
    visuals: "default",
    alt: "Fred",
    size: Size.Xl,
    onClick: (): void => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello From Semio!");
    },
  },
};
