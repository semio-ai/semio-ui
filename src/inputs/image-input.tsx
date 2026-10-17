import { ReactNode, useRef } from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { clsx } from "clsx";
import { useImageInput } from "../hooks/formInputHooks";
import { Size, Variant } from "../types";

export interface ImageInputProps {
  src?: string;
  fallback: string | ReactNode;
  onImageChange: (file: File | null) => void;
  variant?: Variant;
  className?: string;
  size?: Size;
  ariaLabel?: string;
}

export function ImageInput({
  src,
  onImageChange,
  variant,
  fallback,
  size = Size.Md,
  className,
  ariaLabel = "Update image",
}: ImageInputProps) {
  const { localImageURL, handleChange } = useImageInput(onImageChange, src);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackContent = typeof fallback === "string" ? fallback[0] : fallback;

  return (
    <AvatarPrimitive.Root
      onClick={(event) => {
        if (event.target !== fileInputRef.current) fileInputRef.current?.click();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={clsx(
        size,
        "sized-image-input group/image-input relative grid rounded-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      <input
        hidden
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={false}
        onChange={handleChange}
      />
      <AvatarPrimitive.Image
        src={localImageURL ?? undefined}
        className={clsx(
          size,
          variant,
          "variant-scope cursor-pointer",
          "sized-image-input",
          "variant-responsive-appearing-outline",
          "object-cover object-center",
          "rounded-sm",
        )}
      />
      <AvatarPrimitive.Fallback
        className={clsx(
          size,
          variant,
          "variant-scope cursor-pointer",
          "grid size-full",
          "place-items-center rounded-sm select-none",
          // The fill owns the foreground so the fallback initial stays legible.
          "variant-responsive-bg variant-responsive-appearing-outline",
        )}
      >
        {fallbackContent}
      </AvatarPrimitive.Fallback>
      <div
        className={clsx(
          "absolute right-0 bottom-0 left-0 rounded-b-sm text-center",
          "backdrop-blur-sm transition-colors",
          "dark:bg-layout-dark-inset/50 bg-layout-light-inset/50",
          "dark:group-hover/image-input:bg-layout-dark-inset/75",
          "group-hover/image-input:bg-layout-light-inset/75",
        )}
      >
        Update
      </div>
    </AvatarPrimitive.Root>
  );
}
