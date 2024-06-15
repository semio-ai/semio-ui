import { ActionIcon, Drawer, NavLink, alpha, createTheme } from "@mantine/core";
// import "./styles.css";

export type ThemeType = ReturnType<typeof createTheme>;

export enum SemioColor {
  BLUE = "semioBlue",
  RED = "semioRed",
  YELLOW = "semioYellow",
}

export const SemioTheme: ThemeType = createTheme({
  fontFamily: '"Gilroy", sans-serif',
  fontFamilyMonospace: '"Gilroy", sans-serif',
  primaryColor: SemioColor.BLUE,
  headings: {
    fontFamily: '"Gilroy", sans-serif',
  },

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
      vars: (theme, _props) => ({
        root: {
          "--nl-hover": "#00000000",
          "--nl-bg": "#00000000",
          // '--nl-color': theme.colors[props.color || 'red'],
          "--_nav-link-color": theme.primaryColor,
        },
        children: {},
      }),
    }),
    ActionIcon: ActionIcon.extend({
      vars: (_theme, _props) => ({
        root: {
          "--ai-bd": "transparent",
        },
      }),
    }),
    Drawer: Drawer.extend({
      styles: (_theme, _props) => ({
        content: {
          backgroundColor: alpha("var(--mantine-color-body)", 0.8),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          // boxShadow: 'inset 0 2px 0 0 var(--mantine-color-semioBlue-5)',
        },
        header: {
          // boxShadow: 'inset 0 2px 0 0 var(--mantine-color-semioBlue-5)',
        },
        // },
        // content: {

        // }
      }),
    }),
  },
  // ... other theme override properties
});
