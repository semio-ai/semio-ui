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
  size?: Size;
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
        "sized-image-input group/image-input relative grid rounded-sm",
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
        className={clsx(
          size,
          variant,
          "responsive cursor-pointer",
          "grid size-full",
          "place-items-center rounded-sm select-none",
          // The fill declares the foreground. Specifically NOT `variant-responsive-text`,
          // which resolves to `--weak-accent-text-color` — the same -500 shade this fill
          // paints with — so the fallback initial rendered at exactly 1:1 against its own
          // background, invisible for every named variant in both themes.
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
