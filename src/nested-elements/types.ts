import type { ReactNode, MouseEvent } from "react";
import { RawColor } from "@semio/utils";
import { Variant } from "../types";

/**
 * Types of nested parent components.
 *
 * Includes Context and Dropdown parents
 */
export enum NestedParent {
  /**
   * Parent is a context component.
   */
  Context = "context",

  /**
   * Parent is a dropdown component.
   */
  Dropdown = "dropdown",
}

/**
 * @prop value: The value of the checkbox.
 * @prop label: The label for the checkbox.
 * @prop variant: The variant of the checkbox. Defaults to {@link Variant.Default}
 * @prop onChange: The function to call when the checkbox changes.
 * @prop closeOnSelect: Whether toggling the item closes the menu (defaults to true).
 * @prop color: The color of the checkbox. Overridees styling from variants.
 * @prop disabled: Whether the checkbox is disabled.
 * @prop icon: The icon to display next to the checkbox.
 */
export interface NestedCheckboxProps {
  value: boolean;
  label: string;
  variant?: Variant;
  onChange?: (value: boolean) => void;
  closeOnSelect?: boolean;
  color?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

/**
 * @prop value: The color in either {@link RawColor or string format}.
 * @prop onChange: The function to call when the color changes.
 * @prop disabled: Whether the color picker is disabled.
 * @prop label: The label for the color picker.
 * @prop variant: The variant of the color picker. Defaults to {@link Variant.Default}
 */
export interface NestedColorPickerProps<T extends string | RawColor> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  label?: string;
  variant?: Variant;
  left?: ReactNode;
}

/**
 * @prop left: The left-side icon or element.
 * @prop children: The content of the item (usually text).
 * @prop right: The right-side icon or element.
 * @prop variant: The variant of the menu item. Defaults to {@link Variant.Default}
 * @prop disabled: Whether the menu is disabled.
 * @prop onClick: The function to call when the item is clicked.
 * @prop closeOnSelect: Whether selecting the item closes the menu (defaults to true).
 */
export interface NestedItemProps {
  left?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  closeOnSelect?: boolean;
  /** Test ID for E2E targeting of portal-rendered dropdown items. */
  testId?: string;
}

/**
 * @prop children: The content of the element.
 * @prop className: The class name for the wrapper of the element.
 */
export interface NestedStaticProps {
  children: ReactNode;
  className?: string;
}

/**
 * @prop children: The content of the label.
 * @prop className: The class name for the label.
 */
export interface NestedLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * @prop left: The left-side icon or element.
 * @prop children: The content of the menu item.
 * @prop label: The label for the menu.
 * @prop variant: The variant of the menu item. Defaults to {@link Variant.Default}
 * @prop disabled: Whether the menu is disabled.
 * @prop hideHeader: Whether to hide the header of the menu.
 */
export interface NestedMenuProps {
  left?: ReactNode;
  children: ReactNode;
  label?: string;
  variant?: Variant;
  disabled?: boolean;
  hideHeader?: boolean;
}

/**
 * @prop label: [string] The label for the option
 * @prop value: [string] The value for the option. This should match the value specified.
 * @prop disabled: [boolean] Whether the option is disabled.
 * @prop closeOnSelect: [boolean] Have the menu close after selecting this option
 * @prop variant: [Variant] The variant of the option. Defaults to {@link Variant.Default}
 * @prop color: [string] The color of the option. Overrides styling from variants.
 * @prop icon: [ReactNode] The icon to display next to the option.
 */
export interface NestedOption {
  label: string;
  value: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  variant?: Variant;
  color?: string;
  icon?: ReactNode;
}

/**
 * @prop variant: The variant of the radio collection. Defaults to {@link Variant.Default}
 * @prop disabled: Whether the radio collection is disabled.
 * @prop onChange: The function to call when the radio collection changes.
 * @prop value: The value of the radio collection.
 * @prop options: The options for the radio collection (see {@link NestedOption}).
 */
export interface NestedRadioProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  options: NestedOption[];
}

/**
 * @prop variant: The variant of the select collection. Defaults to {@link Variant.Default}
 * @prop disabled: Whether the select collection is disabled.
 * @prop onChange: The function to call when the select collection changes.
 * @prop values: The values of the select collection.
 * @prop options: The options for the select collection (see {@link NestedOption}).
 */
export interface NestedSelectProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  values: string[];
  options: NestedOption[];
}

/**
 * @prop variant: The variant of the separator. Defaults to {@link Variant.Default}
 */
export interface NestedSeparatorProps {
  variant?: Variant;
}

export type ConfiguredNestedMenu = Omit<NestedMenuProps, "children"> & {
  id: string;
  children: ConfiguredNestedChild[];
};

export type ConfiguredNestedChild =
  | (NestedCheckboxProps & { type: "checkbox"; id: string })
  | (NestedItemProps & { type: "item"; id: string })
  | (NestedLabelProps & { type: "label"; id: string })
  | (ConfiguredNestedMenu & { type: "menu"; children: ConfiguredNestedChild[] })
  | (NestedRadioProps & { type: "radio"; id: string })
  | (NestedSelectProps & { type: "select"; id: string })
  | (NestedSeparatorProps & { type: "separator"; id: string })
  | (NestedStaticProps & { type: "static"; id: string });
