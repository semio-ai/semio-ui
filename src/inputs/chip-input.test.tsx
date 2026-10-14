import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChipInput } from "./chip-input";

const renderInput = (
  readOnly: boolean,
  allowCustomValues = true,
  selectedValues = ["arm", "robot"],
  subtle = false,
) =>
  renderToStaticMarkup(
    <ChipInput
      selectedValues={selectedValues}
      options={[{ value: "gripper", label: "Gripper" }]}
      onChange={() => undefined}
      readOnly={readOnly}
      allowCustomValues={allowCustomValues}
      subtle={subtle}
    />,
  );

describe("ChipInput readOnly", () => {
  it("keeps selected chips without remove or add controls in either input mode", () => {
    for (const custom of [true, false]) {
      const html = renderInput(true, custom);
      expect(html.match(/data-slot="label"/g)).toHaveLength(2);
      expect(html).toContain(">arm</div>");
      expect(html).toContain(">robot</div>");
      expect(html).not.toMatch(/<(button|input)\b/);
    }
  });

  it("has no focus, editing hover, cursor, or disabled dimming affordances", () => {
    for (const subtle of [false, true]) {
      const html = renderInput(true, true, ["arm", "robot"], subtle);
      expect(html).not.toMatch(/tabindex=|role="button"|variant-responsive|cursor-|opacity-50/);
      expect(html.match(/variant-static-bg/g)).toHaveLength(2);
    }
  });

  it("keeps editors' remove buttons, add input, and options dropdown", () => {
    const html = renderInput(false);
    expect(html.match(/data-slot="label"/g)).toHaveLength(2);
    expect(html.match(/<button\b/g)).toHaveLength(3);
    expect(html).toContain("<input");
  });

  it("shows a neutral empty value instead of an editing prompt", () => {
    expect(renderInput(true, true, [])).toContain("—");
    expect(renderInput(true, true, [])).not.toContain("Type and press Enter");
    const html = renderToStaticMarkup(
      <ChipInput selectedValues={[]} options={[]} readOnly placeholder="No tags" />,
    );
    expect(html).toContain("No tags");
  });
});
