import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField, Variant, Size, type TextFieldProps, ICON_CLASS_NAME } from "@semio/ui";
import { useState } from "react";
import { IconSearch } from "@tabler/icons-react";

const meta: Meta<typeof TextField> = {
  component: TextField,
  title: "ui/TextField",
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

type Story = StoryObj<typeof TextField>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function TextFieldWithHooks(props: TextFieldProps): JSX.Element {
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
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: true,
  },
};

export const PrimaryNoBg: Story = {
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
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: false,
  },
};

export const PrimaryIcon: Story = {
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
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: true,
  },
};

export const PrimaryIconClearable: Story = {
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
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    onClear: (): void => {
      // eslint-disable-next-line no-console -- log for demo
      console.log("Clear");
    },
    size: Size.Sm,
    variant: Variant.Primary,
    disabled: false,
    bg: true,
  },
};

export const SubtleIconClearable: Story = {
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
      // eslint-disable-next-line no-console -- log for demo
      console.log("Hello World!");
    },
    onClear: (): void => {
      // eslint-disable-next-line no-console -- log for demo
      console.log("Clear");
    },
    size: Size.Sm,
    variant: Variant.Default,
    disabled: false,
    bg: true,
    subtle: true,
  },
};
