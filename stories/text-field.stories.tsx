import type { Meta, StoryObj } from "@storybook/react";
import { TextField, Variant, Size, type TextFieldProps } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof TextField> = {
  component: TextField,
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
        onChange={(v) => {
          setT(v);
          props.onChange?.(v);
        }}
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
  name: "Text Field",
  args: {
    value: "I am text",
    // variant: Variant.PRIMARY,
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
