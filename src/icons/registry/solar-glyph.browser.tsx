import { expect, test } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { Settings } from "@solar-icons/react-perf/LineDuotone";
import "../../test-stylesheet";
import { createSolarIcon } from "./solar-glyph";

const InvertedSettings = createSolarIcon(Settings, "icon-duotone-inverted");
const SettingsIcon = createSolarIcon(Settings);

test("Solar duotone secondary paths use 60% opacity", async () => {
  try {
    await render(<SettingsIcon data-testid="settings" />);
    const svg = document.querySelector('[data-testid="settings"]')!;
    const secondary = svg.querySelector('[opacity="0.5"]')!;
    expect(getComputedStyle(secondary).opacity).toBe("0.6");
  } finally {
    await cleanup();
  }
});

test("inverted duotone is styled by UI without Studio CSS", async () => {
  try {
    await render(<InvertedSettings data-testid="settings" />);
    const svg = document.querySelector('[data-testid="settings"]')!;
    const secondary = svg.querySelector('[opacity="0.5"]')!;
    const primary = svg.querySelector(":scope > :not([opacity])")!;
    expect(getComputedStyle(secondary).opacity).toBe("1");
    expect(getComputedStyle(primary).opacity).toBe("0.6");
  } finally {
    await cleanup();
  }
});
