import {
  Text,
  NavLink,
  Transition,
  useMantineColorScheme,
  type MantineColor,
  type NavLinkProps,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import type { ReactNode } from "react";
import type { SemioColor } from "./semio-theme";

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
export function MenuButton({
  minified = false,
  icon,
  label,
  color = "primaryColor",
  active = false,
  ...props
}: MenuButtonProps): ReactNode {
  //   console.log("Color: ", label, color);
  const { colorScheme } = useMantineColorScheme();
  const { hovered, ref: button } = useHover<HTMLAnchorElement>();
  const hoverShade: number = colorScheme === 'dark' ? 3 : 7;
  const activeColor: string = active ? `var(--mantine-color-${color}-5)` : "var(--mantine-color-gray-5)";
  return (
    <NavLink

      {...props}
      active={active}
      color={color}
      label={
        <Transition
          duration={250}
          exitDuration={1}
          mounted={!minified}
          timingFunction="ease"
          transition="scale-x"
        >
          {(styles) => (
            <Text style={{ userSelect: "none", ...styles }}>{label}</Text>
          )}
        </Transition>
      }
      leftSection={icon}
      noWrap
      ref={button}
      style={{
        paddingLeft: 17,
        backgroundColor: "transparent",
        color: hovered
          ? `var(--mantine-color-${color}-${hoverShade})`
          : activeColor,
      }}
    />
  );
};
