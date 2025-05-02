import { ReactNode } from "react";
import type { ConfiguredNestedChild } from "./types";
import { NestedCheckbox } from "./checkbox";
import { NestedItem } from "./item";
import { NestedLabel } from "./label";
import { NestedMenu } from "./menu";
import { NestedRadio } from "./radio";
import { NestedSelect } from "./select";
import { NestedSeparator } from "./separator";

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
  }
}
