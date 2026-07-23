import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

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
