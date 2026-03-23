import { readFileSync } from "node:fs";
import { IconShoppingBag } from "@tabler/icons-react";
import { DropdownMenu } from "radix-ui";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { Select } from "../floating/select";
import { SelectTree } from "../floating/select-tree";
import { Size, Variant } from "../types";
import { NestedParentProvider } from "./context";
import { NestedCheckbox } from "./checkbox";
import { NestedRadio } from "./radio";
import { NestedSelect } from "./select";
import { NestedParent } from "./types";

function renderWithDropdownParent(node: ReactNode): string {
  return renderToStaticMarkup(
    <DropdownMenu.Root open>
      <DropdownMenu.Content>
        <NestedParentProvider value={NestedParent.Dropdown}>{node}</NestedParentProvider>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
}

describe("icon alignment class contracts", () => {
  it("defines shared icon sizing/slot classes in styles.css", () => {
    const css = readFileSync(new URL("../../public/styles.css", import.meta.url), "utf-8");

    expect(css).toContain(".icon-standard");
    expect(css).toContain("@apply block h-3/5 w-3/5 shrink-0;");
    expect(css).toContain(".icon-slot");
    expect(css).toContain("@apply [&_svg]:block [&_svg]:h-3/5 [&_svg]:w-3/5 [&_svg]:shrink-0;");
  });

  it("uses icon-slot for nested radio indicators (default + custom icon)", () => {
    const html = renderWithDropdownParent(
      <NestedRadio
        value="marketplace"
        options={[
          {
            value: "dashboard",
            label: "Dashboard",
          },
          {
            value: "marketplace",
            label: "Marketplace",
            icon: <IconShoppingBag className="aspect-square h-3/5" />,
          },
        ]}
      />,
    );

    expect(html).toContain("icon-slot");
    expect(html).toContain("icon-standard");
    expect(html).toContain("aspect-square h-3/5");
  });

  it("uses icon-slot for nested select indicators", () => {
    const html = renderWithDropdownParent(
      <NestedSelect
        values={["marketplace"]}
        options={[
          { value: "dashboard", label: "Dashboard" },
          {
            value: "marketplace",
            label: "Marketplace",
            icon: <IconShoppingBag className="aspect-square h-3/5" />,
          },
        ]}
      />,
    );

    expect(html).toContain("icon-slot");
    expect(html).toContain("icon-standard");
  });

  it("uses icon-slot for nested checkbox indicators", () => {
    const html = renderWithDropdownParent(<NestedCheckbox value label="Enabled" />);
    expect(html).toContain("icon-slot");
    expect(html).toContain("icon-standard");
  });

  it("uses icon-slot in select trigger icon rendering", () => {
    const html = renderToStaticMarkup(
      <Select
        size={Size.Sm}
        variant={Variant.Default}
        label="Example"
        value="marketplace"
        onChange={() => undefined}
        options={[
          {
            value: "marketplace",
            label: "Marketplace",
            icon: <IconShoppingBag className="aspect-square h-3/5" />,
          },
        ]}
      />,
    );

    expect(html).toContain("icon-slot");
  });

  it("uses icon-slot in select-tree trigger icon rendering", () => {
    const html = renderToStaticMarkup(
      <SelectTree
        size={Size.Sm}
        variant={Variant.Default}
        label="Tracks"
        value={["group:1/track:1"]}
        onChange={() => undefined}
        options={[
          {
            value: "group:1",
            label: "Group",
            icon: <IconShoppingBag className="aspect-square h-3/5" />,
            children: [
              {
                value: "group:1/track:1",
                label: "Track",
                icon: <IconShoppingBag className="aspect-square h-3/5" />,
              },
            ],
          },
        ]}
      />,
    );

    expect(html).toContain("icon-slot");
  });
});
