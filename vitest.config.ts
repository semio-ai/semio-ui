import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";

/**
 * Two projects:
 * - `unit`   — node environment, `renderToStaticMarkup` / pure-logic tests
 *              (`*.test.ts` / `*.test.tsx`).
 * - `browser` — real Chromium via Playwright, for behavior that needs a live
 *              DOM (focus, keyboard, roving tabindex): `*.browser.tsx`.
 *
 * Mirrors the studio app's vitest browser setup so the stack is consistent.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { conditions: ["source"] },
  // Compile the package's REAL stylesheet for tests that make layout claims.
  //
  // Without this, every Tailwind class in the components is inert under vitest, which is
  // fine for focus/keyboard/selection but not for windowing: spacer-based positioning is
  // exactly the kind of thing that satisfies a DOM assertion and is wrong on screen. Tests
  // used to inject a few hand-written stand-in rules, which could only ever agree with
  // themselves — if `h-9` or `grid-cols-subgrid` changed, the stand-in still passed.
  //
  // Configured here rather than as a `postcss.config.*` file so the package build is
  // untouched; it already precompiles the stylesheet through the Tailwind CLI.
  css: { postcss: { plugins: [tailwindcss()] } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          exclude: ["**/node_modules/**", "**/dist/**", "src/**/*.browser.tsx"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.browser.tsx"],
          browser: {
            enabled: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
            headless: true,
          },
        },
      },
    ],
  },
});
