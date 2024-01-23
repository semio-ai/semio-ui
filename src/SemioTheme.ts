import { createTheme } from "@mantine/core";

export type ThemeType = ReturnType<typeof createTheme>;

export const SemioTheme: ThemeType = createTheme({
  fontFamily: "sans-serif",
  primaryColor: "semioBlue",
  colors: {
    ...createTheme({}).colors,
    // override colors
    semioBlue: [
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
    semioRed: [
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
    semioYellow: [
      "#fff6e1",
      "#ffedcc",
      "#ffd99b",
      "#ffc464",
      "#ffb238",
      "#ffa71b",
      "#ffa109",
      "#e38d00",
      "#ca7c00",
      "#b06a00"
    ],
  },
  defaultRadius: 1,
  // ... other theme override properties
});
