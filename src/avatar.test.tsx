import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar keyboard accessibility", () => {
  it("adds tabIndex=0 and role=button when onClick is provided", () => {
    const html = renderToStaticMarkup(
      <Avatar alt="Test User" onClick={vi.fn()} />,
    );

    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
  });

  it("omits tabIndex and role when onClick is not provided", () => {
    const html = renderToStaticMarkup(<Avatar alt="Test User" />);

    expect(html).not.toContain('role="button"');
    expect(html).not.toContain("tabindex");
  });
});
