import { clsx } from "clsx";
import { Size, Variant } from "./types";

export function getHeight(size?: Size): string {
  switch (size) {
    case Size.Xs:
      return "h-5";
    case Size.Sm:
      return "h-7";
    case Size.Md:
      return "h-8";
    case Size.Lg:
      return "h-10";
    default:
      return "h-8";
  }
}

export function getWidth(size?: Size): string {
  switch (size) {
    case Size.Xs:
      return "w-5";
    case Size.Sm:
      return "w-7";
    case Size.Md:
      return "w-8";
    case Size.Lg:
      return "w-10";
    default:
      return "w-8";
  }
}

export function getChipInsertSize(size?: Size): string {
  switch (size) {
    case Size.Xs:
      return "h-3 w-3";
    case Size.Sm:
      return "h-4 w-4";
    case Size.Md:
      return "h-5 w-5";
    case Size.Lg:
      return "h-7 w-7";
    default:
      return "h-5 w-5";
  }
}

export function getFontSize(size?: Size): string {
  switch (size) {
    case Size.Xs:
      return "text-[0.6rem]";
    case Size.Sm:
      return "text-xs";
    case Size.Md:
      return "text-base";
    case Size.Lg:
      return "text-xl";
    default:
      return "text-base";
  }
}

export function getBorder(variant?: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return "border-primary-500";
    case Variant.Secondary:
      return "border-secondary-500";
    case Variant.Tertiary:
      return "border-tertiary-500";
    case Variant.Error:
      return "border-error-500";
    case Variant.Warning:
      return "border-warning-500";
    case Variant.Success:
      return "border-success-500";
    case Variant.Info:
      return "border-info-500";
    case Variant.Default:
    default:
      return "border-default-500";
  }
}

export function getHoverBorder(variant?: Variant): string {
  const all = "border border-solid";
  switch (variant) {
    case Variant.Primary:
      return clsx(
        all,
        "hover:border-primary-50 dark:hover:border-primary-950 border-primary-500",
        "disabled:cursor-not-allowed disabled:border-primary-500/30 disabled:hover:border-primary-500/30",
      );
    case Variant.Secondary:
      return clsx(
        all,
        "hover:border-secondary-50 dark:hover:border-secondary-950 border-secondary-500",
        "disabled:cursor-not-allowed disabled:border-secondary-500/30 disabled:hover:border-secondary-500/30",
      );
    case Variant.Tertiary:
      return clsx(
        all,
        "hover:border-tertiary-50 dark:hover:border-tertiary-950 border-tertiary-500",
        "disabled:cursor-not-allowed disabled:border-tertiary-500/30 disabled:hover:border-tertiary-500/30",
      );
    case Variant.Error:
      return clsx(
        all,
        "hover:border-error-500 dark:hover:border-error-700 border-error-600",
        "disabled:cursor-not-allowed disabled:border-error-600/30 disabled:hover:border-error-6    00/30",
      );
    case Variant.Warning:
      return clsx(
        all,
        "hover:border-warning-500 dark:hover:border-warning-700 border-warning-600",
        "disabled:cursor-not-allowed disabled:border-warning-600/30 disabled:hover:border-warning-600/30",
      );
    case Variant.Success:
      return clsx(
        all,
        "hover:border-success-500 dark:hover:border-success-700 border-success-600",
        "disabled:cursor-not-allowed disabled:border-success-600/30 disabled:hover:border-success-600/30",
      );
    case Variant.Info:
      return clsx(
        all,
        "hover:border-info-50 dark:hover:border-info-950 border-info-500",
        "disabled:cursor-not-allowed disabled:border-info-500/30 disabled:hover:border-info-500/30",
      );
    case Variant.Default:
    default:
      return clsx(
        all,
        "hover:border-default-400 dark:hover:border-default-600 border-default-500",
        "disabled:cursor-not-allowed disabled:border-default-500/30 disabled:hover:border-default-500/30",
      );
  }
}

export function getReversibleBgText(variant?: Variant, active?: boolean): string {
  switch (variant) {
    case Variant.Primary:
      return `hover:bg-primary-500/75 text-primary-500 border-r-2 hover:border-primary-500 ${active ? "border-primary-500" : "border-transparent"}`;
    case Variant.Secondary:
      return `hover:bg-secondary-500/75 text-secondary-500 border-r-2 hover:border-secondary-500 ${active ? "border-secondary-500" : "border-transparent"}`;
    case Variant.Tertiary:
      return `hover:bg-tertiary-500/75 text-tertiary-500 border-r-2 hover:border-tertiary-500 ${active ? "border-tertiary-500" : "border-transparent"}`;
    case Variant.Error:
      return `hover:bg-error-500/75 text-error-500 border-r-2 hover:border-error-500 ${active ? "border-error-500" : "border-transparent"}`;
    case Variant.Warning:
      return `hover:bg-warning-500/75 text-warning-500 border-r-2 hover:border-warning-500 ${active ? "border-warning-500" : "border-transparent"}`;
    case Variant.Success:
      return `hover:bg-success-500/75 text-success-500 border-r-2 hover:border-success-500 ${active ? "border-success-500" : "border-transparent"}`;
    case Variant.Info:
      return `hover:bg-info-500/75 text-info-500 border-r-2 hover:border-info-500 ${active ? "border-info-500" : "border-transparent"}`;
    case Variant.Default:
    default:
      return `hover:bg-default-500/75 text-default-500 border-r-2 hover:border-default-500 ${active ? "border-default-500" : "border-transparent"}`;
  }
}

export function getItemSideStyle(variant?: Variant | "custom"): string {
  const all = clsx(
    "dark:group-data-highlighted:text-black group-data-highlighted:text-white",
    "group-data-disabled:text-neutral-500/50",
  );
  switch (variant) {
    case "custom":
      return clsx(
        all,
        "data-[state=checked]:text-(--text-color-75) data-[state=unchecked]:text-(--text-color-10)",
      );
    case Variant.Primary:
      return clsx(
        all,
        "dark:data-[state=checked]:text-primary-200/75 data-[state=checked]:text-primary-800/75",
        "dark:data-[state=unchecked]:text-primary-200/10 data-[state=unchecked]:text-primary-800/10",
      );
    case Variant.Secondary:
      return clsx(
        all,
        "dark:data-[state=checked]:text-secondary-200/75 data-[state=checked]:text-secondary-800/75",
        "dark:data-[state=unchecked]:text-secondary-200/10 data-[state=unchecked]:text-secondary-800/10",
      );
    case Variant.Tertiary:
      return clsx(
        all,
        "dark:data-[state=checked]:text-tertiary-200/75 data-[state=checked]:text-tertiary-800/75",
        "dark:data-[state=unchecked]:text-tertiary-200/10 data-[state=unchecked]:text-tertiary-800/10",
      );
    case Variant.Error:
      return clsx(
        all,
        "dark:data-[state=checked]:text-error-400/75 data-[state=checked]:text-error-600/75",
        "dark:data-[state=unchecked]:text-error-400/10 data-[state=unchecked]:text-error-600/10",
      );
    case Variant.Warning:
      return clsx(
        all,
        "dark:data-[state=checked]:text-warning-400/75 data-[state=checked]:text-warning-600/75",
        "dark:data-[state=unchecked]:text-warning-400/10 data-[state=unchecked]:text-warning-600/10",
      );
    case Variant.Success:
      return clsx(
        all,
        "dark:data-[state=checked]:text-success-400/75 data-[state=checked]:text-success-600/75",
        "dark:data-[state=unchecked]:text-success-400/10 data-[state=unchecked]:text-success-600/10",
      );
    case Variant.Info:
      return clsx(
        all,
        "dark:data-[state=checked]:text-info-200/75 data-[state=checked]:text-info-800/75",
        "dark:data-[state=unchecked]:text-info-200/10 data-[state=unchecked]:text-info-800/10",
      );
    case Variant.Default:
    default:
      return clsx(
        all,
        "dark:data-[state=checked]:text-default-200/75 data-[state=checked]:text-default-800/75",
        "dark:data-[state=unchecked]:text-default-200/10 data-[state=unchecked]:text-default-800/10",
      );
  }
}

export function getItemStyle(variant?: Variant | "custom"): string {
  const all = clsx(
    "cursor-pointer group dark:data-highlighted:text-black data-highlighted:text-white",
    "data-disabled:text-neutral-500/50",
  );
  switch (variant) {
    case "custom":
      return clsx(all, "text-(--text-color-75)", "data-highlighted:bg-(--text-color-50)");
    case Variant.Primary:
      return clsx(
        all,
        "dark:text-primary-200/75 text-primary-800/75",
        "dark:data-highlighted:bg-primary-200/50 data-highlighted:bg-primary-800/50",
      );
    case Variant.Secondary:
      return clsx(
        all,
        "dark:text-secondary-200/75 text-secondary-800/75",
        "dark:data-highlighted:bg-secondary-200/50 data-highlighted:bg-secondary-800/50",
      );
    case Variant.Tertiary:
      return clsx(
        all,
        "dark:text-tertiary-200/75 text-tertiary-800/75",
        "dark:data-highlighted:bg-tertiary-200/50 data-highlighted:bg-tertiary-800/50",
      );
    case Variant.Error:
      return clsx(
        all,
        "dark:text-error-400/75 text-error-600/75",
        "dark:data-highlighted:bg-error-400/50 data-highlighted:bg-error-600/50",
      );
    case Variant.Warning:
      return clsx(
        all,
        "dark:text-warning-400/75 text-warning-600/75",
        "dark:data-highlighted:bg-warning-400/50 data-highlighted:bg-warning-600/50",
      );
    case Variant.Success:
      return clsx(
        all,
        "dark:text-success-400/75 text-success-600/75",
        "dark:data-highlighted:bg-success-400/50 data-highlighted:bg-success-600/50",
      );
    case Variant.Info:
      return clsx(
        all,
        "dark:text-info-200/75 text-info-800/75",
        "dark:data-highlighted:bg-info-200/50 data-highlighted:bg-info-800/50",
      );
    case Variant.Default:
    default:
      return clsx(
        all,
        "dark:text-default-200/75 text-default-800/75",
        "dark:data-highlighted:bg-default-200/50 data-highlighted:bg-default-800/50",
      );
  }
}

export function getSeparatorStyle(variant?: Variant | "custom"): string {
  switch (variant) {
    case "custom":
      return "bg-(--separator-color)/75";
    case Variant.Primary:
      return "dark:bg-primary-200/75 bg-primary-800/75";
    case Variant.Secondary:
      return "dark:bg-secondary-200/75 bg-secondary-800/75";
    case Variant.Tertiary:
      return "dark:bg-tertiary-200/75 bg-tertiary-800/75";
    case Variant.Error:
      return "dark:bg-error-400/75 bg-error-600/75";
    case Variant.Warning:
      return "dark:bg-warning-400/75 bg-warning-600/75";
    case Variant.Success:
      return "dark:bg-success-400/75 bg-success-600/75";
    case Variant.Info:
      return "dark:bg-info-200/75 bg-info-800/75";
    case Variant.Default:
    default:
      return "dark:bg-default-200/75 bg-default-800/75";
  }
}

export function getChipColor(variant?: Variant | "custom"): string {
  if (variant === "custom") {
    return "bg-(--bg-color)";
  } else {
    switch (variant) {
      case Variant.Primary:
        return "dark:bg-primary-200 bg-primary-800";
      case Variant.Secondary:
        return "dark:bg-secondary-200 bg-secondary-800";
      case Variant.Tertiary:
        return "dark:bg-tertiary-200 bg-tertiary-800";
      case Variant.Error:
        return "dark:bg-error-400 bg-error-600";
      case Variant.Warning:
        return "dark:bg-warning-400 bg-warning-600";
      case Variant.Success:
        return "dark:bg-success-400 bg-success-600";
      case Variant.Info:
        return "dark:bg-info-200 bg-info-800";
      case Variant.Default:
      default:
        return "dark:bg-default-200 bg-default-800";
    }
  }
}

export function getOutline(variant?: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return "outline-primary-500";
    case Variant.Secondary:
      return "outline-secondary-500";
    case Variant.Tertiary:
      return "outline-tertiary-500";
    case Variant.Error:
      return "outline-error-500";
    case Variant.Warning:
      return "outline-warning-500";
    case Variant.Success:
      return "outline-success-500";
    case Variant.Info:
      return "outline-info-500";
    case Variant.Default:
    default:
      return "dark:outline-default-700 outline-default-300";
  }
}

export function getBasicTextColor(variant?: Variant | "custom"): string {
  switch (variant) {
    case "custom":
      return "text-(--text-color)";
    case Variant.Primary:
      return "text-primary-500";
    case Variant.Secondary:
      return "text-secondary-500";
    case Variant.Tertiary:
      return "text-tertiary-500";
    case Variant.Error:
      return "text-error-500";
    case Variant.Warning:
      return "text-warning-500";
    case Variant.Success:
      return "text-success-500";
    case Variant.Info:
      return "text-info-500";
    case Variant.Default:
    default:
      return "text-default-500";
  }
}

export function getTooltipTextColor(variant?: Variant | "custom", invert?: boolean): string {
  if (variant === "custom") {
    return "text-(--bg-color)";
  }
  switch (variant) {
    case Variant.Primary:
      return invert
        ? "text-primary-900 dark:text-primary-100"
        : "text-primary-100 dark:text-primary-900";
    case Variant.Secondary:
      return invert
        ? "text-secondary-900 dark:text-secondary-100"
        : "text-secondary-100 dark:text-secondary-900";
    case Variant.Tertiary:
      return invert
        ? "text-tertiary-900 dark:text-tertiary-100"
        : "text-tertiary-100 dark:text-tertiary-900";
    case Variant.Error:
      return invert ? "text-error-400 dark:text-error-600" : "text-error-600 dark:text-error-400";
    case Variant.Warning:
      return invert
        ? "text-warning-400 dark:text-warning-600"
        : "text-warning-600 dark:text-warning-400";
    case Variant.Success:
      return invert
        ? "text-success-400 dark:text-success-600"
        : "text-success-600 dark:text-success-400";
    case Variant.Info:
      return invert ? "text-info-900 dark:text-info-100" : "text-info-100 dark:text-info-900";
    case Variant.Default:
    default:
      return invert
        ? "text-default-700 dark:text-default-300"
        : "text-default-500 dark:text-default-500";
  }
}

export function getBasicBgColor(variant?: Variant | "custom"): string {
  switch (variant) {
    case "custom":
      return "bg-(--bg-color)";
    case Variant.Primary:
      return "bg-primary-500";
    case Variant.Secondary:
      return "bg-secondary-500";
    case Variant.Tertiary:
      return "bg-tertiary-500";
    case Variant.Error:
      return "bg-error-500";
    case Variant.Warning:
      return "bg-warning-500";
    case Variant.Success:
      return "bg-success-500";
    case Variant.Info:
      return "bg-info-500";
    case Variant.Default:
    default:
      return "bg-default-500";
  }
}

export function getTextCaretColor(variant?: Variant | "custom"): string {
  switch (variant) {
    case "custom":
      return "caret-(--text-color) selection:bg-(--text-color) selection:bg-opacity-50";
    case Variant.Primary:
      return "caret-primary-500 selection:bg-primary-500/50";
    case Variant.Secondary:
      return "caret-secondary-500 selection:bg-secondary-500/50";
    case Variant.Tertiary:
      return "caret-tertiary-500 selection:bg-tertiary-500/50";
    case Variant.Error:
      return "caret-error-500 selection:bg-error-500/50";
    case Variant.Warning:
      return "caret-warning-500 selection:bg-warning-500/50";
    case Variant.Success:
      return "caret-success-500 selection:bg-success-500/50";
    case Variant.Info:
      return "caret-info-500 selection:bg-info-500/50";
    case Variant.Default:
    default:
      return "caret-default-500 selection:bg-default-500/50";
  }
}

export function getHoverTextStyles(variant?: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return clsx(
        "hover:text-primary-50 dark:hover:text-primary-950 text-primary-500",
        "disabled:cursor-not-allowed disabled:text-primary-500/30 disabled:hover:text-primary-500/30",
      );
    case Variant.Secondary:
      return clsx(
        "hover:text-secondary-50 dark:hover:text-secondary-950 text-secondary-500",
        "disabled:cursor-not-allowed disabled:text-secondary-500/30 disabled:hover:text-secondary-500/30",
      );
    case Variant.Tertiary:
      return clsx(
        "hover:text-tertiary-50 dark:hover:text-tertiary-950 text-tertiary-500",
        "disabled:cursor-not-allowed disabled:text-tertiary-500/30 disabled:hover:text-tertiary-500/30",
      );
    case Variant.Error:
      return clsx(
        "hover:text-error-500 dark:hover:text-error-700 text-error-600",
        "disabled:cursor-not-allowed disabled:text-error-600/30 disabled:hover:text-error-6    00/30",
      );
    case Variant.Warning:
      return clsx(
        "hover:text-warning-500 dark:hover:text-warning-700 text-warning-600",
        "disabled:cursor-not-allowed disabled:text-warning-600/30 disabled:hover:text-warning-600/30",
      );
    case Variant.Success:
      return clsx(
        "hover:text-success-500 dark:hover:text-success-700 text-success-600",
        "disabled:cursor-not-allowed disabled:text-success-600/30 disabled:hover:text-success-600/30",
      );
    case Variant.Info:
      return clsx(
        "hover:text-info-50 dark:hover:text-info-950 text-info-500",
        "disabled:cursor-not-allowed disabled:text-info-500/30 disabled:hover:text-info-500/30",
      );
    case Variant.Default:
    default:
      return clsx(
        "hover:text-default-400 dark:hover:text-default-600 text-default-500",
        "disabled:cursor-not-allowed disabled:text-default-500/30 disabled:hover:text-default-500/30",
      );
  }
}

export function getHoverButtonStyles(variant?: Variant): string {
  const all =
    "outline-hidden focus:outline-solid hover:outline-solid outline-1 outline-offset-2 outline-transparent";
  switch (variant) {
    case Variant.Primary:
      return clsx(
        all,
        "hover:outline-primary-50 dark:hover:outline-primary-950",
        "hover:bg-primary-50 dark:hover:bg-primary-950 bg-primary-500 dark:bg-primary-700",
        "disabled:cursor-not-allowed disabled:bg-primary-700/50 disabled:hover:bg-primary-700/50",
      );

    case Variant.Secondary:
      return clsx(
        all,
        "hover:outline-secondary-50 dark:hover:outline-secondary-950",
        "hover:bg-secondary-50 dark:hover:bg-secondary-950 bg-secondary-500 dark:bg-secondary-700",
        "disabled:cursor-not-allowed disabled:bg-secondary-700/50 disabled:hover:bg-secondary-700/50",
      );
    case Variant.Error:
      return clsx(
        all,
        "hover:outline-error-500 dark:hover:outline-error-700 ",
        "hover:bg-error-500 dark:hover:bg-error-700 bg-error-600",
        "disabled:cursor-not-allowed disabled:bg-error-600/50 disabled:hover:bg-error-600/50",
      );
    case Variant.Warning:
      return clsx(
        all,
        "hover:outline-warning-400 dark:hover:outline-warning-600 ",
        "hover:bg-warning-400 dark:hover:bg-warning-600 bg-warning-500",
        "disabled:cursor-not-allowed disabled:bg-warning-500/50 disabled:hover:bg-warning-500/50",
      );
    case Variant.Success:
      return clsx(
        all,
        "hover:outline-success-400 dark:hover:outline-success-600 ",
        "hover:bg-success-400 dark:hover:bg-success-600 bg-success-500",
        "disabled:cursor-not-allowed disabled:bg-success-500/50 disabled:hover:bg-success-500/50",
      );
    case Variant.Tertiary:
    case Variant.Info:
      return clsx(
        all,
        "hover:outline-tertiary-50 dark:hover:outline-tertiary-950",
        "hover:bg-tertiary-50 dark:hover:bg-tertiary-950 bg-tertiary-500 dark:bg-tertiary-700",
        "disabled:cursor-not-allowed disabled:bg-tertiary-700/50 disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Default:
    default:
      return clsx(
        all,
        "hover:outline-default-300 dark:hover:outline-default-600 ",
        "hover:bg-default-300 dark:hover:bg-default-600 bg-default-400 dark:bg-default-500",
        "disabled:cursor-not-allowed disabled:bg-default-400/50 disabled:hover:bg-default-400/50 dark:disabled:bg-default-500/50 dark:disabled:hover:bg-default-500/50",
      );
  }
}

export function getCheckedBgStyles(variant?: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return clsx(
        "data-checked:outline-primary-500 data-checked:hover:outline-primary-50 dark:data-checked:hover:outline-primary-950",
        "data-checked:hover:bg-primary-50 dark:data-checked:hover:bg-primary-950 data-checked:bg-primary-500 dark:data-checked:bg-primary-700",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-primary-700/50 data-checked:disabled:hover:bg-primary-700/50",
      );
    case Variant.Secondary:
      return clsx(
        "data-checked:outline-secondary-500 data-checked:hover:outline-secondary-50 dark:data-checked:hover:outline-secondary-950",
        "data-checked:hover:bg-secondary-50 dark:data-checked:hover:bg-secondary-950 data-checked:bg-secondary-500 dark:data-checked:bg-secondary-700",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-secondary-700/50 data-checked:disabled:hover:bg-secondary-700/50",
      );
    case Variant.Tertiary:
      return clsx(
        "data-checked:outline-tertiary-500 data-checked:hover:outline-tertiary-50 dark:data-checked:hover:outline-tertiary-950",
        "data-checked:hover:bg-tertiary-50 dark:data-checked:hover:bg-tertiary-950 data-checked:bg-tertiary-500 dark:data-checked:bg-tertiary-700",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-tertiary-700/50 data-checked:disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Error:
      return clsx(
        "data-checked:outline-error-600 data-checked:hover:outline-error-500 dark:data-checked:hover:outline-error-700 ",
        "data-checked:hover:bg-error-500 dark:data-checked:hover:bg-error-700 data-checked:bg-error-600",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-error-600/50 data-checked:disabled:hover:bg-error-600/50",
      );
    case Variant.Warning:
      return clsx(
        "data-checked:outline-warning-500 data-checked:hover:outline-warning-400 dark:data-checked:hover:outline-warning-600 ",
        "data-checked:hover:bg-warning-400 dark:data-checked:hover:bg-warning-600 data-checked:bg-warning-500",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-warning-500/50 data-checked:disabled:hover:bg-warning-500/50",
      );
    case Variant.Success:
      return clsx(
        "data-checked:outline-success-500 data-checked:hover:outline-success-400 dark:data-checked:hover:outline-success-600 ",
        "data-checked:hover:bg-success-400 dark:data-checked:hover:bg-success-600 data-checked:bg-success-500",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-success-500/50 data-checked:disabled:hover:bg-success-500/50",
      );
    case Variant.Info:
      return clsx(
        "data-checked:outline-tertiary-500 data-checked:hover:outline-tertiary-50 dark:data-checked:hover:outline-tertiary-950",
        "data-checked:hover:bg-tertiary-50 dark:data-checked:hover:bg-tertiary-950 data-checked:bg-tertiary-500 dark:data-checked:bg-tertiary-700",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-tertiary-700/50 data-checked:disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Default:
    default:
      return clsx(
        "data-checked:outline-default-400 data-checked:hover:outline-default-300 dark:data-checked:hover:outline-default-600 ",
        "data-checked:hover:bg-default-300 dark:data-checked:hover:bg-default-600 data-checked:bg-default-400 dark:data-checked:bg-default-500",
        "data-checked:disabled:cursor-not-allowed data-checked:disabled:bg-default-400/50 data-checked:disabled:hover:bg-default-400/50 dark:data-checked:disabled:bg-default-500/50 dark:data-checked:disabled:hover:bg-default-500/50",
      );
  }
}

export function getToggleButtonStyles(variant: Variant): string {
  const base = clsx(
    "outline-hidden transition-colors",
    "hover:ring-1 focus:ring-1 data-[state=on]:ring-1 ring-0 ring-inset",
    "data-disabled:opacity-50 disabled:opacity-50",
    "dark:text-neutral-600 text-neutral-400",
    "place-items-center grid grid-cols-1 grid-rows-1",
    "disabled:hover:ring-transparent disabled:focus:ring-transparent",
  );
  switch (variant) {
    case Variant.Primary:
      return clsx(
        base,
        "hover:ring-primary-500/25 focus:ring-primary-500/25",
        "data-[state=on]:ring-primary-500/50",
        "data-[state=on]:text-primary-500",
      );
    case Variant.Secondary:
      return clsx(
        base,
        "hover:ring-secondary-500/25 focus:ring-secondary-500/25",
        "data-[state=on]:ring-secondary-500/50",
        "data-[state=on]:text-secondary-500",
      );
    case Variant.Tertiary:
      return clsx(
        base,
        "hover:ring-tertiary-500/25 focus:ring-tertiary-500/25",
        "data-[state=on]:ring-tertiary-500/50",
        "data-[state=on]:text-tertiary-500",
      );
    case Variant.Error:
      return clsx(
        base,
        "hover:ring-error-500/25 focus:ring-error-500/25",
        "data-[state=on]:ring-error-500/50",
        "data-[state=on]:text-error-500",
      );
    case Variant.Warning:
      return clsx(
        base,
        "hover:ring-warning-500/25 focus:ring-warning-500/25",
        "data-[state=on]:ring-warning-500/50",
        "data-[state=on]:text-warning-500",
      );
    case Variant.Success:
      return clsx(
        base,
        "hover:ring-success-500/25 focus:ring-success-500/25",
        "data-[state=on]:ring-success-500/50",
        "data-[state=on]:text-success-500",
      );
    case Variant.Info:
      return clsx(
        base,
        "hover:ring-info-500/25 focus:ring-info-500/25",
        "data-[state=on]:ring-info-500/50",
        "data-[state=on]:text-info-500",
      );
    case Variant.Default:
    default:
      return clsx(
        base,
        "hover:ring-default-500/25",
        "dark:data-[state=on]:ring-default-300/50 data-[state=on]:ring-default-700/50",
        "dark:data-[state=on]:text-default-300 data-[state=on]:text-default-700",
      );
  }
}

export function getGradient(variant?: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return "bg-linear-to-r to-primary-50 from-primary-950";
    case Variant.Secondary:
      return "bg-linear-to-r to-secondary-50 from-secondary-950";
    case Variant.Tertiary:
      return "bg-linear-to-r to-tertiary-50 from-tertiary-950";
    case Variant.Error:
      return "bg-linear-to-r to-error-400 from-error-600";
    case Variant.Warning:
      return "bg-linear-to-r to-warning-400 from-warning-600";
    case Variant.Success:
      return "bg-linear-to-r to-success-400 from-success-600";
    case Variant.Info:
      return "bg-linear-to-r to-info-50 from-info-950";
    case Variant.Default:
    default:
      return "bg-linear-to-r to-default-400 from-default-600";
  }
}

export function getInputStyles(
  flex?: boolean,
  subtle?: boolean,
  bold?: boolean,
  size?: Size,
  disabled?: boolean,
  className?: string,
  cursor?: string,
  constrainHeight = true,
): string {
  return clsx(
    "touch-none outline-hidden focus:outline-hidden bg-transparent pl-1 pr-1",
    flex && "w-full flex-1",
    subtle && "dark:focus:text-white focus:text-black text-neutral-600 dark:text-neutral-400",
    !subtle && "text-black dark:text-white",
    bold ? "select-text font-bold" : "select-none font-normal",
    constrainHeight && getHeight(size),
    getFontSize(size),
    disabled ? "cursor-not-allowed" : (cursor ?? "cursor-text"),
    className,
  );
}
