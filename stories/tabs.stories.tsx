import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ReactNode } from "react";
import { Tabs, type TabsProps } from "@semio/ui";

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
}

function TabRenderer({ tabs, selected, onTabChange }: TabRendererProps): ReactNode {
  const [selectedTab, setSelectedTab] = useState<string | undefined>(selected);
  const handleTabChange = (key: string): void => {
    setSelectedTab(key);
    onTabChange(key);
  };

  return (
    <Tabs selected={selectedTab} onTabChange={handleTabChange}>
      {tabs}
    </Tabs>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    tabs: [
      {
        key: "first",
        title: "First Tab",
        content: "This is the first tab",
      },
      {
        key: "second",
        title: "Second Tab",
        content: "This is the second tab",
      },
      {
        key: "third",
        title: "Third Tab",
        content: "This is the third tab",
      },
      {
        key: "fourth",
        title: "Fourth Tab",
        content: "This is the fourth tab",
      },
      {
        key: "fifth",
        title: "Fifth Tab",
        content: "This is the fifth tab",
      },
    ],
    selected: "first",
    // eslint-disable-next-line no-console -- This is a storybook story
    onTabChange: (key) => console.log(key),
  },
  name: "Tabs",
};
