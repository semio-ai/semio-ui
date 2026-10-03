import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Variant } from "../types";
import { ProgressStepper } from "./stepper";
import "../test-stylesheet";

test("progress steps remain legible in dark mode and distinguish all three states", async () => {
  const html = document.documentElement;
  const previousClassName = html.className;
  html.classList.add("dark");

  try {
    const view = await render(
      <ProgressStepper
        label="Account setup progress"
        steps={["Verify email", "Set up account", "Ready"]}
        activeStep={1}
      />,
    );
    const steps = [...view.container.querySelectorAll<HTMLElement>("li")];
    expect(steps).toHaveLength(3);
    expect(steps[1].getAttribute("aria-current")).toBe("step");

    const markers = steps.map((step) => step.children[0].children[1] as HTMLElement);
    const fills = markers.map((marker) => getComputedStyle(marker).backgroundColor);
    const completedConnector = steps[0].children[0].children[2] as HTMLElement;
    const completedConnectorColor = getComputedStyle(completedConnector).backgroundColor;
    expect(new Set(fills).size).toBe(3);

    for (const step of steps) {
      const caption = step.lastElementChild as HTMLElement;
      expect(getComputedStyle(caption).color).not.toBe("rgb(0, 0, 0)");
    }

    const ring = getComputedStyle(markers[1]);
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(parseFloat(ring.outlineOffset)).toBeGreaterThanOrEqual(2);

    const leftConnector = steps[1].children[0].children[0] as HTMLElement;
    expect(
      markers[1].getBoundingClientRect().left - leftConnector.getBoundingClientRect().right,
    ).toBeGreaterThan(0);

    await view.rerender(
      <ProgressStepper
        label="Account setup progress"
        steps={["Verify email", "Set up account", "Ready"]}
        activeStep={1}
        completedVariant={Variant.Warning}
        currentVariant={Variant.Info}
        incompleteVariant={Variant.Tertiary}
      />,
    );
    const configuredFills = markers.map((marker) => getComputedStyle(marker).backgroundColor);
    configuredFills.forEach((fill, index) => expect(fill).not.toBe(fills[index]));
    expect(getComputedStyle(completedConnector).backgroundColor).not.toBe(completedConnectorColor);
  } finally {
    html.className = previousClassName;
  }
});
