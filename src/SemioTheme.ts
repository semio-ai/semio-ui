import { NavLink, createTheme } from "@mantine/core";

export type ThemeType = ReturnType<typeof createTheme>;

export enum SemioColor {
  BLUE = "semioBlue",
  RED = "semioRed",
  YELLOW = "semioYellow",
}

export const SemioTheme: ThemeType = createTheme({
  fontFamily: "sans-serif",
  primaryColor: SemioColor.BLUE,
  colors: {
    ...createTheme({}).colors,
    // override colors
    [SemioColor.BLUE]: [
      "#E3FDFB",
      "#D5F5F1",
      "#B1E7E0",
      "#89D8CF",
      "#68CCC0",
      "#52C5B7",
      "#43C1B2",
      "#31AB9C",
      "#22988B",
      "#008477",
    ],
    [SemioColor.RED]: [
      "#FFF0E3",
      "#FFDFCE",
      "#FDBC9E",
      "#F9996A",
      "#F67A3F",
      "#F56622",
      "#F55C12",
      "#DA4C06",
      "#C24102",
      "#AB3600",
    ],
    [SemioColor.YELLOW]: [
      "#fff6e1",
      "#ffedcc",
      "#ffd99b",
      "#ffc464",
      "#ffb238",
      "#ffa71b",
      "#ffa109",
      "#e38d00",
      "#ca7c00",
      "#b06a00",
    ],
  },
  defaultRadius: 1,
  components: {
    NavLink: NavLink.extend({
      vars: (theme, props) => ({
        root: {
          "--nl-hover": "#00000000",
          "--nl-bg": "#00000000",
          // '--nl-color': theme.colors[props.color || 'red'],
          "--_nav-link-color": theme.primaryColor,
        },
        children: {},
      }),
      // styles: (theme, props) => ({
      //   root: {
      //     backhovered
      //     ? `var(--mantine-color-${color}-3)`
      //     : active
      //       ? `var(--mantine-color-${color}-5)`
      //       : "var(--mantine-color-gray-5)"
      //   },
      // }),
    }),
  },
  // ... other theme override properties
});
