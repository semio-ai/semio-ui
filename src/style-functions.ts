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
      return "border-default-500";
    default:
      return "dark:border-default-700 border-default-300";
  }
}

export function getReversibleBgText(
  variant?: Variant,
  active?: boolean,
): string {
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

export function getItemSideStyle(variant?: Variant): string {
  const all = clsx(
    "dark:group-data-[highlighted]:text-black group-data-[highlighted]:text-white",
    "group-data-[disabled]:text-neutral-500/50",
  );
  switch (variant) {
    case Variant.Primary:
      return clsx(all, "dark:text-primary-200/75 text-primary-800/75");
    case Variant.Secondary:
      return clsx(all, "dark:text-secondary-200/75 text-secondary-800/75");
    case Variant.Tertiary:
      return clsx(all, "dark:text-tertiary-200/75 text-tertiary-800/75");
    case Variant.Error:
      return clsx(all, "dark:text-error-400/75 text-error-600/75");
    case Variant.Warning:
      return clsx(all, "dark:text-warning-400/75 text-warning-600/75");
    case Variant.Success:
      return clsx(all, "dark:text-success-400/75 text-success-600/75");
    case Variant.Info:
      return clsx(all, "dark:text-info-200/75 text-info-800/75");
    case Variant.Default:
    default:
      return clsx(all, "dark:text-default-200/75 text-default-800/75");
  }
}

export function getItemStyle(variant?: Variant): string {
  const all = clsx(
    "cursor-pointer group dark:data-[highlighted]:text-black data-[highlighted]:text-white",
    "data-[disabled]:text-neutral-500/50",
  );
  switch (variant) {
    case Variant.Primary:
      return clsx(
        all,
        "dark:text-primary-200/75 text-primary-800/75",
        "dark:data-[highlighted]:bg-primary-200/50 data-[highlighted]:bg-primary-800/50",
      );
    case Variant.Secondary:
      return clsx(
        all,
        "dark:text-secondary-200/75 text-secondary-800/75",
        "dark:data-[highlighted]:bg-secondary-200/50 data-[highlighted]:bg-secondary-800/50",
      );
    case Variant.Tertiary:
      return clsx(
        all,
        "dark:text-tertiary-200/75 text-tertiary-800/75",
        "dark:data-[highlighted]:bg-tertiary-200/50 data-[highlighted]:bg-tertiary-800/50",
      );
    case Variant.Error:
      return clsx(
        all,
        "dark:text-error-400/75 text-error-600/75",
        "dark:data-[highlighted]:bg-error-400/50 data-[highlighted]:bg-error-600/50",
      );
    case Variant.Warning:
      return clsx(
        all,
        "dark:text-warning-400/75 text-warning-600/75",
        "dark:data-[highlighted]:bg-warning-400/50 data-[highlighted]:bg-warning-600/50",
      );
    case Variant.Success:
      return clsx(
        all,
        "dark:text-success-400/75 text-success-600/75",
        "dark:data-[highlighted]:bg-success-400/50 data-[highlighted]:bg-success-600/50",
      );
    case Variant.Info:
      return clsx(
        all,
        "dark:text-info-200/75 text-info-800/75",
        "dark:data-[highlighted]:bg-info-200/50 data-[highlighted]:bg-info-800/50",
      );
    case Variant.Default:
    default:
      return clsx(
        all,
        "dark:text-default-200/75 text-default-800/75",
        "dark:data-[highlighted]:bg-default-200/50 data-[highlighted]:bg-default-800/50",
      );
  }
}

export function getSeparatorStyle(variant?: Variant): string {
  switch (variant) {
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

export function getBasicTextColor(variant?: Variant): string {
  switch (variant) {
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
      return "text-default-500";
    default:
      return "text-default-500";
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
  switch (variant) {
    case Variant.Primary:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-primary-500 hover:outline-primary-50 dark:hover:outline-primary-950",
        "hover:bg-primary-50 dark:hover:bg-primary-950 bg-primary-500 dark:bg-primary-700",
        "disabled:cursor-not-allowed disabled:bg-primary-700/50 disabled:hover:bg-primary-700/50",
      );
    case Variant.Secondary:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-secondary-500 hover:outline-secondary-50 dark:hover:outline-secondary-950",
        "hover:bg-secondary-50 dark:hover:bg-secondary-950 bg-secondary-500 dark:bg-secondary-700",
        "disabled:cursor-not-allowed disabled:bg-secondary-700/50 disabled:hover:bg-secondary-700/50",
      );
    case Variant.Tertiary:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-tertiary-500 hover:outline-tertiary-50 dark:hover:outline-tertiary-950",
        "hover:bg-tertiary-50 dark:hover:bg-tertiary-950 bg-tertiary-500 dark:bg-tertiary-700",
        "disabled:cursor-not-allowed disabled:bg-tertiary-700/50 disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Error:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-error-600 hover:outline-error-500 dark:hover:outline-error-700 ",
        "hover:bg-error-500 dark:hover:bg-error-700 bg-error-600",
        "disabled:cursor-not-allowed disabled:bg-error-600/50 disabled:hover:bg-error-600/50",
      );
    case Variant.Warning:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-warning-500 hover:outline-warning-400 dark:hover:outline-warning-600 ",
        "hover:bg-warning-400 dark:hover:bg-warning-600 bg-warning-500",
        "disabled:cursor-not-allowed disabled:bg-warning-500/50 disabled:hover:bg-warning-500/50",
      );
    case Variant.Success:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-success-500 hover:outline-success-400 dark:hover:outline-success-600 ",
        "hover:bg-success-400 dark:hover:bg-success-600 bg-success-500",
        "disabled:cursor-not-allowed disabled:bg-success-500/50 disabled:hover:bg-success-500/50",
      );
    case Variant.Info:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-tertiary-500 hover:outline-tertiary-50 dark:hover:outline-tertiary-950",
        "hover:bg-tertiary-50 dark:hover:bg-tertiary-950 bg-tertiary-500 dark:bg-tertiary-700",
        "disabled:cursor-not-allowed disabled:bg-tertiary-700/50 disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Default:
    default:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-default-400 hover:outline-default-300 dark:hover:outline-default-600 ",
        "hover:bg-default-300 dark:hover:bg-default-600 bg-default-400 dark:bg-default-500",
        "disabled:cursor-not-allowed disabled:bg-default-400/50 disabled:hover:bg-default-400/50 disabled:dark:bg-default-500/50 disabled:dark:hover:bg-default-500/50",
      );
  }
}

export function getCheckedBgStyles(variant?: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return clsx(
        "data-[checked]:outline-primary-500 data-[checked]:hover:outline-primary-50 data-[checked]:dark:hover:outline-primary-950",
        "data-[checked]:hover:bg-primary-50 data-[checked]:dark:hover:bg-primary-950 data-[checked]:bg-primary-500 data-[checked]:dark:bg-primary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-primary-700/50 data-[checked]:disabled:hover:bg-primary-700/50",
      );
    case Variant.Secondary:
      return clsx(
        "data-[checked]:outline-secondary-500 data-[checked]:hover:outline-secondary-50 data-[checked]:dark:hover:outline-secondary-950",
        "data-[checked]:hover:bg-secondary-50 data-[checked]:dark:hover:bg-secondary-950 data-[checked]:bg-secondary-500 data-[checked]:dark:bg-secondary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-secondary-700/50 data-[checked]:disabled:hover:bg-secondary-700/50",
      );
    case Variant.Tertiary:
      return clsx(
        "data-[checked]:outline-tertiary-500 data-[checked]:hover:outline-tertiary-50 data-[checked]:dark:hover:outline-tertiary-950",
        "data-[checked]:hover:bg-tertiary-50 data-[checked]:dark:hover:bg-tertiary-950 data-[checked]:bg-tertiary-500 data-[checked]:dark:bg-tertiary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-tertiary-700/50 data-[checked]:disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Error:
      return clsx(
        "data-[checked]:outline-error-600 data-[checked]:hover:outline-error-500 data-[checked]:dark:hover:outline-error-700 ",
        "data-[checked]:hover:bg-error-500 data-[checked]:dark:hover:bg-error-700 data-[checked]:bg-error-600",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-error-600/50 data-[checked]:disabled:hover:bg-error-600/50",
      );
    case Variant.Warning:
      return clsx(
        "data-[checked]:outline-warning-500 data-[checked]:hover:outline-warning-400 data-[checked]:dark:hover:outline-warning-600 ",
        "data-[checked]:hover:bg-warning-400 data-[checked]:dark:hover:bg-warning-600 data-[checked]:bg-warning-500",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-warning-500/50 data-[checked]:disabled:hover:bg-warning-500/50",
      );
    case Variant.Success:
      return clsx(
        "data-[checked]:outline-success-500 data-[checked]:hover:outline-success-400 data-[checked]:dark:hover:outline-success-600 ",
        "data-[checked]:hover:bg-success-400 data-[checked]:dark:hover:bg-success-600 data-[checked]:bg-success-500",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-success-500/50 data-[checked]:disabled:hover:bg-success-500/50",
      );
    case Variant.Info:
      return clsx(
        "data-[checked]:outline-tertiary-500 data-[checked]:hover:outline-tertiary-50 data-[checked]:dark:hover:outline-tertiary-950",
        "data-[checked]:hover:bg-tertiary-50 data-[checked]:dark:hover:bg-tertiary-950 data-[checked]:bg-tertiary-500 data-[checked]:dark:bg-tertiary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-tertiary-700/50 data-[checked]:disabled:hover:bg-tertiary-700/50",
      );
    case Variant.Default:
    default:
      return clsx(
        "data-[checked]:outline-default-400 data-[checked]:hover:outline-default-300 data-[checked]:dark:hover:outline-default-600 ",
        "data-[checked]:hover:bg-default-300 data-[checked]:dark:hover:bg-default-600 data-[checked]:bg-default-400 data-[checked]:dark:bg-default-500",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-default-400/50 data-[checked]:disabled:hover:bg-default-400/50 data-[checked]:disabled:dark:bg-default-500/50 data-[checked]:disabled:dark:hover:bg-default-500/50",
      );
  }
}

// export const rootVariant: Record<Variant, string> = {
//   [Variant.Primary]: "primary",
//   [Variant.Secondary]: "secondary",
//   [Variant.Tertiary]: "tertiary",
//   [Variant.Error]: "error",
//   [Variant.Warning]: "warning",
//   [Variant.Success]: "success",
//   [Variant.Info]: "info",
//   [Variant.Default]: "gray",
// };

// export const variantThemedBg: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `bg-${color}-300 dark:bg-${color}-700`,
// );
// export const variantBgContrast: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `bg-${color}-700 dark:bg-${color}-300`,
// );
// export const variantBg: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `bg-${color}-500`,
// );
// export const variantThemedHover: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `hover:bg-${color}-800 dark:hover:bg-${color}-200`,
// );
// export const variantThemedTxt: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `text-${color}-700 dark:text-${color}-300`,
// );
// export const variantTxtContrast: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `text-${color}-300 dark:text-${color}-700`,
// );
// export const variantTxt: Record<Variant, string> = mapValues(
//   rootVariant,
//   (color) => `text-${color}-500`,
// );
