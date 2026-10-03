import type { ReactNode, MouseEvent } from "react";
import { RawColor } from "@semio/utils";
import { Variant } from "../types";
import type { IconValue } from "../icons/registry";

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
 * @prop closeOnSelect: Whether toggling the item closes the menu. Defaults to
 *   FALSE here — a checkbox in a menu is one toggle among several, so closing
 *   after each would make setting two of them take two trips. (`NestedItem` and
 *   `NestedRadio` default to true, where the click is the whole interaction.)
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
  icon?: IconValue;
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
  left?: IconValue;
}

/**
 * @prop left: The left-side icon or element.
 * @prop children: The content of the item (usually text).
 * @prop right: The right-side icon or element.
 * @prop variant: The variant of the menu item. Defaults to {@link Variant.Default}
 * @prop disabled: Whether the menu is disabled.
 * @prop onClick: The function to call when the item is clicked.
 * @prop closeOnSelect: Whether selecting the item closes the menu (defaults to true).
 * @prop description: Why the item is disabled, shown as a TOOLTIP — see below.
 */
export interface NestedItemProps {
  left?: IconValue;
  children: ReactNode;
  right?: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  closeOnSelect?: boolean;
  /**
   * Why this item is disabled, shown as a TOOLTIP on hover — the same contract as
   * {@link NestedOption.description}.
   *
   * **A tooltip, not a second line in the item**, for the reason given there: an
   * item that grows to hold prose stops matching the interactive rhythm of every
   * other row, and the label stays the thing the item is always called, whether or
   * not a reader ever hovers to find out why it is greyed out.
   *
   * Additive by construction: with no description the item renders byte-for-byte
   * as before, because `Tooltip` short-circuits when disabled rather than wrapping
   * the child in an armed trigger.
   */
  description?: string;
  /** Semantic color of the explanatory tooltip, independent of the row. */
  descriptionVariant?: Variant;
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
  left?: IconValue;
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
 * @prop closeOnSelect: [boolean] Have the menu close after choosing this
 *   option. The DEFAULT depends on the component this option is given to,
 *   because the same option shape serves a single-value and a multi-value
 *   control: `NestedRadio` closes (one value — picking it is the interaction),
 *   `NestedSelect` stays open (many values). Set it to override either.
 * @prop variant: [Variant] The variant of the option. Defaults to {@link Variant.Default}
 * @prop color: [string] The color of the option. Overrides styling from variants.
 * @prop icon: [ReactNode] The icon to display next to the option.
 * @prop description: [string] A tooltip on the option, saying what choosing it means.
 */
export interface NestedOption {
  label: string;
  value: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  variant?: Variant;
  color?: string;
  icon?: IconValue;
  /**
   * What choosing this option means, shown as a TOOLTIP on the option.
   *
   * **A tooltip, not a second line in the item**, and the distinction is the whole
   * design. An item that grows to hold prose stops matching the interactive rhythm
   * of every other row in the menu, and makes the menu size itself around
   * explanatory text rather than around its controls. Layering the explanation over
   * the option leaves the option exactly the control it already was.
   *
   * It is also **additive by construction**: with no description the option renders
   * byte-for-byte as before, because `Tooltip` short-circuits when disabled rather
   * than wrapping the child in an armed trigger.
   *
   * **An aid, never the only home for a fact.** It needs hover or focus, so it is
   * unreachable by a reader who does not go looking. Anything required to choose
   * correctly belongs in the label, or beside the control where it is always
   * visible; use this for the extra sentence that helps and is not load-bearing.
   */
  description?: string;
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
