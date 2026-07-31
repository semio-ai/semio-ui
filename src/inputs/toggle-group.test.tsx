import { expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Size, Variant } from "../types";
import { ToggleGroup } from "./toggle-group";

// The pill is positioned from a layout effect so the browser never paints the
// unmeasured position. That effect is wrapped to fall back to `useEffect` where
// there is no DOM — this guards the wrapper, because unwrapping it would warn
// (and silently do nothing) for any consumer rendering on a server.
test("renders to static markup without a layout-effect warning", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

  const html = renderToStaticMarkup(
    <ToggleGroup
      visuals="labels"
      size={Size.Md}
      value="b"
      onChange={() => undefined}
      options={[
        { value: "a", label: "One", variant: Variant.Primary },
        { value: "b", label: "Two", variant: Variant.Secondary },
      ]}
    />,
  );

  expect(html).toContain("data-toggle-pill");
  expect(consoleError.mock.calls.map((call) => String(call[0])).join("\n")).toBe("");
  consoleError.mockRestore();
});
