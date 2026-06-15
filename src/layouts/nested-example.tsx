import { IconArrowBigDown, IconArrowBigUp, IconCommand } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { NestedMenu } from "../nested-elements/menu";
import { NestedLabel } from "../nested-elements/label";
import { NestedItem } from "../nested-elements/item";
import { NestedRadio } from "../nested-elements/radio";
import { NestedSeparator } from "../nested-elements/separator";
import { NestedCheckbox } from "../nested-elements/checkbox";
import { NestedSelect } from "../nested-elements/select";
import { Theme, Variant } from "../types";
import { Icon } from "../icons/registry";

export function NestedExample(): ReactNode {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(Theme.System);
  const [partyTime, setPartyTime] = useState<boolean>(false);
  const [inventory, setInventory] = useState<string[]>([]);

  return (
    <>
      <NestedItem
        left={<Icon name="arrow-up" />}
        right={
          <div className="flex h-5 flex-row items-center justify-end gap-0">
            <IconCommand className="h-3 w-3" />
            <IconArrowBigUp className="h-3 w-3" />
          </div>
        }
      >
        Item 1
      </NestedItem>
      <NestedItem
        left={<Icon name="arrow-down" />}
        right={
          <div className="flex h-5 flex-row items-center justify-end gap-0">
            <IconCommand className="h-3 w-3" />
            <IconArrowBigDown className="h-3 w-3" />
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
            icon: <Icon name="sun" />,
            color: "#F99600",
          },
          {
            value: "dark",
            label: "Dark",
            icon: <Icon name="moon" />,
            variant: Variant.Tertiary,
          },
          {
            value: "system",
            label: "System",
            icon: <Icon name="sun-moon" />,
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
              icon: <Icon name="chef-hat" />,
              color: "#ee44ee",
            },
            {
              value: "coat",
              label: "Coat",
              icon: <Icon name="jacket" />,
            },
            {
              value: "glasses",
              label: "Glasses",
              icon: <Icon name="sunglasses" />,
              variant: Variant.Success,
            },
            {
              value: "shoes",
              label: "Shoes",
              icon: <Icon name="shoe" />,
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
