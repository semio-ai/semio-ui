import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { clsx } from "clsx";
import { ForwardedRef, MouseEventHandler, forwardRef } from "react";
import type { Variant } from "./types";
import { getHoverButtonStyles } from "./style-functions";

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "small" | "medium" | "large";
  rounded?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  variant?: Variant;
}

export const Avatar = forwardRef(
  (
    { src, alt, size = "medium", onClick, rounded, variant }: AvatarProps,
    ref: ForwardedRef<HTMLSpanElement>,
  ) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        onClick={onClick}
        className={clsx(
          "hover:outline outline-2 outline-neutral-500",
          rounded && "rounded-full",
          size === "small" && "w-10 h-10",
          size === "medium" && "w-12 h-12",
          size === "large" && "w-16 h-16",
        )}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className={clsx("h-full w-full object-cover", rounded && "rounded-full")}
        />
        <AvatarPrimitive.Fallback
          className={clsx(
            "flex h-full w-full items-center justify-center",
            "dark:text-black text-white font-bold",
            "bg-neutral-500 group-hover:dark:bg-neutral-800 group-hover:bg-neutral-200",
            "group-hover:dark:text-white group-hover:text-black",
            rounded && "rounded-full",
            size === "small" && "w-10 h-10",
            size === "medium" && "w-12 h-12",
            size === "large" && "w-16 h-16",
            getHoverButtonStyles(variant),
          )}
        >
          {alt?.[0] ?? "?"}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  },
);

Avatar.displayName = "Avatar";
