import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleSquare, type ToggleSquareProps, Size, Variant, Theme } from "@semio/ui";
import { IconBox } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { ControlSurfaces } from "./control-surfaces";
import { toggleSquareVariant } from "./figma-links";

// Per-story Figma design link → the matching ToggleSquare preview frame (1:1).
// Mirrors button.stories.tsx / checkbox.stories.tsx.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof ToggleSquare> = {
  component: ToggleSquare,
  title: "ui/ToggleSquare",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToggleSquare>;

function ToggleSquareRenderer({ ...props }: ToggleSquareProps): ReactNode {
  const [value, setValue] = useState<boolean | "partial">(props.value);
  return (
    <ToggleSquare {...props} value={value} onChange={(v) => setValue(v)}>
      <IconBox />
    </ToggleSquare>
  );
}

export const Default: Story = {
  parameters: design(toggleSquareVariant.default),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: true, variant: Variant.Default, size: Size.Md },
};

export const Primary: Story = {
  parameters: design(toggleSquareVariant.primary),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: true, variant: Variant.Primary, size: Size.Md },
};

export const Secondary: Story = {
  parameters: design(toggleSquareVariant.secondary),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: true, variant: Variant.Secondary, size: Size.Md },
};

export const Tertiary: Story = {
  parameters: design(toggleSquareVariant.tertiary),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: true, variant: Variant.Tertiary, size: Size.Md },
};

export const Error: Story = {
  parameters: design(toggleSquareVariant.error),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: true, variant: Variant.Error, size: Size.Md },
};

export const Off: Story = {
  parameters: design(toggleSquareVariant.primary),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: false, variant: Variant.Primary, size: Size.Md },
};

export const Partial: Story = {
  parameters: design(toggleSquareVariant.primary),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: "partial", variant: Variant.Primary, size: Size.Md },
};

export const Disabled: Story = {
  parameters: design(toggleSquareVariant.primary),
  render: (args) => <ToggleSquareRenderer {...args} />,
  args: { value: true, variant: Variant.Primary, size: Size.Md, disabled: true },
};

function SurfaceStates() {
  return (
    <ControlSurfaces>
      {[false, true].flatMap((disabled) =>
        [false, true, "partial" as const].map((value) => (
          <div key={`${disabled}-${value}`} className="flex items-center gap-2">
            <ToggleSquareRenderer
              value={value}
              disabled={disabled}
              variant={Variant.Primary}
              size={Size.Sm}
              onChange={() => {}}
            />
            <span>
              {disabled ? "Disabled " : ""}
              {value === "partial" ? "Partial" : value ? "On" : "Off"}
            </span>
          </div>
        )),
      )}
      {[false, true].flatMap((disabled) =>
        [false, true, "partial" as const].map((value) => (
          <div key={`indicator-${disabled}-${value}`} className="flex items-center gap-2">
            <ToggleSquareRenderer
              value={value}
              disabled={disabled}
              variant={Variant.Primary}
              size={Size.Sm}
              sizing="list-item"
              asIndicator
              onChange={() => {}}
            />
            <span>
              Indicator {disabled ? "disabled " : ""}
              {value === "partial" ? "Partial" : value ? "On" : "Off"}
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
