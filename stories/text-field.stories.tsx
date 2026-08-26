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

/**
 * `visuals="inverted"` — no outline of its own, a translucent fill that brightens
 * on hover. For a field inside something that already draws the only border: the
 * toolbar card beside the breadcrumb, a pane header, the animation sheet's track
 * filter. Named to match `Button`'s `visuals="inverted"`, because reading as one
 * control set with those buttons is the point of it.
 *
 * Rendered here ON a bordered card rather than bare, because bare is exactly
 * where it looks wrong — the variant assumes a container is supplying the edge,
 * and a preview without one invites the mistake of using it standalone.
 *
 * Distinct from `bg`, which paints a lighter fill and does not respond to hover.
 */
export const Inverted: Story = {
  parameters: design(textFieldVariant.interactDefault),
  render: (props) => {
    return (
      <div className="flex w-96 flex-row items-center gap-1 rounded-sm border border-neutral-500/50 p-1">
        <TextFieldWithHooks {...props} />
      </div>
    );
  },
  args: {
    value: "",
    placeholder: "Search assets...",
    icon: <IconSearch className={ICON_CLASS_NAME} />,
    onChange: (): void => {
      console.log("Hello World!");
    },
    size: Size.Sm,
    variant: Variant.Default,
    visuals: "inverted",
    wrapperClassName: "flex-1",
  },
};
