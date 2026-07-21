import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress, type ProgressProps, Size, Variant } from "@semio/ui";
import { type ReactNode, useEffect, useState } from "react";
import { progressVariant } from "./figma-links";

// Per-story Figma design link → the matching Progress preview frame (1:1).
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Progress> = {
  component: Progress,
  title: "ui/Progress",
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
  parameters: design(progressVariant.primary),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Primary,
    size: Size.Md,
  },
};

export const Secondary: Story = {
  parameters: design(progressVariant.secondary),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Secondary,
    size: Size.Md,
  },
};

export const Tertiary: Story = {
  parameters: design(progressVariant.tertiary),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Tertiary,
    size: Size.Md,
  },
};

export const Info: Story = {
  parameters: design(progressVariant.info),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Info,
    size: Size.Md,
  },
};

export const Warning: Story = {
  parameters: design(progressVariant.warning),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Warning,
    size: Size.Md,
  },
};

export const Success: Story = {
  parameters: design(progressVariant.success),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Md,
  },
};

export const Error: Story = {
  parameters: design(progressVariant.error),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Error,
    size: Size.Md,
  },
};

export const ExtraSmall: Story = {
  parameters: design(progressVariant.success),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Xs,
  },
};

export const Small: Story = {
  parameters: design(progressVariant.default),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Default,
    size: Size.Sm,
  },
};

export const Medium: Story = {
  parameters: design(progressVariant.default),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Default,
    size: Size.Md,
  },
};

export const Large: Story = {
  parameters: design(progressVariant.default),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Default,
    size: Size.Lg,
  },
};

export const ExtraLarge: Story = {
  parameters: design(progressVariant.default),
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Default,
    size: Size.Xl,
  },
};
