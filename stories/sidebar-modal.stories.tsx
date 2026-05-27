import { useState, type ReactElement, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ICON_CLASS_NAME,
  SidebarModal,
  type SidebarTab,
  Variant,
} from "@semio/ui";
import {
  IconBell,
  IconKey,
  IconPalette,
  IconSettings,
  IconShield,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";

const meta: Meta = {
  title: "ui/SidebarModal",
  component: SidebarModal,
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const settingsTabs: SidebarTab[] = [
  {
    key: "profile",
    title: "Profile",
    icon: <IconUser className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Profile information</h3>
        <p className="text-sm text-neutral-500">
          Update your name, email, and avatar. These show up wherever your
          account appears across the studio.
        </p>
      </div>
    ),
  },
  {
    key: "appearance",
    title: "Appearance",
    icon: <IconPalette className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Appearance</h3>
        <p className="text-sm text-neutral-500">
          Pick light or dark mode and configure accent colors.
        </p>
      </div>
    ),
  },
  {
    key: "notifications",
    title: "Notifications",
    icon: <IconBell className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Notifications</h3>
        <p className="text-sm text-neutral-500">
          Choose which events trigger toasts, emails, or both.
        </p>
      </div>
    ),
  },
  {
    key: "security",
    title: "Security",
    icon: <IconShield className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Security</h3>
        <p className="text-sm text-neutral-500">
          Two-factor auth, active sessions, and connected devices.
        </p>
      </div>
    ),
    contentFooter: (
      <div className="flex justify-end gap-2">
        <Button variant={Variant.Default}>Cancel</Button>
        <Button variant={Variant.Primary}>Save changes</Button>
      </div>
    ),
  },
  {
    key: "api-keys",
    title: "API Keys",
    icon: <IconKey className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">API keys</h3>
        <p className="text-sm text-neutral-500">
          Issue, rotate, and revoke API keys for the studio CLI and SDKs.
        </p>
      </div>
    ),
  },
  {
    key: "language",
    title: "Language & Region",
    icon: <IconWorld className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Language & Region</h3>
        <p className="text-sm text-neutral-500">
          Change the locale used for dates, numbers, and translated copy.
        </p>
      </div>
    ),
  },
];

function SidebarModalDemo({
  tabs,
  title,
  sidebarFooter,
  collapsedIcon,
  variant,
}: {
  tabs: SidebarTab[];
  title: ReactNode;
  sidebarFooter?: ReactNode;
  collapsedIcon?: ReactNode;
  variant?: Variant;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(tabs[0]?.key);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={variant ?? Variant.Primary}>
        Open settings
      </Button>
      <SidebarModal
        open={open}
        onStateChange={setOpen}
        title={title}
        tabs={tabs}
        selected={selected}
        onTabChange={setSelected}
        sidebarFooter={sidebarFooter}
        collapsedIcon={collapsedIcon}
        variant={variant}
      />
    </>
  );
}

const settingsCollapsedIcon = <IconSettings className={ICON_CLASS_NAME} />;

export const Basic: Story = {
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={settingsTabs.slice(0, 3)}
      collapsedIcon={settingsCollapsedIcon}
    />
  ),
};

export const WithContentFooter: Story = {
  name: "With per-tab content footer",
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={settingsTabs}
      collapsedIcon={settingsCollapsedIcon}
    />
  ),
};

export const WithSidebarFooter: Story = {
  name: "With modal-level sidebar footer",
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={settingsTabs}
      collapsedIcon={settingsCollapsedIcon}
      sidebarFooter={
        <div className="flex flex-col gap-1 text-xs text-neutral-500">
          <span>Studio v1.4.2</span>
          <button type="button" className="text-left underline">
            Sign out
          </button>
        </div>
      }
    />
  ),
};

export const ManyTabs: Story = {
  name: "Many tabs (sidebar scrolls)",
  render: () => {
    const lots: SidebarTab[] = [
      ...settingsTabs,
      ...settingsTabs.map((tab) => ({ ...tab, key: `${tab.key}-2`, title: `${tab.title} (alt)` })),
      ...settingsTabs.map((tab) => ({ ...tab, key: `${tab.key}-3`, title: `${tab.title} (extras)` })),
    ];
    return (
      <SidebarModalDemo
        title="Settings"
        tabs={lots}
        collapsedIcon={settingsCollapsedIcon}
        sidebarFooter={
          <div className="text-xs text-neutral-500">Studio v1.4.2</div>
        }
      />
    );
  },
};

export const CollapsedIconSwap: Story = {
  name: "Collapsed icon swap (right-click sidebar to collapse)",
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={settingsTabs}
      collapsedIcon={settingsCollapsedIcon}
      sidebarFooter={
        <div className="text-xs text-neutral-500">Studio v1.4.2</div>
      }
    />
  ),
};

export const NoTabs: Story = {
  name: "Empty (placeholder)",
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={[]}
      collapsedIcon={settingsCollapsedIcon}
    />
  ),
};

export const VariantPrimary: Story = {
  name: "Variant: Primary",
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={settingsTabs.slice(0, 4)}
      collapsedIcon={settingsCollapsedIcon}
      variant={Variant.Primary}
    />
  ),
};

export const VariantSuccess: Story = {
  name: "Variant: Success",
  render: () => (
    <SidebarModalDemo
      title="Settings"
      tabs={settingsTabs.slice(0, 4)}
      collapsedIcon={settingsCollapsedIcon}
      variant={Variant.Success}
    />
  ),
};
