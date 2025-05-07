import { ReactNode, useRef } from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { clsx } from "clsx";
import { useImageInput } from "../hooks/formInputHooks";
import { Size, Variant } from "../types";

export interface ImageInputProps {
  src?: string;
  fallback: string | ReactNode;
  onImageChange: (file: File | null) => void;
  variant?: Variant;
  className?: string;
  size?: string;
}

export function ImageInput({
  src,
  onImageChange,
  variant,
  fallback,
  size = Size.Md,
  className,
}: ImageInputProps) {
  const { localImageURL, handleChange } = useImageInput(onImageChange, src);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackContent = typeof fallback === "string" ? fallback[0] : fallback;

  return (
    <AvatarPrimitive.Root
      onClick={() => fileInputRef.current?.click?.()}
      className={clsx(
        size,
        "rounded-sm grid sized-image-input relative group/image-input bg-red-500",
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
          "responsive cursor-pointer",
          "sized-image-input",
          "variant-responsive-appearing-outline",
          "object-cover object-center",
          "rounded-sm",
        )}
      />
      <AvatarPrimitive.Fallback
        asChild
        className={clsx(
          size,
          variant,
          "responsive cursor-pointer",
          "size-full grid",
          "place-items-center rounded-sm select-none",
          "variant-responsive-bg variant-responsive-appearing-outline",
          "variant-responsive-text",
        )}
      >
        {fallbackContent}
      </AvatarPrimitive.Fallback>
      <div
        className={clsx(
          "absolute rounded-b-sm bottom-0 left-0 right-0 text-center",
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
