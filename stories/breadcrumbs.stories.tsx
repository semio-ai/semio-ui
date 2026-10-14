import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BreadcrumbTrail, type BreadcrumbTrailItem } from "@semio/ui";

const meta: Meta<typeof BreadcrumbTrail> = {
  component: BreadcrumbTrail,
  title: "ui/Breadcrumbs",
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
        label: "Switch section",
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
        label: "Switch project",
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
          label: "Switch project",
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
          label: "Switch project",
          value: "a",
          options: [],
          emptyText: "No other projects available",
          onSelect: () => undefined,
        },
      },
    ],
  },
};
