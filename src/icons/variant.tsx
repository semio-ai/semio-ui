import { forwardRef, type ForwardedRef } from "react";
import { IconCheck, IconExclamationMark, type TablerIconsProps } from "@tabler/icons-react";
import { Variant } from "../types";

export interface IconVariantProps extends TablerIconsProps {
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
