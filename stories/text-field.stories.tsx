import type { Meta, StoryObj } from "@storybook/react";
import { TextField, Variant, Size } from "@semio/ui";
import { useState } from "react";

const meta: Meta<typeof TextField> = {
  component: TextField,
};

export default meta;

type Story = StoryObj<typeof TextField>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    const [t, setT] = useState(props.value);

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
