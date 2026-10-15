import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch, type SwitchProps, Size, Variant, Theme } from "@semio/ui";
import { useState, type ReactNode } from "react";
import { ControlSurfaces } from "./control-surfaces";
import { switchVariant } from "./figma-links";

// Per-story Figma design link → the matching Switch preview frame (1:1).
// Mirrors button.stories.tsx / checkbox.stories.tsx.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Switch> = {
  component: Switch,
  title: "ui/Switch",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Switch>;

function SwitchRenderer({ ...props }: SwitchProps): ReactNode {
  const [checked, setChecked] = useState(props.checked);
  return <Switch {...props} checked={checked} onCheckedChange={(v) => setChecked(v)} />;
}

export const Default: Story = {
  parameters: design(switchVariant.default),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: true, variant: Variant.Default, size: Size.Md, disabled: false },
};

export const Primary: Story = {
  parameters: design(switchVariant.primary),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: true, variant: Variant.Primary, size: Size.Md, disabled: false },
};

export const Secondary: Story = {
  parameters: design(switchVariant.secondary),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: true, variant: Variant.Secondary, size: Size.Md, disabled: false },
};

export const Tertiary: Story = {
  parameters: design(switchVariant.tertiary),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: true, variant: Variant.Tertiary, size: Size.Md, disabled: false },
};

export const Error: Story = {
  parameters: design(switchVariant.error),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: true, variant: Variant.Error, size: Size.Md, disabled: false },
};

export const Off: Story = {
  parameters: design(switchVariant.primary),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: false, variant: Variant.Primary, size: Size.Md, disabled: false },
};

export const Disabled: Story = {
  parameters: design(switchVariant.primary),
  render: (args) => <SwitchRenderer {...args} />,
  args: { checked: true, variant: Variant.Primary, size: Size.Md, disabled: true },
};

function SurfaceStates() {
  return (
    <ControlSurfaces>
      {[false, true].flatMap((disabled) =>
        [false, true].map((value) => (
          <div key={`${disabled}-${value}`} className="flex items-center gap-2">
            <SwitchRenderer
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
