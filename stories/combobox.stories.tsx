import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Combobox,
  type ComboboxOption,
  type ComboboxGroup,
  ICON_CLASS_NAME,
  Size,
  Variant,
} from "@semio/ui";
import {
  IconCircle,
  IconEye,
  IconPencil,
  IconShield,
  IconWorld,
} from "@tabler/icons-react";

const meta: Meta = {
  title: "ui/Combobox",
  decorators: [
    (Story) => (
      <div className="flex min-h-[60vh] justify-center p-10">
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const ROLE_OPTIONS: ComboboxOption[] = [
  { label: "Owner", value: "owner", icon: <IconShield className={ICON_CLASS_NAME} /> },
  { label: "Editor", value: "editor", icon: <IconPencil className={ICON_CLASS_NAME} /> },
  { label: "Viewer", value: "viewer", icon: <IconEye className={ICON_CLASS_NAME} /> },
];

const FRUIT_OPTIONS: ComboboxOption[] = [
  "Apple","Apricot","Banana","Blackberry","Blueberry","Cherry","Cranberry","Date","Elderberry","Fig",
  "Grape","Grapefruit","Honeydew","Kiwi","Lemon","Lime","Mango","Mulberry","Nectarine","Orange",
  "Papaya","Peach","Pear","Pineapple","Plum","Pomegranate","Raspberry","Strawberry","Tangerine","Watermelon",
].map((label) => ({ label, value: label.toLowerCase() }));

const COUNTRY_OPTIONS: ComboboxOption[] = [
  "Argentina","Australia","Austria","Belgium","Brazil","Bulgaria","Canada","Chile","Colombia","Croatia",
  "Czechia","Denmark","Egypt","Estonia","Finland","France","Germany","Greece","Hungary","Iceland",
  "India","Indonesia","Ireland","Israel","Italy","Japan","Kenya","Latvia","Lithuania","Luxembourg",
  "Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines",
  "Poland","Portugal","Qatar","Romania","Saudi Arabia","Singapore","Slovakia","Slovenia","South Africa","South Korea",
  "Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Vietnam",
].map((label) => ({ label, value: label.toLowerCase().replace(/\s+/g, "-") }));

const COLORED_OPTIONS: ComboboxOption[] = [
  { label: "Hello", value: "hello", color: "#33bbbb" },
  { label: "World", value: "world", color: "#737373", icon: <IconWorld className={ICON_CLASS_NAME} /> },
  { label: "Multiple", value: "multiple", color: "#eeee11" },
  { label: "Default", value: "default" },
];

const GROUPED_OPTIONS: ComboboxGroup[] = [
  {
    label: "Roles",
    items: ROLE_OPTIONS,
  },
  {
    label: "Fruits",
    items: FRUIT_OPTIONS.slice(0, 6),
  },
];

function SingleDemo(): ReactElement {
  const [value, setValue] = useState<string | null>("editor");
  return (
    <Combobox<string>
      options={ROLE_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Choose a role…"
    />
  );
}

export const Single: Story = {
  render: () => <SingleDemo />,
};

function WithIconsDemo(): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox<string>
      options={COLORED_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Pick a value…"
    />
  );
}

export const WithIcons: Story = {
  render: () => <WithIconsDemo />,
};

function LongListDemo(): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox<string>
      options={COUNTRY_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Pick a country…"
    />
  );
}

export const LongList: Story = {
  render: () => <LongListDemo />,
};

function EmptyStateDemo(): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox<string>
      options={ROLE_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Type 'zzz' to see the empty state"
      defaultOpen
    />
  );
}

export const EmptyState: Story = {
  render: () => <EmptyStateDemo />,
};

function GroupedDemo(): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox<string>
      options={GROUPED_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Pick from groups…"
    />
  );
}

export const Grouped: Story = {
  render: () => <GroupedDemo />,
};

function SizesDemo(): ReactElement {
  const sizes: { label: string; size: Size }[] = [
    { label: "xs", size: Size.Xs },
    { label: "sm", size: Size.Sm },
    { label: "md", size: Size.Md },
    { label: "lg", size: Size.Lg },
  ];

  return (
    <div className="flex flex-col gap-3">
      {sizes.map(({ label, size }) => (
        <div key={label}>
          <div className="mb-1 text-xs text-neutral-500">{label}</div>
          <SizesRow size={size} />
        </div>
      ))}
    </div>
  );
}

function SizesRow({ size }: { size: Size }): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox<string>
      options={ROLE_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Choose a role…"
      size={size}
    />
  );
}

export const Sizes: Story = {
  render: () => <SizesDemo />,
};

function VariantsDemo(): ReactElement {
  const variants: Variant[] = [
    Variant.Default,
    Variant.Primary,
    Variant.Secondary,
    Variant.Tertiary,
    Variant.Info,
    Variant.Success,
    Variant.Warning,
    Variant.Error,
  ];

  return (
    <div className="flex flex-col gap-3">
      {variants.map((variant) => (
        <div key={variant}>
          <div className="mb-1 text-xs text-neutral-500">{variant}</div>
          <VariantsRow variant={variant} />
        </div>
      ))}
    </div>
  );
}

function VariantsRow({ variant }: { variant: Variant }): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox<string>
      options={ROLE_OPTIONS}
      value={value}
      onChange={setValue}
      placeholder="Choose a role…"
      variant={variant}
    />
  );
}

export const Variants: Story = {
  render: () => <VariantsDemo />,
};

function DisabledDemo(): ReactElement {
  const [value, setValue] = useState<string | null>("viewer");
  const optionsWithDisabled: ComboboxOption[] = [
    { label: "Owner (locked)", value: "owner", disabled: true, icon: <IconCircle className={ICON_CLASS_NAME} /> },
    { label: "Editor", value: "editor", icon: <IconPencil className={ICON_CLASS_NAME} /> },
    { label: "Viewer", value: "viewer", icon: <IconEye className={ICON_CLASS_NAME} /> },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1 text-xs text-neutral-500">Whole input disabled</div>
        <Combobox<string>
          options={ROLE_OPTIONS}
          value={value}
          onChange={setValue}
          disabled
        />
      </div>
      <div>
        <div className="mb-1 text-xs text-neutral-500">Disabled item</div>
        <Combobox<string>
          options={optionsWithDisabled}
          value={value}
          onChange={setValue}
        />
      </div>
    </div>
  );
}

export const Disabled: Story = {
  render: () => <DisabledDemo />,
};

function ControlledDemo(): ReactElement {
  const [value, setValue] = useState<string | null>("editor");
  return (
    <div className="flex flex-col gap-3">
      <Combobox<string>
        options={ROLE_OPTIONS}
        value={value}
        onChange={setValue}
      />
      <div className="text-sm">
        Current value: <span className="font-medium">{value ?? "(none)"}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded border border-neutral-500/30 px-2 py-1 text-xs"
          onClick={() => setValue("owner")}
        >
          Set owner
        </button>
        <button
          type="button"
          className="rounded border border-neutral-500/30 px-2 py-1 text-xs"
          onClick={() => setValue(null)}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
