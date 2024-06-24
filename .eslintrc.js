/** @type {import("eslint").Linter.Config} */
module.export = {
  extends: ["@semio/eslint-config/react.js"],
  ignorePatterns: [
    "node_modules/",
    "dist/**",
    ".eslintrc.js",
    "tailwind.config.js",
  ],
};
