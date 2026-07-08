import { useSyncExternalStore } from "react";

/**
 * Single source of truth for desktop-vs-mobile in JS, mirroring the CSS
 * `desktop:` variant. Both key off Tailwind's built-in `--breakpoint-md`
 * breakpoint: the CSS `desktop:` variant is defined as
 * `@media (min-width: theme(--breakpoint-md))` (see `public/styles.css`), and
 * this hook reads the same custom property at runtime, so the two can't drift.
 *
 * Width-only by design — a wide-but-short window is still "desktop". Built on
 * `useSyncExternalStore` so it is tear-free, updates on viewport changes, and
 * works in any render context (no layout root / provider required).
 *
 * Uses classic `min-width:` rather than range syntax (`width >= …`) to match
 * the CSS `desktop:` variant and because WebKit re-evaluates range-context
 * media queries unreliably on resize (they can latch after the first change).
 *
 * Degrades to `false` when `matchMedia` is unavailable (SSR, and jsdom-based
 * unit tests where `window` exists but `matchMedia` does not) rather than
 * throwing.
 */

// Fallback matches Tailwind's default `--breakpoint-md`; used only when the
// custom property can't be read (SSR, or before styles apply).
const FALLBACK_BREAKPOINT = "48rem";

function desktopMediaQuery(): string {
  if (typeof window === "undefined") return `(min-width: ${FALLBACK_BREAKPOINT})`;
  const token = getComputedStyle(document.documentElement)
    .getPropertyValue("--breakpoint-md")
    .trim();
  return `(min-width: ${token || FALLBACK_BREAKPOINT})`;
}

// Returns the MediaQueryList, or null when `matchMedia` is unavailable
// (SSR, or jsdom unit tests where `window` exists but `matchMedia` does not).
function matchDesktop(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(desktopMediaQuery());
}

function subscribe(onChange: () => void): () => void {
  const query = matchDesktop();
  if (!query) return () => {};
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function getSnapshot(): boolean {
  return matchDesktop()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
