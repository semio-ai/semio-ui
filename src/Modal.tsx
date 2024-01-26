import {
  Modal as MantineModal,
  type ModalProps as MantineModalProps,
  type MantineColor,
  alpha
} from "@mantine/core";
import { type ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { SemioColor } from "./SemioTheme";

export interface ModalProps extends MantineModalProps {
  // The contents of the Modal
  children: ReactNode;
  // The color, either 'SemioColor.BLUE', 'SemioColor.YELLOW', or 'SemioColor.RED'. Changes the top bar color.
  color?: SemioColor | MantineColor;
}

export function Modal({
  children,
  color = SemioColor.BLUE,
  ...props
}: ModalProps): ReactNode {
  const isMobile = useMediaQuery("(max-width: 48em)");
  return (
    <MantineModal
      centered
      fullScreen={isMobile}
      {...props}
      overlayProps={
        props.overlayProps
          ? { ...DEFAULT_OVERLAY, ...props.overlayProps }
          : DEFAULT_OVERLAY
      }
      withinPortal={false}
      styles={{
        header: {
          borderStyle: "solid",
          borderColor: `var(--mantine-color-${color}-5)`,
          borderTopWidth: 2,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          // backgroundColor: "transparent",
          
        },
        content: {
          backgroundColor: "transparent"
        },
        body: {
          backgroundColor: alpha("var(--mantine-color-body)",0.75),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }
      }}
    >
      {children}
    </MantineModal>
  );
}

const DEFAULT_OVERLAY = {
  backgroundOpacity: 0.55,
  blur: 3,
};
