import { clsx } from "clsx";
import { Variant } from "./types";

export function getBorder(variant?: Variant): string {
  switch (variant) {
    case Variant.PRIMARY:
      return "border-primary-500";
    case Variant.SECONDARY:
      return "border-secondary-500";
    case Variant.TERTIARY:
      return "border-tertiary-500";
    case Variant.ERROR:
      return "border-error-500";
    case Variant.WARNING:
      return "border-warning-500";
    case Variant.SUCCESS:
      return "border-success-500";
    case Variant.INFO:
      return "border-info-500";
    case Variant.DEFAULT:
      return "border-default-500";
    default:
      return "border-default-500";
  }
}

export function getBasicTextColor(variant?: Variant): string {
  switch (variant) {
    case Variant.PRIMARY:
      return "text-primary-500";
    case Variant.SECONDARY:
      return "text-secondary-500";
    case Variant.TERTIARY:
      return "text-tertiary-500";
    case Variant.ERROR:
      return "text-error-500";
    case Variant.WARNING:
      return "text-warning-500";
    case Variant.SUCCESS:
      return "text-success-500";
    case Variant.INFO:
      return "text-info-500";
    case Variant.DEFAULT:
      return "text-default-500";
    default:
      return "text-default-500";
  }
}

export function getHoverButtonStyles(variant?: Variant): string {
  switch (variant) {
    case Variant.PRIMARY:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-primary-500 hover:outline-primary-50 dark:hover:outline-primary-950",
        "hover:bg-primary-50 dark:hover:bg-primary-950 bg-primary-500 dark:bg-primary-700",
        "disabled:cursor-not-allowed disabled:bg-primary-700/50 disabled:hover:bg-primary-700/50",
      );
    case Variant.SECONDARY:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-secondary-500 hover:outline-secondary-50 dark:hover:outline-secondary-950",
        "hover:bg-secondary-50 dark:hover:bg-secondary-950 bg-secondary-500 dark:bg-secondary-700",
        "disabled:cursor-not-allowed disabled:bg-secondary-700/50 disabled:hover:bg-secondary-700/50",
      );
    case Variant.TERTIARY:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-tertiary-500 hover:outline-tertiary-50 dark:hover:outline-tertiary-950",
        "hover:bg-tertiary-50 dark:hover:bg-tertiary-950 bg-tertiary-500 dark:bg-tertiary-700",
        "disabled:cursor-not-allowed disabled:bg-tertiary-700/50 disabled:hover:bg-tertiary-700/50",
      );
    case Variant.ERROR:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-error-600 hover:outline-error-500 dark:hover:outline-error-700 ",
        "hover:bg-error-500 dark:hover:bg-error-700 bg-error-600",
        "disabled:cursor-not-allowed disabled:bg-error-600/50 disabled:hover:bg-error-600/50",
      );
    case Variant.WARNING:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-warning-600 hover:outline-warning-500 dark:hover:outline-warning-700 ",
        "hover:bg-warning-500 dark:hover:bg-warning-700 bg-warning-600",
        "disabled:cursor-not-allowed disabled:bg-warning-600/50 disabled:hover:bg-warning-600/50",
      );
    case Variant.SUCCESS:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-success-600 hover:outline-success-500 dark:hover:outline-success-700 ",
        "hover:bg-success-500 dark:hover:bg-success-700 bg-success-600",
        "disabled:cursor-not-allowed disabled:bg-success-600/50 disabled:hover:bg-success-600/50",
      );
    case Variant.INFO:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-tertiary-500 hover:outline-tertiary-50 dark:hover:outline-tertiary-950",
        "hover:bg-tertiary-50 dark:hover:bg-tertiary-950 bg-tertiary-500 dark:bg-tertiary-700",
        "disabled:cursor-not-allowed disabled:bg-tertiary-700/50 disabled:hover:bg-tertiary-700/50",
      );
    case Variant.DEFAULT:
    default:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-default-400 hover:outline-default-300 dark:hover:outline-default-600 ",
        "hover:bg-default-300 dark:hover:bg-default-600 bg-default-400 dark:bg-default-500",
        "disabled:cursor-not-allowed disabled:bg-default-400/50 disabled:hover:bg-default-400/50 disabled:dark:bg-default-500/50 disabled:dark:hover:bg-default-500/50",
      );
  }
}

// export const rootVariant: Record<Variant, string> = {
//   [Variant.PRIMARY]: "primary",
//   [Variant.SECONDARY]: "secondary",
//   [Variant.TERTIARY]: "tertiary",
//   [Variant.ERROR]: "error",
//   [Variant.WARNING]: "warning",
//   [Variant.SUCCESS]: "success",
//   [Variant.INFO]: "info",
//   [Variant.DEFAULT]: "gray",
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
