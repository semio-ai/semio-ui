import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, type SelectProps, Size, Tooltip, Variant, ICON_CLASS_NAME } from "@semio/ui";
import { IconMessageCircle2, IconWorld } from "@tabler/icons-react";

import { floatingExample } from "./figma-links";

const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Select> = {
  parameters: design(floatingExample.select),
  component: Select,
  title: "ui/Select",
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

type Story = StoryObj<typeof Select>;

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function SelectWithHooks(props: SelectProps<string | string[]>): ReactElement {
  const [value, setValue] = useState<string | string[]>(props.value ?? "");

  return (
    <div className="w-96">
      <Select {...props} value={value} onChange={setValue} />
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
    return <SelectWithHooks {...props} />;
  },
  name: "Single",
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "both",
  },
};

export const Multiple: Story = {
  render: (props) => {
    return (
      <div className="w-full">
        <SelectWithHooks {...props} />
      </div>
    );
  },
  args: {
    variant: Variant.Default,
    value: ["hello"],
    options: [
      { value: "hello", label: "Hello", color: "#ee11ee" },
      { value: "world", label: "World", color: "#11ee11" },
      { value: "i", label: "I", color: "#1111ee" },
      { value: "am", label: "Am", color: "#ee1111" },
      { value: "a", label: "A", color: "#11eeee" },
      { value: "multiple", label: "Multiple", color: "#eeee11" },
      { value: "select", label: "Select", color: "#11ee11" },
      { value: "default", label: "Default" },
    ],
    size: Size.Sm,
    visuals: "both",
  },
};

export const VisualsBoth: Story = {
  render: (props) => {
    return <SelectWithHooks {...props} />;
  },
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "both",
  },
};

export const VisualsIcons: Story = {
  render: (props) => {
    return <SelectWithHooks {...props} />;
  },
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "icons",
  },
};

export const VisualsLabels: Story = {
  render: (props) => {
    return <SelectWithHooks {...props} />;
  },
  args: {
    variant: Variant.Default,
    value: "hello",
    options: [
      {
        value: "hello",
        label: "Hello",
        color: "#33bbbb",
        icon: <IconMessageCircle2 className={ICON_CLASS_NAME} />,
      },
      {
        value: "world",
        label: "World",
        color: "#737373",
        icon: <IconWorld className={ICON_CLASS_NAME} />,
      },
    ],
    size: Size.Sm,
    visuals: "labels",
  },
};

/**
 * A value the reader may see and may not set.
 *
 * The menu will not open, the trigger dims, and the reason travels with it. That last
 * part is the point: a greyed control with no explanation tells the reader only what
 * they already inferred from it being grey, and the two questions they actually have
 * are "is this deliberate?" and "what would change it?".
 *
 * Note the tooltip still works. `disabled` deliberately does not set
 * `pointer-events: none` — Radix already refuses to open a disabled trigger, so
 * suppressing pointer events would buy nothing and would cost the only affordance left
 * for carrying the reason. Compare the two below: the same control, one of them
 * unexplained.
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <div>
        <div className="mb-1 font-mono text-xs text-neutral-500">
          disabled, with the reason attached — hover it
        </div>
        {/* The wrapping span is required: `Tooltip` uses Radix `asChild` and hands its
            ref and pointer handlers to its child, which `Select` does not forward. Pass
            the Select directly and the tooltip silently never opens. */}
        <Tooltip content="Keeping a published asset private is a paid capability, so this cannot be lowered on the current plan.">
          <span className="flex w-full">
            <Select
              value="viewer"
              onChange={() => undefined}
              options={ROLE_OPTIONS}
              size={Size.Sm}
              variant={Variant.Default}
              label="Role for Anyone"
              disabled
            />
          </span>
        </Tooltip>
      </div>
      <div>
        <div className="mb-1 font-mono text-xs text-neutral-500">
          disabled with no reason — what this looks like done badly
        </div>
        <Select
          value="viewer"
          onChange={() => undefined}
          options={ROLE_OPTIONS}
          size={Size.Sm}
          variant={Variant.Default}
          label="Role, unexplained"
          disabled
        />
      </div>
      <div>
        <div className="mb-1 font-mono text-xs text-neutral-500">enabled, for comparison</div>
        <SelectWithHooks
          value="viewer"
          onChange={() => undefined}
          options={ROLE_OPTIONS}
          size={Size.Sm}
          variant={Variant.Default}
          label="Role for Grace"
        />
      </div>
    </div>
  ),
};
Disabled.parameters = design(floatingExample.select);

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

/**
 * Per-option descriptions, as tooltips.
 *
 * The extra sentence sits at the point of decision without changing the option. It is
 * deliberately NOT a second line inside the item: an item that grows to hold prose stops
 * matching the interactive rhythm of the rows around it, and makes the menu size itself
 * around explanatory text rather than around its controls.
 *
 * The second control is the control for that claim — the same options without
 * descriptions, rendering identically, because `Tooltip` short-circuits when there is
 * nothing to say rather than wrapping the item in an armed trigger.
 *
 * A tooltip needs hover or focus, so treat it as an aid rather than the only home for a
 * fact. Anything required to choose correctly belongs in the label or beside the control.
 */
export const OptionDescriptions: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-1 font-mono text-xs text-neutral-500">
          described rungs — hover an option in the open menu
        </div>
        <div className="w-28">
          <SelectWithHooks
            value="viewer"
            options={[
              { label: "Admin", value: "admin", description: "Can edit and manage access." },
              { label: "Editor", value: "editor", description: "Can edit, but not share." },
              { label: "Viewer", value: "viewer", description: "Can view." },
            ]}
            size={Size.Sm}
            variant={Variant.Default}
            label="Role"
            onChange={() => undefined}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 font-mono text-xs text-neutral-500">
          the same rungs undescribed — unchanged, which is the point
        </div>
        <div className="w-28">
          <SelectWithHooks
            value="viewer"
            options={ROLE_OPTIONS}
            size={Size.Sm}
            variant={Variant.Default}
            label="Role"
            onChange={() => undefined}
          />
        </div>
      </div>
    </div>
  ),
};
