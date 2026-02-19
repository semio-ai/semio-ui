import {
  NestedLabel,
  NestedSeparator,
  NestedItem,
  NestedRadio,
  Theme,
  NestedMenu,
  Variant,
  NestedSelect,
  NestedCheckbox,
  ICON_CLASS_NAME,
} from "@semio/ui";
import {
  IconArrowBigDown,
  IconArrowBigUp,
  IconArrowDown,
  IconArrowUp,
  IconChefHat,
  IconCommand,
  IconJacket,
  IconMoon,
  IconShoe,
  IconSun,
  IconSunglasses,
  IconSunMoon,
} from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

export function NestedExample(): ReactNode {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(Theme.System);
  const [partyTime, setPartyTime] = useState<boolean>(false);
  const [inventory, setInventory] = useState<string[]>([]);

  return (
    <>
      <NestedLabel>Title 1</NestedLabel>
      <NestedItem
        left={<IconArrowUp className={ICON_CLASS_NAME} />}
        right={
          <div className="flex flex-row items-center justify-end gap-0 h-5">
            <IconCommand className="w-3 h-3" />
            <IconArrowBigUp className="w-3 h-3" />
          </div>
        }
      >
        Item 1
      </NestedItem>
      <NestedItem
        left={<IconArrowDown className={ICON_CLASS_NAME} />}
        right={
          <div className="flex flex-row items-center justify-end gap-0 h-5">
            <IconCommand className="w-3 h-3" />
            <IconArrowBigDown className="w-3 h-3" />
          </div>
        }
      >
        Item 2
      </NestedItem>
      <NestedSeparator />
      <NestedLabel>Theme ({selectedTheme})</NestedLabel>
      <NestedRadio
        value={selectedTheme}
        options={[
          {
            value: "light",
            label: "Light",
            icon: <IconSun className="h-3/5 w-3/5" />,
            color: "#F99600",
          },
          {
            value: "dark",
            label: "Dark",
            icon: <IconMoon className="h-3/5 w-3/5" />,
            variant: Variant.Tertiary,
          },
          {
            value: "system",
            label: "System",
            icon: <IconSunMoon className="h-3/5 w-3/5" />,
          },
        ]}
        onChange={(value) => setSelectedTheme(value as Theme)}
      />
      <NestedSeparator />
      <NestedMenu label="More...">
        <NestedSelect
          values={inventory}
          onChange={(v) => setInventory(v)}
          options={[
            {
              value: "hat",
              label: "Hat",
              icon: <IconChefHat className="h-3/5 w-3/5" />,
              color: "#ee44ee",
            },
            {
              value: "coat",
              label: "Coat",
              icon: <IconJacket className="h-3/5 w-3/5" />,
            },
            {
              value: "glasses",
              label: "Glasses",
              icon: <IconSunglasses className="h-3/5 w-3/5" />,
              variant: Variant.Success,
            },
            {
              value: "shoes",
              label: "Shoes",
              icon: <IconShoe className="h-3/5 w-3/5" />,
              variant: Variant.Primary,
            },
          ]}
        />
        <NestedSeparator />
        <NestedLabel>Something Else</NestedLabel>
        <NestedCheckbox value={partyTime} onChange={(v) => setPartyTime(v)} label="Party Time" />
      </NestedMenu>
    </>
  );
}
