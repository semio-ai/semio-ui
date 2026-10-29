import { useState, type ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ICON_CLASS_NAME,
  TabbedModal,
  type TabbedModalProps,
  type TabChild,
  Variant,
} from "@semio/ui";
import { IconBell, IconCode, IconPalette, IconShield, IconUser } from "@tabler/icons-react";

const meta: Meta<typeof TabbedModal> = {
  component: TabbedModal,
  title: "ui/TabbedModal",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TabbedModal>;

const settingsTabs: TabChild[] = [
  {
    key: "profile",
    title: "Profile",
    icon: <IconUser className={ICON_CLASS_NAME} />,
    variant: Variant.Primary,
    content: (
      <div className="flex flex-col gap-2 p-3">
        <h3 className="font-medium">Profile information</h3>
        <p className="text-sm text-neutral-500">
          Update your name, email, and avatar. These show up wherever your account appears across
          the studio.
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
      <div className="flex flex-col gap-2 p-3">
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
      <div className="flex flex-col gap-2 p-3">
        <h3 className="font-medium">Notifications</h3>
        <p className="text-sm text-neutral-500">
          Choose which events trigger toasts, emails, or both.
        </p>
      </div>
    ),
  },
  {
    key: "advanced",
    title: "Advanced",
    icon: <IconCode className={ICON_CLASS_NAME} />,
    variant: Variant.Warning,
    content: (
      <div className="flex flex-col gap-2 p-3">
        <h3 className="font-medium">Advanced</h3>
        <p className="text-sm text-neutral-500">
          Power-user options. Changes here can break things — proceed with care.
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
      <div className="flex flex-col gap-2 p-3">
        <h3 className="font-medium">Security</h3>
        <p className="text-sm text-neutral-500">
          Two-factor auth, active sessions, and connected devices.
        </p>
      </div>
    ),
  },
];

function TabbedModalRenderer(
  props: Omit<TabbedModalProps, "open" | "onStateChange" | "selected" | "onTabChange"> & {
    initialSelected?: string;
  },
): ReactElement {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(
    props.initialSelected ?? props.children[0]?.key,
  );

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={props.variant ?? Variant.Primary}>
        Open tabbed modal
      </Button>
      <TabbedModal
        {...props}
        open={open}
        onStateChange={setOpen}
        selected={selected}
        onTabChange={setSelected}
        onSubmit={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
    >
      {settingsTabs.slice(0, 3)}
    </TabbedModalRenderer>
  ),
};

export const Primary: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Primary}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const Secondary: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Secondary}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const Tertiary: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Tertiary}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const Info: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Info}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const Success: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Success}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const Warning: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Warning}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const Error: Story = {
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Configure your studio preferences."
      submitText="Save"
      variant={Variant.Error}
    >
      {settingsTabs.slice(0, 4)}
    </TabbedModalRenderer>
  ),
};

export const ManyTabs: Story = {
  name: "Many tabs (scrolls horizontally)",
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Tabs scroll horizontally when they exceed the modal's width."
      submitText="Save"
      variant={Variant.Primary}
    >
      {[
        ...settingsTabs,
        ...settingsTabs.map((tab) => ({
          ...tab,
          key: `${tab.key}-2`,
          title: `${tab.title} (alt)`,
        })),
      ]}
    </TabbedModalRenderer>
  ),
};

export const NoTabs: Story = {
  name: "Empty (placeholder)",
  render: () => (
    <TabbedModalRenderer
      title="Settings"
      description="Falls back to a placeholder tab when no tabs are provided."
      submitText="Save"
      variant={Variant.Primary}
    >
      {[]}
    </TabbedModalRenderer>
  ),
};
