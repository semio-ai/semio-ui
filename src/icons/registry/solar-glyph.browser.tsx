import { expect, test } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { Settings } from "@solar-icons/react-perf/LineDuotone";
import "../../test-stylesheet";
import { createSolarIcon } from "./solar-glyph";

const InvertedSettings = createSolarIcon(Settings, "icon-duotone-inverted");

test("inverted duotone is styled by UI without Studio CSS", () => {
  try {
    render(<InvertedSettings data-testid="settings" />);
    const svg = document.querySelector('[data-testid="settings"]')!;
    const secondary = svg.querySelector('[opacity="0.5"]')!;
    const primary = svg.querySelector(":scope > :not([opacity])")!;
    expect(getComputedStyle(secondary).opacity).toBe("1");
    expect(getComputedStyle(primary).opacity).toBe("0.5");
  } finally {
    cleanup();
  }
});
