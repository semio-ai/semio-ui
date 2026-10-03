import { reactConfig } from "@semio/eslint-config/react";
import { semioUiPlugin } from "./eslint-rules/index.mjs";

export default [
  ...reactConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    files: ["src/**/*.tsx"],
    plugins: { "semio-ui": semioUiPlugin },
    rules: {
      // A literal foreground on a variant-filled element is wrong in some theme or for
      // some variant, always. The allowlist is empty on purpose: the one entry this was
      // expected to need — the inverted tooltip — turned out to be a real defect when
      // its named variants were measured, so it was fixed instead of excused. Any entry
      // added here must carry a reason that survives being measured.
      "semio-ui/no-hardcoded-on-fill-foreground": ["error", { allow: [] }],
    },
  },
];
