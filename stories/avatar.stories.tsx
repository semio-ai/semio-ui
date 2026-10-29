import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Size, Variant, ICON_CLASS_NAME } from "@semio/ui";
import { IconUser } from "@tabler/icons-react";

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: "ui/Avatar",
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
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
      console.info("Activated");
    },
  },
};

/**
 * Sized by its container rather than by `size`.
 *
 * The case this exists for is an **aspect ratio**. `size` emits an explicit `height`,
 * and an explicit height beats `aspect-ratio` outright — they are different
 * declarations, so no cascade rule resolves it in the caller's favour. The first pair
 * below is handed the identical `aspect-video w-full`; only the second honours it.
 *
 * It is NOT needed to beat a same-family width/height class. Tailwind compiles the size
 * variants as `.sized-height:where(.size-md)`, and `:where()` adds no specificity, so a
 * later-emitted `sized-row-media` already wins — the second pair renders at 28px either
 * way, which is why it is here rather than omitted.
 */
export const ContainerSizing: Story = {
  render: () => (
    <div className="flex flex-col gap-6" style={{ ["--row-media" as string]: "1.75rem" }}>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-neutral-500">
          aspect-video w-full — sizing=&quot;size&quot; collapses it to the size height
        </span>
        <div className="w-52 bg-neutral-500/10">
          <Avatar alt="Ada" size={Size.Md} className="aspect-video w-full" />
        </div>
        <span className="font-mono text-xs text-neutral-500">
          the same class with sizing=&quot;container&quot; — the ratio is honoured
        </span>
        <div className="w-52 bg-neutral-500/10">
          <Avatar alt="Ada" size={Size.Md} sizing="container" className="aspect-video w-full" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Avatar alt="Ada" size={Size.Md} className="sized-row-media" />
        <Avatar alt="Ada" size={Size.Md} sizing="container" className="sized-row-media" />
        <span className="font-mono text-xs text-neutral-500">
          a row tile: 28px under both settings, so the prop changes nothing here
        </span>
      </div>
    </div>
  ),
};
