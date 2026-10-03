import { forwardRef, type ForwardedRef } from "react";
import { Variant } from "../types";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";
import { IconCheck, IconExclamationMark } from "./shared-glyphs";

export interface IconVariantProps extends IconProps {
  className?: string;
  variant?: Variant;
}

const IconVariant = forwardRef(
  ({ variant, ...props }: IconVariantProps, ref: ForwardedRef<SVGSVGElement>) => {
    switch (variant) {
      case Variant.Success:
        return <IconCheck {...props} ref={ref} />;
      case Variant.Error:
        return <IconExclamationMark {...props} ref={ref} />;
      case Variant.Warning:
        return <IconExclamationMark {...props} ref={ref} />;
      case Variant.Info:
        return <IconExclamationMark {...props} ref={ref} />;
      default:
        return null;
    }
  },
);

IconVariant.displayName = "IconVariant";

export { IconVariant };
