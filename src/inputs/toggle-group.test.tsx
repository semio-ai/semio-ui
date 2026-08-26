import { expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Size, Variant } from "../types";
import { ToggleGroup } from "./toggle-group";

// The pill is positioned from a layout effect so the browser never paints the
// unmeasured position, and that effect is wrapped to fall back to `useEffect`
// where there is no DOM.
//
// This does NOT detect removal of that wrapper. React 19 dropped the
// "useLayoutEffect does nothing on the server" warning, and a bare
// `useLayoutEffect` is simply a no-op in `renderToStaticMarkup` — measured by
// unwrapping it here, which leaves this green. What the test does pin is that a
// server render completes, emits the pill, and reports nothing on `console.error`
// for any reason. The wrapper stays because a layout effect has no business
// running where there is no layout, and because the warning could return; it is
// not load-bearing under React 19 and nothing here would say so if it went.
test("renders to static markup with no error reported", () => {
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
