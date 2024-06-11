// tailwind config is required for editor support
import sharedConfig from "@semio/tailwind-config";

const config = {
  content: ["./src/**/*.tsx"],
  // prefix: "",
  presets: [sharedConfig],
};

export default config;
