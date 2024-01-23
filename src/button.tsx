import { Button as MantineButton } from "@mantine/core";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, ...other }: ButtonProps): JSX.Element {
  return (
    <MantineButton type="button" {...other}>
      {children}
    </MantineButton>
  );
}

Button.displayName = "Button";
