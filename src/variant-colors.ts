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
    default:
      return "border-default-500";
  }
}

export function getOutline(variant?: Variant): string {
  switch (variant) {
    case Variant.PRIMARY:
      return "outline-primary-500";
    case Variant.SECONDARY:
      return "outline-secondary-500";
    case Variant.TERTIARY:
      return "outline-tertiary-500";
    case Variant.ERROR:
      return "outline-error-500";
    case Variant.WARNING:
      return "outline-warning-500";
    case Variant.SUCCESS:
      return "outline-success-500";
    case Variant.INFO:
      return "outline-info-500";
    case Variant.DEFAULT:
    default:
      return "outline-default-500";
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

export function getHoverTextStyles(variant?: Variant): string {
  switch (variant) {
    case Variant.PRIMARY:
      return clsx(
        "hover:text-primary-50 dark:hover:text-primary-950 text-primary-500",
        "disabled:cursor-not-allowed disabled:text-primary-500/50 disabled:hover:text-primary-500/50",
      );
    case Variant.SECONDARY:
      return clsx(
        "hover:text-secondary-50 dark:hover:text-secondary-950 text-secondary-500",
        "disabled:cursor-not-allowed disabled:text-secondary-500/50 disabled:hover:text-secondary-500/50",
      );
    case Variant.TERTIARY:
      return clsx(
        "hover:text-tertiary-50 dark:hover:text-tertiary-950 text-tertiary-500",
        "disabled:cursor-not-allowed disabled:text-tertiary-500/50 disabled:hover:text-tertiary-500/50",
      );
    case Variant.ERROR:
      return clsx(
        "hover:text-error-500 dark:hover:text-error-700 text-error-600",
        "disabled:cursor-not-allowed disabled:text-error-600/50 disabled:hover:text-error-6    00/50",
      );
    case Variant.WARNING:
      return clsx(
        "hover:text-warning-500 dark:hover:text-warning-700 text-warning-600",
        "disabled:cursor-not-allowed disabled:text-warning-600/50 disabled:hover:text-warning-600/50",
      );
    case Variant.SUCCESS:
      return clsx(
        "hover:text-success-500 dark:hover:text-success-700 text-success-600",
        "disabled:cursor-not-allowed disabled:text-success-600/50 disabled:hover:text-success-600/50",
      );
    case Variant.INFO:
      return clsx(
        "hover:text-info-50 dark:hover:text-info-950 text-info-500",
        "disabled:cursor-not-allowed disabled:text-info-500/50 disabled:hover:text-info-500/50",
      );
    case Variant.DEFAULT:
    default:
      return clsx(
        "hover:text-default-400 dark:hover:text-default-600 text-default-500",
        "disabled:cursor-not-allowed disabled:text-default-500/50 disabled:hover:text-default-500/50",
      );
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
        "focus:outline outline-1 outline-offset-2 outline-warning-500 hover:outline-warning-400 dark:hover:outline-warning-600 ",
        "hover:bg-warning-400 dark:hover:bg-warning-600 bg-warning-500",
        "disabled:cursor-not-allowed disabled:bg-warning-500/50 disabled:hover:bg-warning-500/50",
      );
    case Variant.SUCCESS:
      return clsx(
        "focus:outline outline-1 outline-offset-2 outline-success-500 hover:outline-success-400 dark:hover:outline-success-600 ",
        "hover:bg-success-400 dark:hover:bg-success-600 bg-success-500",
        "disabled:cursor-not-allowed disabled:bg-success-500/50 disabled:hover:bg-success-500/50",
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

export function getCheckedBgStyles(variant?: Variant): string {
  switch (variant) {
    case Variant.PRIMARY:
      return clsx(
        "data-[checked]:outline-primary-500 data-[checked]:hover:outline-primary-50 data-[checked]:dark:hover:outline-primary-950",
        "data-[checked]:hover:bg-primary-50 data-[checked]:dark:hover:bg-primary-950 data-[checked]:bg-primary-500 data-[checked]:dark:bg-primary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-primary-700/50 data-[checked]:disabled:hover:bg-primary-700/50",
      );
    case Variant.SECONDARY:
      return clsx(
        "data-[checked]:outline-secondary-500 data-[checked]:hover:outline-secondary-50 data-[checked]:dark:hover:outline-secondary-950",
        "data-[checked]:hover:bg-secondary-50 data-[checked]:dark:hover:bg-secondary-950 data-[checked]:bg-secondary-500 data-[checked]:dark:bg-secondary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-secondary-700/50 data-[checked]:disabled:hover:bg-secondary-700/50",
      );
    case Variant.TERTIARY:
      return clsx(
        "data-[checked]:outline-tertiary-500 data-[checked]:hover:outline-tertiary-50 data-[checked]:dark:hover:outline-tertiary-950",
        "data-[checked]:hover:bg-tertiary-50 data-[checked]:dark:hover:bg-tertiary-950 data-[checked]:bg-tertiary-500 data-[checked]:dark:bg-tertiary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-tertiary-700/50 data-[checked]:disabled:hover:bg-tertiary-700/50",
      );
    case Variant.ERROR:
      return clsx(
        "data-[checked]:outline-error-600 data-[checked]:hover:outline-error-500 data-[checked]:dark:hover:outline-error-700 ",
        "data-[checked]:hover:bg-error-500 data-[checked]:dark:hover:bg-error-700 data-[checked]:bg-error-600",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-error-600/50 data-[checked]:disabled:hover:bg-error-600/50",
      );
    case Variant.WARNING:
      return clsx(
        "data-[checked]:outline-warning-500 data-[checked]:hover:outline-warning-400 data-[checked]:dark:hover:outline-warning-600 ",
        "data-[checked]:hover:bg-warning-400 data-[checked]:dark:hover:bg-warning-600 data-[checked]:bg-warning-500",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-warning-500/50 data-[checked]:disabled:hover:bg-warning-500/50",
      );
    case Variant.SUCCESS:
      return clsx(
        "data-[checked]:outline-success-500 data-[checked]:hover:outline-success-400 data-[checked]:dark:hover:outline-success-600 ",
        "data-[checked]:hover:bg-success-400 data-[checked]:dark:hover:bg-success-600 data-[checked]:bg-success-500",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-success-500/50 data-[checked]:disabled:hover:bg-success-500/50",
      );
    case Variant.INFO:
      return clsx(
        "data-[checked]:outline-tertiary-500 data-[checked]:hover:outline-tertiary-50 data-[checked]:dark:hover:outline-tertiary-950",
        "data-[checked]:hover:bg-tertiary-50 data-[checked]:dark:hover:bg-tertiary-950 data-[checked]:bg-tertiary-500 data-[checked]:dark:bg-tertiary-700",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-tertiary-700/50 data-[checked]:disabled:hover:bg-tertiary-700/50",
      );
    case Variant.DEFAULT:
    default:
      return clsx(
        "data-[checked]:outline-default-400 data-[checked]:hover:outline-default-300 data-[checked]:dark:hover:outline-default-600 ",
        "data-[checked]:hover:bg-default-300 data-[checked]:dark:hover:bg-default-600 data-[checked]:bg-default-400 data-[checked]:dark:bg-default-500",
        "data-[checked]:disabled:cursor-not-allowed data-[checked]:disabled:bg-default-400/50 data-[checked]:disabled:hover:bg-default-400/50 data-[checked]:disabled:dark:bg-default-500/50 data-[checked]:disabled:dark:hover:bg-default-500/50",
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
