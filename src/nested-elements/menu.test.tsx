// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { NestedChild } from "./configured-render";

vi.mock("../hooks/use-layout-state", () => ({ useLayoutState: () => ({ desktop: false }) }));
afterEach(cleanup);

it("configured submenus render their trailing indicator beside the disclosure", () => {
  render(
    <NestedChild
      type="menu"
      id="invitations"
      label="Invitations"
      right={<span aria-label="Pending invitations">!</span>}
    >
      {[]}
    </NestedChild>,
  );
  const trigger = screen.getByRole("button", { name: "Invitations Pending invitations" });
  const indicator = within(trigger).getByLabelText("Pending invitations");
  expect(indicator.parentElement?.className).toContain("right-1");
  expect(indicator.nextElementSibling).toBeTruthy();
});
