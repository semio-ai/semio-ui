import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useState } from "react";
import {
  ProgressCircle,
  type ProgressCircleProps,
  Size,
  Variant,
  ICON_CLASS_NAME,
} from "@semio/ui";
import { IconCheck } from "@tabler/icons-react";

const meta: Meta<typeof ProgressCircle> = {
  component: ProgressCircle,
  title: "ui/ProgressCircle",
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

type Story = StoryObj<typeof ProgressCircle>;

function ProgressAnimator(props: ProgressCircleProps): ReactNode {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 0.1) % 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <ProgressCircle {...props} progress={progress} />;
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Primary,
    size: Size.Md,
  },
};

export const Secondary: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Secondary,
    size: Size.Md,
  },
};

export const Tertiary: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Tertiary,
    size: Size.Md,
  },
};

export const ExtraSmall: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Xs,
  },
};

export const Small: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Sm,
  },
};

export const Medium: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Md,
  },
};

export const Large: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Lg,
  },
};

export const ExtraLarge: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Xl,
  },
};

export const InnerIcon: Story = {
  render: (args) => <ProgressAnimator {...args} />,
  args: {
    variant: Variant.Success,
    size: Size.Md,
    icon: <IconCheck className={ICON_CLASS_NAME} />,
  },
};
