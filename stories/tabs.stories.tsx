import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Button, ICON_CLASS_NAME, Size, Tabs, type TabsProps, Variant } from "@semio/ui";
import {
  IconBolt,
  IconHeart,
  IconHome,
  IconSettings,
  IconStar,
  IconUser,
} from "@tabler/icons-react";

const meta: Meta<typeof TabRenderer> = {
  component: TabRenderer,
  title: "ui/Tabs",
};

export default meta;

type Story = StoryObj<typeof TabRenderer>;

interface TabRendererProps {
  tabs: TabsProps["children"];
  selected: TabsProps["selected"];
  onTabChange: TabsProps["onTabChange"];
  visuals?: TabsProps["visuals"];
  size?: TabsProps["size"];
  leftWidget?: TabsProps["leftWidget"];
  rightWidget?: TabsProps["rightWidget"];
}

function TabRenderer({
  tabs,
  selected,
  onTabChange,
  visuals,
  size,
  leftWidget,
  rightWidget,
}: TabRendererProps): ReactNode {
  const [selectedTab, setSelectedTab] = useState<string | undefined>(selected);
  const handleTabChange = (key: string): void => {
    setSelectedTab(key);
    onTabChange(key);
  };

  return (
    <div className="w-160 p-4">
      <Tabs
        selected={selectedTab}
        onTabChange={handleTabChange}
        visuals={visuals}
        size={size}
        leftWidget={leftWidget}
        rightWidget={rightWidget}
      >
        {tabs}
      </Tabs>
    </div>
  );
}

const labelOnlyTabs: TabsProps["children"] = [
  { key: "first", title: "First Tab", content: "This is the first tab" },
  { key: "second", title: "Second Tab", content: "This is the second tab" },
  { key: "third", title: "Third Tab", content: "This is the third tab" },
  { key: "fourth", title: "Fourth Tab", content: "This is the fourth tab" },
  { key: "fifth", title: "Fifth Tab", content: "This is the fifth tab" },
];

const iconTabs: TabsProps["children"] = [
  {
    key: "home",
    title: "Home",
    icon: <IconHome className={ICON_CLASS_NAME} />,
    content: "Home content",
  },
  {
    key: "profile",
    title: "Profile",
    icon: <IconUser className={ICON_CLASS_NAME} />,
    content: "Profile content",
  },
  {
    key: "favorites",
    title: "Favorites",
    icon: <IconHeart className={ICON_CLASS_NAME} />,
    content: "Favorites content",
  },
  {
    key: "starred",
    title: "Starred",
    icon: <IconStar className={ICON_CLASS_NAME} />,
    content: "Starred content",
  },
];

const variantTabs: TabsProps["children"] = [
  {
    key: "default",
    title: "Default",
    icon: <IconHome className={ICON_CLASS_NAME} />,
    content: "Default variant content",
  },
  {
    key: "primary",
    title: "Primary",
    variant: Variant.Primary,
    icon: <IconBolt className={ICON_CLASS_NAME} />,
    content: "Primary variant content",
  },
  {
    key: "success",
    title: "Success",
    variant: Variant.Success,
    icon: <IconStar className={ICON_CLASS_NAME} />,
    content: "Success variant content",
  },
  {
    key: "warning",
    title: "Warning",
    variant: Variant.Warning,
    icon: <IconHeart className={ICON_CLASS_NAME} />,
    content: "Warning variant content",
  },
];

export const LabelsAndIcons: Story = {
  args: {
    tabs: iconTabs,
    selected: "home",
    visuals: "both",
    onTabChange: (key) => console.log(key),
  },
  name: "Labels + Icons (default)",
};

export const LabelsOnly: Story = {
  args: {
    tabs: labelOnlyTabs,
    selected: "first",
    visuals: "labels",
    onTabChange: (key) => console.log(key),
  },
};

export const IconsOnly: Story = {
  args: {
    tabs: iconTabs,
    selected: "home",
    visuals: "icons",
    onTabChange: (key) => console.log(key),
  },
};

export const VariantsPerTab: Story = {
  args: {
    tabs: variantTabs,
    selected: "default",
    visuals: "both",
    onTabChange: (key) => console.log(key),
  },
  name: "Per-tab Variants",
};

export const WithWidgets: Story = {
  args: {
    tabs: iconTabs,
    selected: "home",
    visuals: "both",
    leftWidget: <IconSettings className={ICON_CLASS_NAME} />,
    rightWidget: <Button size={Size.Sm}>Add</Button>,
    onTabChange: (key) => console.log(key),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {[Size.Xs, Size.Sm, Size.Md, Size.Lg].map((size) => (
        <div key={size}>
          <div className="mb-1 text-xs text-neutral-500">{size}</div>
          <SizedTabs size={size} />
        </div>
      ))}
    </div>
  ),
  name: "Sizes",
};

function SizedTabs({ size }: { size: Size }): ReactNode {
  const [selected, setSelected] = useState<string | undefined>("home");
  return (
    <div className="w-xl">
      <Tabs size={size} selected={selected} onTabChange={setSelected} visuals="both">
        {iconTabs}
      </Tabs>
    </div>
  );
}

export const ManyTabs: Story = {
  args: {
    tabs: [
      ...labelOnlyTabs,
      { key: "sixth", title: "Sixth", content: "Sixth content" },
      { key: "seventh", title: "Seventh", content: "Seventh content" },
      { key: "eighth", title: "Eighth", content: "Eighth content" },
    ],
    selected: "first",
    visuals: "labels",
    onTabChange: (key) => console.log(key),
  },
  name: "Many Tabs (long row)",
};
