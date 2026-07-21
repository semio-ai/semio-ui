import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField, Variant, Size, type TextFieldProps, ICON_CLASS_NAME } from "@semio/ui";
import { useState, type ReactElement } from "react";
import { IconSearch } from "@tabler/icons-react";
import { textFieldVariant } from "./figma-links";

// Per-story Figma design link → the matching TextField preview frame (1:1),
// instead of the whole variant set. `type` is a const so it satisfies
// addon-designs' typing. Mirrors button.stories.tsx.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof TextField> = {
  component: TextField,
  title: "ui/TextField",
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

type Story = StoryObj<typeof TextField>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function TextFieldWithHooks(props: TextFieldProps): ReactElement {
  const [t, setT] = useState<string | readonly string[] | number | undefined>(
    props.value as unknown as string | readonly string[] | number | undefined,
  );

  return (
    <div className="w-96">
      <TextField
        {...props}
        value={t}
        onChange={(v: string, e) => {
          setT(v);
          props.onChange?.(v, e);
        }}
        onClear={
          props.onClear
            ? (e) => {
                setT("");
                props.onClear?.(e);
              }
            : undefined
        }
      />
    </div>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  parameters: design(textFieldVariant.interactPrimary),
  render: (props) => {
    return (
      <div className="w-96">
        <TextFieldWithHooks {...props} />
      </div>
    );
  },
  args: {
    value: "I am text",
    onChange: (): void => {
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: true,
  },
};

export const PrimaryNoBg: Story = {
  parameters: design(textFieldVariant.interactPrimary),
  render: (props) => {
    return (
      <div className="w-96">
        <TextFieldWithHooks {...props} />
      </div>
    );
  },
  args: {
    value: "I am text",
    onChange: (): void => {
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: false,
  },
};

export const PrimaryIcon: Story = {
  parameters: design(textFieldVariant.interactPrimary),
  render: (props) => {
    return (
      <div className="w-96">
        <TextFieldWithHooks {...props} />
      </div>
    );
  },
  args: {
    value: "I am text",
    icon: <IconSearch className={ICON_CLASS_NAME} />,
    onChange: (): void => {
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: true,
  },
};

export const PrimaryIconClearable: Story = {
  parameters: design(textFieldVariant.interactPrimary),
  render: (props) => {
    return (
      <div className="w-96">
        <TextFieldWithHooks {...props} />
      </div>
    );
  },
  args: {
    value: "I am text",
    icon: <IconSearch className={ICON_CLASS_NAME} />,
    onChange: (): void => {
      console.log("Hello World!");
    },
    onClear: (): void => {
      console.log("Clear");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: true,
  },
};

export const SubtleIconClearable: Story = {
  parameters: design(textFieldVariant.interactDefault),
  render: (props) => {
    return (
      <div className="w-96">
        <TextFieldWithHooks {...props} />
      </div>
    );
  },
  args: {
    value: "I am text",
    icon: <IconSearch className={ICON_CLASS_NAME} />,
    onChange: (): void => {
      console.log("Hello World!");
    },
    onClear: (): void => {
      console.log("Clear");
    },
    size: Size.Sm,
    variant: Variant.Default,
    disabled: false,
    bg: true,
    subtle: true,
  },
};
