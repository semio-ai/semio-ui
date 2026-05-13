import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Autocomplete,
  Button,
  ICON_CLASS_NAME,
  Modal,
  Size,
  Variant,
} from "@semio/ui";
import {
  IconBuilding,
  IconMapPin,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";

const meta: Meta = {
  title: "ui/Autocomplete",
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

const FRUITS = [
  "Apple",
  "Apricot",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Cranberry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Grapefruit",
  "Honeydew",
  "Kiwi",
  "Lemon",
  "Lime",
  "Mango",
  "Mulberry",
  "Nectarine",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Raspberry",
  "Strawberry",
  "Tangerine",
  "Watermelon",
];

interface PersonItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

const PEOPLE: PersonItem[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@semio.ai", role: "admin" },
  { id: "2", name: "Alan Turing", email: "alan@semio.ai", role: "editor" },
  { id: "3", name: "Grace Hopper", email: "grace@semio.ai", role: "viewer" },
  { id: "4", name: "Linus Torvalds", email: "linus@semio.ai", role: "editor" },
  { id: "5", name: "Margaret Hamilton", email: "margaret@semio.ai", role: "admin" },
  { id: "6", name: "Tim Berners-Lee", email: "tim@semio.ai", role: "viewer" },
  { id: "7", name: "Vint Cerf", email: "vint@semio.ai", role: "viewer" },
];

function filterByQuery<T>(items: T[], query: string, getKey: (item: T) => string) {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return items;
  return items.filter((item) => getKey(item).toLowerCase().includes(q));
}

function BasicDemo(): ReactElement {
  const [value, setValue] = useState("");
  const items = useMemo(
    () => filterByQuery(FRUITS, value, (s) => s),
    [value],
  );

  return (
    <Autocomplete<string>
      items={items}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item)}
      getItemKey={(item) => item}
      renderItem={(item) => <span className="truncate">{item}</span>}
      placeholder="Search fruits…"
    />
  );
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};

function WithIconsDemo(): ReactElement {
  const [value, setValue] = useState("");
  const items = useMemo(
    () =>
      filterByQuery(PEOPLE, value, (p) => `${p.name} ${p.email}`),
    [value],
  );

  const renderIcon = useCallback(() => <IconUser className={ICON_CLASS_NAME} />, []);
  const renderItem = useCallback(
    (item: PersonItem) => (
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
        <span className="truncate font-medium">{item.name}</span>
        <span className="truncate text-xs text-neutral-500">{item.email}</span>
      </span>
    ),
    [],
  );

  return (
    <Autocomplete<PersonItem>
      items={items}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item.name)}
      getItemKey={(item) => item.id}
      getItemIcon={renderIcon}
      renderItem={renderItem}
      placeholder="Search people…"
    />
  );
}

export const WithIcons: Story = {
  render: () => <WithIconsDemo />,
};

function AsyncDemo(): ReactElement {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PersonItem[]>([]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = window.setTimeout(() => {
      setResults(
        filterByQuery(PEOPLE, trimmed, (p) => `${p.name} ${p.email}`),
      );
      setLoading(false);
    }, 600);

    return () => {
      window.clearTimeout(handle);
    };
  }, [value]);

  const renderIcon = useCallback(() => <IconUser className={ICON_CLASS_NAME} />, []);
  const renderItem = useCallback(
    (item: PersonItem) => <span className="truncate">{item.name}</span>,
    [],
  );

  return (
    <Autocomplete<PersonItem>
      items={results}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item.name)}
      getItemKey={(item) => item.id}
      getItemIcon={renderIcon}
      renderItem={renderItem}
      placeholder="Type at least 2 characters…"
      loading={loading}
    />
  );
}

export const Async: Story = {
  render: () => <AsyncDemo />,
};

function EmptyStateDemo(): ReactElement {
  const [value, setValue] = useState("zzz");
  const items = useMemo(
    () => filterByQuery(FRUITS, value, (s) => s),
    [value],
  );

  return (
    <Autocomplete<string>
      items={items}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item)}
      getItemKey={(item) => item}
      renderItem={(item) => <span>{item}</span>}
      placeholder="Search fruits…"
      emptyContent="No fruits matched your query."
      defaultOpen
    />
  );
}

export const EmptyState: Story = {
  render: () => <EmptyStateDemo />,
};

const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Brazil","Bulgaria","Canada","Chile","Colombia","Croatia",
  "Czechia","Denmark","Egypt","Estonia","Finland","France","Germany","Greece","Hungary","Iceland",
  "India","Indonesia","Ireland","Israel","Italy","Japan","Kenya","Latvia","Lithuania","Luxembourg",
  "Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines",
  "Poland","Portugal","Qatar","Romania","Saudi Arabia","Singapore","Slovakia","Slovenia","South Africa","South Korea",
  "Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Vietnam",
];

function LongListDemo(): ReactElement {
  const [value, setValue] = useState("");
  const items = useMemo(
    () => filterByQuery(COUNTRIES, value, (s) => s),
    [value],
  );

  const renderIcon = useCallback(() => <IconMapPin className={ICON_CLASS_NAME} />, []);
  const renderItem = useCallback(
    (item: string) => <span className="truncate">{item}</span>,
    [],
  );

  return (
    <Autocomplete<string>
      items={items}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item)}
      getItemKey={(item) => item}
      getItemIcon={renderIcon}
      renderItem={renderItem}
      placeholder="Search countries…"
    />
  );
}

export const LongList: Story = {
  render: () => <LongListDemo />,
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
  const [value, setValue] = useState("");
  const items = useMemo(
    () => filterByQuery(FRUITS, value, (s) => s),
    [value],
  );

  return (
    <Autocomplete<string>
      items={items}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item)}
      getItemKey={(item) => item}
      renderItem={(item) => <span>{item}</span>}
      placeholder="Search fruits…"
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
  const [value, setValue] = useState("");
  const items = useMemo(
    () => filterByQuery(FRUITS, value, (s) => s),
    [value],
  );

  return (
    <Autocomplete<string>
      items={items}
      value={value}
      onChange={setValue}
      onSelect={(item) => setValue(item)}
      getItemKey={(item) => item}
      renderItem={(item) => <span>{item}</span>}
      placeholder="Search fruits…"
      variant={variant}
    />
  );
}

export const Variants: Story = {
  render: () => <VariantsDemo />,
};

function InModalDemo(): ReactElement {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [picked, setPicked] = useState<PersonItem | null>(null);
  const items = useMemo(
    () => filterByQuery(PEOPLE, value, (p) => `${p.name} ${p.email}`),
    [value],
  );

  const renderIcon = useCallback(() => <IconUser className={ICON_CLASS_NAME} />, []);
  const renderItem = useCallback(
    (item: PersonItem) => (
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
        <span className="truncate font-medium">{item.name}</span>
        <span className="truncate text-xs text-neutral-500">{item.email}</span>
      </span>
    ),
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setOpen(true)}>Open modal with autocomplete</Button>
      <Modal
        title="Add a collaborator"
        open={open}
        onStateChange={setOpen}
        onCancel={() => setOpen(false)}
      >
        <div className="flex w-full flex-col gap-3 p-3">
          <Autocomplete<PersonItem>
            items={items}
            value={value}
            onChange={setValue}
            onSelect={(item) => {
              setValue(item.name);
              setPicked(item);
            }}
            getItemKey={(item) => item.id}
            getItemIcon={renderIcon}
            renderItem={renderItem}
            placeholder="Search people…"
          />
          {picked && (
            <div className="text-sm">
              Picked: <span className="font-medium">{picked.name}</span>{" "}
              <span className="text-neutral-500">({picked.email})</span>
            </div>
          )}
          <div className="text-xs text-neutral-500">
            Demonstrates Autocomplete inside `Modal`: the popup escapes the
            modal via Portal, positions against the input, and item clicks
            select correctly without dismissing the modal.
          </div>
          <div className="flex flex-row gap-2 opacity-50">
            <IconBuilding className={ICON_CLASS_NAME} />
            <IconWorld className={ICON_CLASS_NAME} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const InModal: Story = {
  render: () => <InModalDemo />,
};
