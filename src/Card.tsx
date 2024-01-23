import { Card as MantineCard } from "@mantine/core";
import { ReactNode } from "react";

export interface CardProps {
    children: ReactNode
}

export const Card = ({children}: CardProps) => {
    return (
        <MantineCard style={{borderTop:1,borderColor:"--var(--semioBlue)"}}>{children}</MantineCard>
    )
}