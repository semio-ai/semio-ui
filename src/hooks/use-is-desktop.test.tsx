// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsDesktop } from "./use-is-desktop";

/**
 * Minimal `MediaQueryList` stub whose `matches` can be flipped and whose
 * registered `change` listener can be fired to simulate a viewport crossing.
 */
function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql = {
    matches: initialMatches,
    media: "(min-width: 48rem)",
    addEventListener: (_type: string, cb: (e: { matches: boolean }) => void) => {
      listeners.add(cb);
    },
    removeEventListener: (_type: string, cb: (e: { matches: boolean }) => void) => {
      listeners.delete(cb);
    },
  };
  const matchMedia = vi.fn(() => mql as unknown as MediaQueryList);
  window.matchMedia = matchMedia as unknown as typeof window.matchMedia;
  return {
    matchMedia,
    set(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
    listenerCount: () => listeners.size,
  };
}

describe("useIsDesktop", () => {
  afterEach(() => {
    // jsdom doesn't define matchMedia; remove any stub between tests.
    delete (window as { matchMedia?: unknown }).matchMedia;
    vi.restoreAllMocks();
  });

  it("returns false (instead of throwing) when matchMedia is unavailable", () => {
    // jsdom provides `window` but not `window.matchMedia`.
    expect(window.matchMedia).toBeUndefined();
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });

  it("reflects the current match state on mount", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  it("updates when the media query change event fires (both directions)", () => {
    const mm = stubMatchMedia(false);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);

    act(() => mm.set(true));
    expect(result.current).toBe(true);

    // Symmetric: going back to mobile must also update (the WebKit/range-syntax
    // latch this hook was written to avoid).
    act(() => mm.set(false));
    expect(result.current).toBe(false);
  });

  it("queries with min-width syntax and cleans up its listener on unmount", () => {
    const mm = stubMatchMedia(true);
    const { unmount } = renderHook(() => useIsDesktop());
    expect(mm.matchMedia).toHaveBeenCalled();
    expect(mm.matchMedia.mock.calls[0][0]).toContain("min-width");
    expect(mm.listenerCount()).toBe(1);
    unmount();
    expect(mm.listenerCount()).toBe(0);
  });
});
