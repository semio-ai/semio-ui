import { reactConfig } from "@semio/eslint-config/react";

export default [
  ...reactConfig({ tsconfigRootDir: import.meta.dirname }),
  // Build-time codegen scripts (node, not shipped) — outside the TS project service.
  { ignores: ["scripts/**"] },
];
