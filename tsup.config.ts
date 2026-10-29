import { defineConfig, type Options } from "tsup";

const shared: Options = {
  entry: ["src/index.tsx"],
  dts: true,
  publicDir: true,
  // tsup already leaves every `dependencies`/`peerDependencies` entry external;
  // these are named because the build has always named them.
  external: ["react", "@tabler/icons-react"],
};

/**
 * Two builds, because `@solar-icons/react-perf` is ESM-only.
 *
 * - **ESM** leaves it external. It is a declared dependency, so an ESM consumer
 *   resolves it from their own install and shares one copy with `@semio/timeline-editor`,
 *   which imports it too.
 * - **CJS** bundles it. A `require()` of an ESM-only package fails on every Node
 *   release without `require(esm)` and in CommonJS toolchains, so the CommonJS
 *   build carries the Solar components it renders rather than requiring them.
 *
 * The type declarations need neither: glyph props are declared locally
 * (`src/icons/_internal/glyph-props.ts`), so `dist/index.d.ts` references nothing
 * from that package.
 */
export default defineConfig((options) => [
  { ...shared, ...options, format: "esm" },
  {
    ...shared,
    ...options,
    format: "cjs",
    noExternal: ["@solar-icons/react-perf"],
  },
]);
