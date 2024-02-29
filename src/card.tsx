import { Card as MantineCard, type MantineColor } from "@mantine/core";
import type { ReactNode } from "react";
import { SemioColor } from "./semio-theme";

export interface CardProps {
  // The contents of the card
  children: ReactNode;
  // The color, either 'SemioColor.BLUE', 'SemioColor.YELLOW', or 'SemioColor.RED'. Changes the top bar color.
  color?: SemioColor | MantineColor;
}

export function Card({ children, color = SemioColor.BLUE }: CardProps): ReactNode {
  return (
    <MantineCard
      style={{
        borderColor: `var(--mantine-color-${color}-5)`,
        borderTopWidth: 2,
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
