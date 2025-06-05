import type { Meta, ReactRenderer, StoryObj } from "@storybook/react";
import { Checkbox, type CheckboxProps, Size, Variant } from "@semio/ui";
import { useState, type ReactNode } from "react";
import { type ArgsStoryFn } from "@storybook/core/csf";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
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

type Story = StoryObj<typeof Checkbox>;

function CheckboxRenderer({ ...props }: CheckboxProps): ReactNode {
  const [checked, setChecked] = useState(props.checked);
  return <Checkbox {...props} checked={checked} onCheckedChange={(v) => setChecked(v)} />;
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Md,
    disabled: false,
  },
};

export const Secondary: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Secondary,
    size: Size.Md,
    disabled: false,
  },
};

export const Tertiary: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Tertiary,
    size: Size.Md,
    disabled: false,
  },
};

export const Success: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Success,
    size: Size.Md,
    disabled: false,
  },
};

export const Warning: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Warning,
    size: Size.Md,
    disabled: false,
  },
};

export const Error: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Error,
    size: Size.Md,
    disabled: false,
  },
};

export const Info: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Info,
    size: Size.Md,
    disabled: false,
  },
};

export const ExtraSmall: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Xs,
    disabled: false,
  },
};

export const Small: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Sm,
    disabled: false,
  },
};

export const Medium: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Md,
    disabled: false,
  },
};

export const Large: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Lg,
    disabled: false,
  },
};

export const ExtraLarge: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Xl,
    disabled: false,
  },
};

export const Disabled: Story = {
  render: CheckboxRenderer as ArgsStoryFn<ReactRenderer, CheckboxProps>,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Md,
    disabled: true,
  },
};
