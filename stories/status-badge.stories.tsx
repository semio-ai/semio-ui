import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge, Size, Variant } from "@semio/ui";
import type { ReactNode } from "react";
import { statusVariant } from "./figma-links";

// Per-story Figma design link → the matching StatusBadge preview frame (1:1).
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof StatusBadge> = {
  component: StatusBadge,
  title: "ui/StatusBadge",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

// The badge marks a child element; render it over a sample swatch.
function Swatch(): ReactNode {
  return <div className="h-10 w-10 rounded-md bg-neutral-300 dark:bg-neutral-700" />;
}

const story = (variant: Variant, link: string): Story => ({
  parameters: design(link),
  render: (args) => (
    <StatusBadge {...args}>
      <Swatch />
    </StatusBadge>
  ),
  args: { variant, size: Size.Md, placement: "top-right" },
});

export const Default = story(Variant.Default, statusVariant.default);
export const Primary = story(Variant.Primary, statusVariant.primary);
export const Secondary = story(Variant.Secondary, statusVariant.secondary);
export const Tertiary = story(Variant.Tertiary, statusVariant.tertiary);
export const Error = story(Variant.Error, statusVariant.error);
export const Success = story(Variant.Success, statusVariant.success);
export const Warning = story(Variant.Warning, statusVariant.warning);
export const Info = story(Variant.Info, statusVariant.info);

export const Count: Story = {
  parameters: design(statusVariant.error),
  render: (args) => (
    <StatusBadge {...args}>
      <Swatch />
    </StatusBadge>
  ),
  args: { variant: Variant.Error, size: Size.Md, placement: "top-right", text: "9" },
};
