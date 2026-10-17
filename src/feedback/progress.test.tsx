import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Progress } from "./progress";

test("progress value and maximum attributes stay on both the bar and indicator", () => {
  const html = renderToStaticMarkup(<Progress progress={0.5} />);
  expect([...html.matchAll(/data-value="50"/g)]).toHaveLength(2);
  expect([...html.matchAll(/data-max="100"/g)]).toHaveLength(2);
  expect([...html.matchAll(/data-state="loading"/g)]).toHaveLength(2);
  expect(html).toContain('aria-valuetext="50%"');
});
