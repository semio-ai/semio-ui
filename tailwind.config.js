/** @type {import('tailwindcss').Config} */
import sharedConfig from "@semio/tailwind-config";

const config = {
  content: ["./src/**/*.tsx"],
  // prefix: "",
  presets: [sharedConfig],
};

export default config;
