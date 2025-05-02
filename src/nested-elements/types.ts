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

export interface NestedCheckboxProps {
  variant?: Variant;
  onChange?: (value: boolean) => void;
  value: boolean;
  label: string;
  color?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface NestedColorPickerProps<T extends string | RawColor> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  label?: string;
  variant?: Variant;
}

export interface NestedItemProps {
  left?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export interface NestedLabelProps {
  children: ReactNode;
  className?: string;
}

export interface NestedMenuProps {
  left?: ReactNode;
  children: ReactNode;
  label?: string;
  variant?: Variant;
  disabled?: boolean;
  hideHeader?: boolean;
}

export interface NestedOption {
  label: string;
  value: string;
  disabled?: boolean;
  variant?: Variant;
  color?: string;
  icon?: ReactNode;
}

export interface NestedRadioProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  options: NestedOption[];
}

export interface NestedSelectProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  values: string[];
  options: NestedOption[];
}

export interface NestedSeparatorProps {
  variant?: Variant;
}

export type ConfiguredNestedMenu = Omit<NestedMenuProps, "children"> & {
  id: string;
  children: ConfiguredNestedChild[];
};

export type ActionItem = ConfiguredNestedMenu;

export type ConfiguredNestedChild =
  | (NestedCheckboxProps & { type: "checkbox"; id: string })
  | (NestedItemProps & { type: "item"; id: string })
  | (NestedLabelProps & { type: "label"; id: string })
  | (ConfiguredNestedMenu & { type: "menu"; children: ConfiguredNestedChild[] })
  | (NestedRadioProps & { type: "radio"; id: string })
  | (NestedSelectProps & { type: "select"; id: string })
  | (NestedSeparatorProps & { type: "separator"; id: string });
