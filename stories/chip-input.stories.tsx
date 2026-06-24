import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChipInput, type ChipInputProps, Variant, Size } from "@semio/ui";

const meta: Meta<typeof ChipInput> = {
  component: ChipInput,
  title: "ui/ChipInput",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <div className="w-full max-w-md">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ChipInput>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function ChipInputWithHooks(props: ChipInputProps): ReactElement {
  const [selectedValues, setSelectedValues] = useState<string[]>(props.selectedValues);

  return <ChipInput {...props} selectedValues={selectedValues} onChange={setSelectedValues} />;
}

const sampleOptions = [
  { label: "React", value: "react" },
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Java", value: "java" },
];

const coloredOptions = [
  { label: "React", value: "react", color: "#61DAFB" },
  { label: "TypeScript", value: "typescript", color: "#3178C6" },
  { label: "JavaScript", value: "javascript", color: "#F7DF1E" },
  { label: "Python", value: "python", color: "#3776AB" },
  { label: "Go", value: "go", color: "#00ADD8" },
];

const iconOptions = [
  { label: "Users", value: "users", icon: "user" },
  { label: "Favorites", value: "favorites", icon: "star" },
  { label: "Liked", value: "liked", icon: "heart" },
  { label: "Regular Option", value: "regular" },
];

export const Default: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: [],
    options: sampleOptions,
  },
};

export const WithSelectedValues: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "nodejs"],
    options: sampleOptions,
  },
};

export const WithBackground: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript"],
    options: sampleOptions,
    bg: true,
  },
};

export const AlwaysOutline: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react"],
    options: sampleOptions,
    outline: "always",
  },
};

export const HiddenOutline: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript"],
    options: sampleOptions,
    outline: "hidden",
  },
};

export const Subtle: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react"],
    options: sampleOptions,
    subtle: true,
  },
};

export const Disabled: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript"],
    options: sampleOptions,
    disabled: true,
  },
};

export const CustomPlaceholder: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: [],
    options: sampleOptions,
    placeholder: "Choose your technologies...",
  },
};

export const PrimaryVariant: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript"],
    options: sampleOptions,
    variant: Variant.Primary,
  },
};

export const SecondaryVariant: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript"],
    options: sampleOptions,
    variant: Variant.Secondary,
  },
};

export const WithCustomColors: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "python"],
    options: coloredOptions,
  },
};

export const WithIcons: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["users", "favorites"],
    options: iconOptions,
  },
};

export const MixedOptions: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "users"],
    options: [
      ...coloredOptions.slice(0, 3),
      ...iconOptions.slice(0, 2),
      { label: "Disabled Option", value: "disabled", disabled: true },
    ],
  },
};

export const Interactive: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react"],
    options: sampleOptions,
    placeholder: "Select technologies...",
  },
};

export const InteractiveWithColors: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript"],
    options: coloredOptions,
    placeholder: "Select your stack...",
    bg: true,
  },
};

export const ExtraSmallSize: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "nodejs"],
    options: sampleOptions,
    size: Size.Xs,
  },
};

export const SmallSize: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "nodejs"],
    options: sampleOptions,
    size: Size.Sm,
  },
};

export const MediumSize: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "nodejs"],
    options: sampleOptions,
    size: Size.Md,
  },
};

export const LargeSize: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "nodejs"],
    options: sampleOptions,
    size: Size.Lg,
  },
};

export const ExtraLargeSize: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "typescript", "nodejs"],
    options: sampleOptions,
    size: Size.Xl,
  },
};

export const SizeWithIcons: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["users", "favorites", "liked"],
    options: iconOptions,
    size: Size.Lg,
    variant: Variant.Primary,
  },
};

export const WithCustomValues: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["custom", "values"],
    options: sampleOptions,
    allowCustomValues: true,
    placeholder: "Type and press Enter, comma, semicolon or dot...",
  },
};

export const CustomValuesWithBackground: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["tag1", "tag2"],
    options: [],
    allowCustomValues: true,
    bg: true,
    placeholder: "Add custom tags...",
    variant: Variant.Primary,
  },
};

export const CustomValuesWithOptions: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: ["react", "my-custom-tech"],
    options: sampleOptions,
    allowCustomValues: true,
    placeholder: "Select from dropdown or type custom values...",
    outline: "always",
  },
};

export const CustomValuesLarge: Story = {
  render: (props) => {
    return <ChipInputWithHooks {...props} />;
  },
  args: {
    selectedValues: [],
    options: coloredOptions,
    allowCustomValues: true,
    size: Size.Lg,
    variant: Variant.Secondary,
    placeholder: "Large size with custom values...",
    bg: true,
  },
};
