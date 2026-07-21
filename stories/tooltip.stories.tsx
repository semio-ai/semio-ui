import { type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Tooltip, Size, Variant, type TooltipProps } from "@semio/ui";
import { IconHandFinger } from "@tabler/icons-react";

import { tooltipPreview } from "./figma-links";

const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Tooltip> = {
  parameters: design(tooltipPreview),
  component: Tooltip,
  title: "ui/Tooltip",
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

type Story = StoryObj<typeof Tooltip>;

function TooltipRenderer({ children, ...props }: TooltipProps): ReactNode {
  return (
    <Tooltip {...props}>
      <Button
        variant={props.variant}
        rightIcon={<IconHandFinger className="h-3/5 w-3/5" />}
        size={Size.Sm}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Default,
  },
};

export const Primary: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: (args) => <TooltipRenderer {...args} />,
  args: {
    children: "Hover Me",
    content: "Surprise!",
    variant: Variant.Error,
  },
};
