import { ReactNode } from "react";
import type { ConfiguredNestedChild } from "./types";
import { NestedCheckbox } from "./checkbox";
import { NestedItem } from "./item";
import { NestedLabel } from "./label";
import { NestedMenu } from "./menu";
import { NestedRadio } from "./radio";
import { NestedSelect } from "./select";
import { NestedSeparator } from "./separator";
import { NestedStatic } from "./static";

/**
 * A component that renders any of the major nested elements in an abstracted way.
 *
 * @param props - The props for the NestedChild component ({@link ConfiguredNestedChild}).
 * @returns The rendered NestedChild component.
 */
export function NestedChild(props: ConfiguredNestedChild): ReactNode {
  if (props.type === "menu") {
    const { children, ...nestedMenuProps } = props;
    return (
      <NestedMenu {...nestedMenuProps}>
        {children.map((child) => (
          <NestedChild key={child.id} {...child} />
        ))}
      </NestedMenu>
    );
  }

  switch (props.type) {
    case "checkbox":
      return <NestedCheckbox {...props} />;
    case "item":
      return <NestedItem {...props} />;
    case "label":
      return <NestedLabel {...props} />;
    case "radio":
      return <NestedRadio {...props} />;
    case "select":
      return <NestedSelect {...props} />;
    case "separator":
      return <NestedSeparator {...props} />;
    case "static":
      return <NestedStatic {...props} />;
  }
}
