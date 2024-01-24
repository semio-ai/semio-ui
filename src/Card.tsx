import { Card as MantineCard, MantineColor } from "@mantine/core";
import { ReactNode } from "react";
import { SemioColor } from "./SemioTheme";

export interface CardProps {
  // The contents of the card
  children: ReactNode;
  // The color, either 'SemioColor.BLUE', 'SemioColor.YELLOW', or 'SemioColor.RED'. Changes the top bar color.
  color?: SemioColor | MantineColor;
}

export const Card = ({ children, color = SemioColor.BLUE }: CardProps) => {
  return (
    <MantineCard
      style={{
        borderColor: `var(--mantine-color-${color}-5)`,
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
