import { type CSSProperties } from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { clsx } from "clsx";
import { Size, Variant } from "../types";

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  label?: string;
  color?: string;
  className?: string;
}

const SWITCH_SIZE_CLASSES: Record<Size, { root: string; thumb: string }> = {
  [Size.Xs]: {
    root: "h-4 w-7 p-0.5",
    thumb: "h-3 w-3 data-[state=checked]:translate-x-3",
  },
  [Size.Sm]: {
    root: "h-5 w-9 p-0.5",
    thumb: "h-4 w-4 data-[state=checked]:translate-x-4",
  },
  [Size.Md]: {
    root: "h-6 w-11 p-0.5",
    thumb: "h-5 w-5 data-[state=checked]:translate-x-5",
  },
  [Size.Lg]: {
    root: "h-7 w-[3.25rem] p-0.5",
    thumb: "h-6 w-6 data-[state=checked]:translate-x-6",
  },
  [Size.Xl]: {
    root: "h-8 w-14 p-0.5",
    thumb: "h-7 w-7 data-[state=checked]:translate-x-6",
  },
};

export function Switch({
  id,
  checked,
  onCheckedChange,
  variant = Variant.Default,
  size = Size.Md,
  disabled = false,
  label,
  color,
  className,
}: SwitchProps) {
  const sizeClasses = SWITCH_SIZE_CLASSES[size];

  return (
    <BaseSwitch.Root
      nativeButton
      render={(props, state) => (
        <button
          {...props}
          type="button"
          tabIndex={undefined}
          data-state={state.checked ? "checked" : "unchecked"}
        />
      )}
      id={id}
      checked={checked}
      onClick={(event) => {
        // Base UI's click handler toggles by dispatching a second, bubbling click on its
        // hidden input, so a clickable row around the control would see two clicks. The
        // value is controlled, so the next one goes straight to the consumer and ancestors
        // see only the button's click.
        event.preventBaseUIHandler();
        if (!disabled) onCheckedChange(!checked);
      }}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        "variant-scope inline-flex shrink-0 items-center rounded-full transition-colors",
        "variant-checkbox-bg variant-responsive-appearing-outline",
        disabled ? "cursor-default" : "cursor-pointer",
        sizeClasses.root,
        color ? "custom-color" : variant,
        className,
      )}
      style={color ? ({ "--custom-color": color } as CSSProperties) : undefined}
    >
      <BaseSwitch.Thumb
        render={(props, state) => (
          <span {...props} data-state={state.checked ? "checked" : "unchecked"} />
        )}
        className={clsx(
          "pointer-events-none block rounded-full bg-white shadow-sm transition-transform duration-160 ease-out dark:bg-black",
          disabled && "opacity-50",
          sizeClasses.thumb,
        )}
      />
    </BaseSwitch.Root>
  );
}
