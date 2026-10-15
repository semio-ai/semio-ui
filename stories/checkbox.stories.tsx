import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, type CheckboxProps, Size, Variant, Theme } from "@semio/ui";
import { useState, type ReactNode } from "react";
import { ControlSurfaces } from "./control-surfaces";
import { checkboxVariant } from "./figma-links";

// Per-story Figma design link → the matching Checkbox preview frame (1:1).
// Mirrors button.stories.tsx / text-field.stories.tsx.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: "ui/Checkbox",
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
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Md,
    disabled: false,
  },
};

export const Secondary: Story = {
  parameters: design(checkboxVariant.secondary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Secondary,
    size: Size.Md,
    disabled: false,
  },
};

export const Tertiary: Story = {
  parameters: design(checkboxVariant.tertiary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Tertiary,
    size: Size.Md,
    disabled: false,
  },
};

export const Success: Story = {
  parameters: design(checkboxVariant.success),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Success,
    size: Size.Md,
    disabled: false,
  },
};

export const Warning: Story = {
  parameters: design(checkboxVariant.warning),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Warning,
    size: Size.Md,
    disabled: false,
  },
};

export const Error: Story = {
  parameters: design(checkboxVariant.error),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Error,
    size: Size.Md,
    disabled: false,
  },
};

export const Info: Story = {
  parameters: design(checkboxVariant.info),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Info,
    size: Size.Md,
    disabled: false,
  },
};

export const ExtraSmall: Story = {
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Xs,
    disabled: false,
  },
};

export const Small: Story = {
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Sm,
    disabled: false,
  },
};

export const Medium: Story = {
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Md,
    disabled: false,
  },
};

export const Large: Story = {
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Lg,
    disabled: false,
  },
};

export const ExtraLarge: Story = {
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Xl,
    disabled: false,
  },
};

export const Disabled: Story = {
  parameters: design(checkboxVariant.primary),
  render: (args) => <CheckboxRenderer {...args} />,
  args: {
    checked: true,
    variant: Variant.Primary,
    size: Size.Md,
    disabled: true,
  },
};

function SurfaceStates() {
  return (
    <ControlSurfaces>
      {[false, true].flatMap((disabled) =>
        [false, true].map((value) => (
          <div key={`${disabled}-${value}`} className="flex items-center gap-2">
            <CheckboxRenderer
              checked={value}
              disabled={disabled}
              variant={Variant.Primary}
              size={Size.Sm}
              onCheckedChange={() => {}}
            />
            <span>
              {disabled ? "Disabled " : ""}
              {value ? "On" : "Off"}
            </span>
          </div>
        )),
      )}
      {[false, true].flatMap((disabled) =>
        [false, true].map((value) => (
          <div key={`indicator-${disabled}-${value}`} className="flex items-center gap-2">
            <CheckboxRenderer
              checked={value}
              disabled={disabled}
              variant={Variant.Primary}
              size={Size.Sm}
              sizing="list-item"
              asIndicator
              onCheckedChange={() => {}}
            />
            <span>
              Indicator {disabled ? "disabled " : ""}
              {value ? "On" : "Off"}
            </span>
          </div>
        )),
      )}
    </ControlSurfaces>
  );
}

export const LightSurfaces: Story = {
  globals: { theme: Theme.Light },
  render: () => <SurfaceStates />,
};

export const DarkSurfaces: Story = {
  globals: { theme: Theme.Dark },
  render: () => <SurfaceStates />,
};
