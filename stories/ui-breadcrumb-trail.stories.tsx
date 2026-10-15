import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BreadcrumbTrail, type BreadcrumbTrailItem } from "@semio/ui";

const meta: Meta<typeof BreadcrumbTrail> = {
  component: BreadcrumbTrail,
  title: "ui/BreadcrumbTrail",
  decorators: [
    (Story) => (
      <div className="variant-scope p-5">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof BreadcrumbTrail>;

function Example({ width }: { width?: number }) {
  const [section, setSection] = useState("Projects");
  const [project, setProject] = useState("a");
  const [name, setName] = useState("Robot demo");
  const [destination, setDestination] = useState("");
  const items: BreadcrumbTrailItem[] = [
    {
      id: "section",
      label: section,
      href: "#projects",
      onNavigate: () => setDestination("Projects listing"),
      switcher: {
        label: "Switch Section",
        value: section,
        options: ["Home", "Projects", "Assets", "Devices", "Organizations"].map((label) => ({
          value: label,
          label,
        })),
        onSelect: setSection,
      },
    },
  ];
  if (section === "Projects")
    items.push({
      id: "project",
      label: project === "a" ? name : "Shared project",
      onRename: setName,
      switcher: {
        label: "Switch Project",
        value: project,
        searchable: true,
        options: [
          { value: "a", label: `${name} · You`, icon: "project" },
          { value: "b", label: "Shared project · @team", icon: "project" },
        ],
        onSelect: setProject,
        browse: {
          icon: "project",
          label: "View all projects",
          onSelect: () => setDestination("Projects listing"),
        },
      },
    });
  return (
    <div style={{ width }} className="max-w-full">
      <div className="card-transparent flex h-10 min-w-0 items-center px-2">
        <BreadcrumbTrail items={items} />
      </div>
      <p className="mt-4 text-sm">
        Click to switch projects. Double-click the name, or choose Rename, to edit it.
      </p>
      {destination && <p role="status">Opened: {destination}</p>}
    </div>
  );
}
export const Default: Story = { render: () => <Example /> };
export const Mobile: Story = { render: () => <Example width={328} /> };
export const Loading: Story = {
  args: {
    items: [
      {
        id: "project",
        label: "Robot demo",
        switcher: {
          label: "Switch Project",
          value: "a",
          options: [],
          loading: true,
          searchable: true,
          onSelect: () => undefined,
        },
      },
    ],
  },
};
export const Empty: Story = {
  args: {
    items: [
      {
        id: "project",
        label: "Robot demo",
        switcher: {
          label: "Switch Project",
          value: "a",
          options: [],
          emptyText: "No other projects available",
          onSelect: () => undefined,
        },
      },
    ],
  },
};

function RenameExample({ splitSwitcher = false }: { splitSwitcher?: boolean }) {
  const [name, setName] = useState("Robot demo");
  return (
    <div className="space-y-4">
      <BreadcrumbTrail
        items={[
          {
            id: "project",
            label: name,
            labelWidth: splitSwitcher ? 112 : undefined,
            onRename: setName,
            switcher: splitSwitcher
              ? {
                  label: "Switch Project",
                  value: "current",
                  options: [{ value: "current", label: name }],
                  onSelect: () => undefined,
                  searchable: true,
                }
              : undefined,
          },
        ]}
      />
      <p className="text-sm">Focus the name and press F2 to rename. Enter saves; Escape cancels.</p>
    </div>
  );
}

export const RenameWithoutSwitcher: Story = { render: () => <RenameExample /> };
export const ReservedWidthEditableSwitcher: Story = {
  render: () => <RenameExample splitSwitcher />,
};
