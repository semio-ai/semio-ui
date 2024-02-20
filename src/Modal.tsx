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
  // Movable
  movable?: boolean;
}

export function Modal({
  children,
  color = SemioColor.BLUE,
  movable = false,
  ...props
}: ModalProps): ReactNode {
  const isMobile = useMediaQuery("(max-width: 48em)");

  const defaultOverlayProps = movable ? {} : DEFAULT_OVERLAY;

  return (
    <MantineModal
      centered
      fullScreen={isMobile}
      {...props}
      overlayProps={
        props.overlayProps
          ? { ...defaultOverlayProps, ...props.overlayProps }
          : defaultOverlayProps
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
  // backgroundColor: "var(--mantine-color-color-body)",
};
