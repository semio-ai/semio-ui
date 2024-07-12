import { type ReactNode } from "react";

export enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export enum Variant {
  Primary = "primary",
  Secondary = "secondary",
  Tertiary = "tertiary",
  Default = "default",
  Info = "info",
  Success = "success",
  Warning = "warning",
  Error = "error",
}

export enum Size {
  Xs = "xs",
  Sm = "sm",
  Md = "md",
  Lg = "lg",
}

/*
@description A configuration object for displaying time in the UI.
*/
export enum TimeDisplay {
  Frames = "frames",
  SecondsPlusMilliseconds = "seconds+milliseconds",
  MinutesPlusSecondsPlusMilliseconds = "minutes+seconds+milliseconds",
}

export enum NestedParent {
  Context = "context",
  Dropdown = "dropdown",
}
