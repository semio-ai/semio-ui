import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
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

  // Pin every `@base-ui/react` subpath this package imports, so Vite pre-bundles them
  // before the run instead of discovering them during it.
  //
  // Discovered mid-run, a dep is optimized while the suite is already executing, and
  // the optimized bundle and the still-source copy then hold DIFFERENT React
  // instances. Every test in the affected files dies at once with "Invalid hook call
  // … more than one copy of React" or a null-hook TypeError — so a new import reads
  // as though it broke unrelated components, and the files it takes down have nothing
  // to do with the change.
  //
  // Two things make it worth pinning rather than clearing the cache each time. It only
  // appears when a subpath is NEW, so it lands on whoever adds one and looks like
  // their bug; and a warm cache hides it completely, so it survives a green local run.
  //
  // ⚠ Add to this list when importing a dependency, or a `@base-ui/react` or
  // `@solar-icons/react-perf` subpath, the package has not used before. The studio
  // app keeps the same list for the same reason.
  optimizeDeps: {
    include: [
      "@tabler/icons-react",
      "@solar-icons/react-perf/Bold",
      "@solar-icons/react-perf/Linear",
      "@solar-icons/react-perf/LineDuotone",
      "@base-ui/react/alert-dialog",
      "@base-ui/react/autocomplete",
      "@base-ui/react/avatar",
      "@base-ui/react/combobox",
      "@base-ui/react/dialog",
      "@base-ui/react/internals/composite",
      "@base-ui/react/scroll-area",
      "@base-ui/react/tabs",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          // `eslint-rules/` is included so the package's own lint rule is falsified by
          // the same suite as its components. A rule that passes against a known
          // violation certifies the absence of what it cannot see, so its tests have to
          // run somewhere that fails the build.
          include: ["src/**/*.test.ts", "src/**/*.test.tsx", "eslint-rules/**/*.test.ts"],
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
            provider: playwright(),
            locators: { exact: false },
            instances: [{ browser: "chromium" }],
            headless: true,
          },
        },
      },
    ],
  },
});
