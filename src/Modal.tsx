import { Modal as MantineModal, type ModalProps as MantineModalProps, MantineColor } from "@mantine/core";
import { ReactNode } from "react";
import { SemioColor } from "./SemioTheme";
import { useMediaQuery } from '@mantine/hooks';

export interface ModalProps extends MantineModalProps {
  // The contents of the Modal
  children: ReactNode;
  // The color, either 'SemioColor.BLUE', 'SemioColor.YELLOW', or 'SemioColor.RED'. Changes the top bar color.
  color?: SemioColor | MantineColor;
}

export const Modal = ({ children, color = SemioColor.BLUE, ...props }: ModalProps) => {
  const isMobile = useMediaQuery('(max-width: 50em)');

  return (
    <MantineModal
      fullScreen={isMobile}
      style={{
        close: {
          borderColor: `var(--mantine-color-${color}-5)`,
          borderTopWidth: 1,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          backgroundColor: "transparent",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }
      }}
      {...props}

    >
      {children}
    </MantineModal>
  );
};
