import { Card as MantineCard } from "@mantine/core";
import { ReactNode } from "react";
import { Variant } from "./SemioTheme";

export interface CardProps {
  // The contents of the card
  children: ReactNode;
  // The variant, either 'Variant.BLUE', 'Variant.YELLOW', or 'Variant.RED'. Changes the top bar color.
  variant?: Variant;
}

export const Card = ({ children, variant = Variant.BLUE }: CardProps) => {
  return (
    <MantineCard
      style={{
        borderColor: `var(--mantine-color-${variant}-5)`,
        borderTopWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
      }}
      withBorder
    >
      {children}
    </MantineCard>
  );
};
