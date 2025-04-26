import type { Meta, ReactRenderer, StoryObj } from "@storybook/react";
import { Progress, type ProgressProps, Size, Variant } from "@semio/ui";
import { IconCheck } from "@tabler/icons-react";
import { type ReactNode, useEffect, useState } from "react";
import { type ArgsStoryFn } from "@storybook/core/csf";

const meta: Meta<typeof Progress> = {
  component: Progress,
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

type Story = StoryObj<typeof Progress>;

function ProgressAnimator(props: ProgressProps): ReactNode {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 0.1) % 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Progress {...props} progress={progress} />;
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Primary,
    size: Size.Md,
  },
};

export const Secondary: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Secondary,
    size: Size.Md,
  },
};

export const Tertiary: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Tertiary,
    size: Size.Md,
  },
};

export const Info: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Info,
    size: Size.Md,
  },
};

export const Warning: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Warning,
    size: Size.Md,
  },
};

export const Success: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Success,
    size: Size.Md,
  },
};

export const Error: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Error,
    size: Size.Md,
  },
};

export const ExtraSmall: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Success,
    size: Size.Xs,
  },
};

export const Small: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Default,
    size: Size.Sm,
  },
};

export const Medium: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Default,
    size: Size.Md,
  },
};

export const Large: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Default,
    size: Size.Lg,
  },
};

export const ExtraLarge: Story = {
  render: ProgressAnimator as ArgsStoryFn<ReactRenderer, ProgressProps>,
  args: {
    variant: Variant.Default,
    size: Size.Xl,
  },
};
