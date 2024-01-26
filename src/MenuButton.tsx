import {
  Text,
  NavLink,
  Transition,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { ReactNode } from "react";
import { SemioColor } from "./SemioTheme";
import type { MantineColor, NavLinkProps } from "@mantine/core";
import { useMantineColorScheme } from '@mantine/core';

export interface MenuButtonProps extends NavLinkProps {
  // Whether to use the minified (icon only) version of the brand (default: false
  minified?: boolean;
  // The icon used in the menu button
  icon: ReactNode;
  // Label for the menu button
  label: string | ReactNode;
  // The color, either 'SemioColor.BLUE', 'SemioColor.YELLOW', or 'SemioColor.RED'. Changes the text color.
  color?: SemioColor | MantineColor;
  // Whether the menu button is active
  active?: boolean;
}

// A component whihc renders the Semio brand (usable in the top-left corner of the app)
export const MenuButton = ({
  minified = false,
  icon,
  label,
  color = "primaryColor",
  active = false,
  ...props
}: MenuButtonProps) => {
  //   console.log("Color: ", label, color);
  const { colorScheme } = useMantineColorScheme();
  const { hovered, ref: button } = useHover<HTMLAnchorElement>();
  return (
    <NavLink
      ref={button}
      {...props}
      active={active}
      style={{
        paddingLeft: 17,
        backgroundColor: "transparent",
        color: hovered
          ? `var(--mantine-color-${color}-${colorScheme === 'dark' ? 3 : 7})`
          : active
            ? `var(--mantine-color-${color}-5)`
            : "var(--mantine-color-gray-5)",
      }}
      color={color}
      noWrap
      leftSection={icon}
      label={
        <Transition
          mounted={!minified}
          transition="scale-x"
          duration={250}
          exitDuration={1}
          timingFunction="ease"
        >
          {(styles) => (
            <Text style={{ userSelect: "none", ...styles }}>{label}</Text>
          )}
        </Transition>
      }
    />
  );
};
