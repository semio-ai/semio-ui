import { expect, test, describe } from "vitest";
import { render } from "vitest-browser-react";
import { Text, TextRole } from "./text";
import "./test-stylesheet";

/**
 * What the text roles claim, measured.
 *
 * Every assertion here reads a computed value and compares it against a **control that
 * must differ**. An appearance test that only checks a value is present agrees with
 * itself: the package's other browser tests run without the compiled stylesheet, where
 * every colour measures the same default black and any such assertion passes. Hence the
 * `test-stylesheet` import — without it this whole file would be measuring nothing.
 */

type Theme = "light" | "dark";
const ROLES = [TextRole.Value, TextRole.Label, TextRole.Caption, TextRole.Body];

/**
 * Renders under a theme, inside the app's real selection condition.
 *
 * The `select-none` wrapper is not decoration: `LayoutRoot` sets it app-wide, so a role
 * that forgets to opt back in is unselectable in the product and perfectly selectable in
 * a test that leaves the wrapper out. The theme class goes on `<html>` to match how the
 * app sets it.
 */
function withTheme<T>(theme: Theme, node: React.ReactNode, read: (root: HTMLElement) => T): T {
  const html = document.documentElement;
  const previous = html.className;
  html.className = theme === "dark" ? "dark" : "";
  const host = document.createElement("div");
  document.body.appendChild(host);
  try {
    const view = render(<div className="select-none">{node}</div>, { container: host });
    const result = read(host);
    view.unmount();
    return result;
  } finally {
    host.remove();
    html.className = previous;
  }
}

const readRole = (theme: Theme, role: TextRole, className?: string) =>
  withTheme(
    theme,
    <Text role={role} className={className}>
      sample
    </Text>,
    (host) => {
      const el = host.querySelector<HTMLElement>(`.${role}`);
      if (!el) throw new Error(`no element carrying ${role}`);
      const style = getComputedStyle(el);
      return {
        color: style.color,
        fontSize: style.fontSize,
        textTransform: style.textTransform,
        userSelect: style.userSelect || style.webkitUserSelect,
        selectionTint: style.getPropertyValue("--text-role-selection-color").trim(),
      };
    },
  );

describe("a role carries both halves of its theme pair", () => {
  /**
   * The defect this whole change exists to remove: a foreground reviewed in one mode and
   * shipped in two. A role whose `dark:` half went missing measures identically here.
   */
  test.each(ROLES)("%s paints differently in light and dark", (role) => {
    const light = readRole("light", role);
    const dark = readRole("dark", role);
    expect(light.color).not.toBe(dark.color);
  });

  /** The colour has to be a real one, not the default black every unstyled test reports. */
  test("the stylesheet is actually loaded, so the test above can fail", () => {
    expect(readRole("light", TextRole.Value).color).not.toBe("rgb(0, 0, 0)");
    expect(readRole("light", TextRole.Value).fontSize).toBe("14px");
  });
});

describe("selection follows the role, not the size", () => {
  /**
   * `caption` and `label` are the pair that proves a size scale cannot carry this rule:
   * identical rung, identical colour, and opposite answers to "can a reader select it?".
   * Anything keyed on size would have to give them the same answer.
   */
  test("caption and label are the same size and colour", () => {
    const caption = readRole("light", TextRole.Caption);
    const label = readRole("light", TextRole.Label);
    expect(label.fontSize).toBe(caption.fontSize);
    expect(label.color).toBe(caption.color);
  });

  test("and still differ on selectability and case", () => {
    const caption = readRole("light", TextRole.Caption);
    const label = readRole("light", TextRole.Label);
    expect(caption.userSelect).toBe("text");
    expect(label.userSelect).not.toBe("text");
    expect(label.textTransform).toBe("uppercase");
    expect(caption.textTransform).toBe("none");
  });

  test.each([TextRole.Value, TextRole.Caption, TextRole.Body])(
    "%s opts back in under the app's select-none root",
    (role) => {
      expect(readRole("light", role).userSelect).toBe("text");
    },
  );

  /**
   * The control for the three above. Without it, a `select-none` wrapper that silently
   * stopped applying would make them pass for the wrong reason — every element is
   * selectable by default, so "is selectable" is the ambient answer.
   *
   * ⚠ `toBe("none")`, not `not.toBe("text")`. Measured in Chromium, a label computes
   * `none` inside the wrapper and `auto` without it, and `not.toBe("text")` is satisfied
   * by both — so the negated form passes in exactly the scenario this control exists to
   * detect. It also fails to notice `select-auto` landing on `.text-role-label`, which
   * would make chrome selectable in the product with the suite still green.
   */
  test("chrome stays unselectable, so the wrapper is really in force", () => {
    expect(readRole("light", TextRole.Label).userSelect).toBe("none");
  });
});

describe("the selection tint resolves outside a .responsive subtree", () => {
  /**
   * `--accent-color` is declared on `.responsive`, which `LayoutRoot` does NOT carry, so
   * ordinary copy falls through to the role's own fallback. If that fallback were missing
   * the property would resolve empty and selection would paint the browser default —
   * which is invisible in a screenshot, and is exactly what this change set out to fix.
   */
  test.each(ROLES)("%s resolves a tint in both themes, and they differ", (role) => {
    const light = readRole("light", role).selectionTint;
    const dark = readRole("dark", role).selectionTint;
    expect(light).not.toBe("");
    expect(dark).not.toBe("");
    expect(light).not.toBe(dark);
  });
});

describe("a caller's text utility overrides the role in BOTH themes", () => {
  /**
   * The reason the pair lives in a components-layer class rather than in utilities the
   * component spreads.
   *
   * Utilities sit in a later cascade layer than components, so ONE `text-neutral-500`
   * from a caller beats both halves of the role's pair and the override is total. Had the
   * component spread its own utilities instead, the caller's class and the component's
   * `dark:` class would be two utilities in one layer, both would survive, and dark mode
   * would keep the component's colour — a half-override that reintroduces the defect.
   *
   * The control is the same role measured without the utility, which must still differ by
   * theme. Without it this test would pass against a role that had no dark half at all.
   */
  test("overridden light and dark match each other, while the role's own do not", () => {
    const plainLight = readRole("light", TextRole.Value).color;
    const plainDark = readRole("dark", TextRole.Value).color;
    expect(plainLight).not.toBe(plainDark);

    const overriddenLight = readRole("light", TextRole.Value, "text-neutral-500").color;
    const overriddenDark = readRole("dark", TextRole.Value, "text-neutral-500").color;
    expect(overriddenLight).toBe(overriddenDark);
    expect(overriddenLight).not.toBe(plainLight);
    expect(overriddenDark).not.toBe(plainDark);
  });
});

describe("the component", () => {
  test("renders the element `as` names and puts className on it", () => {
    const { container } = render(
      <Text role={TextRole.Label} as="dt" className="truncate">
        Owner
      </Text>,
    );
    const dt = container.querySelector("dt");
    expect(dt).not.toBeNull();
    expect(dt?.classList.contains("truncate")).toBe(true);
    expect(dt?.classList.contains(TextRole.Label)).toBe(true);
  });

  test("passes a ref through as an ordinary React 19 prop", () => {
    let received: HTMLElement | null = null;
    render(
      <Text
        role={TextRole.Value}
        ref={(node) => {
          received = node;
        }}
      >
        value
      </Text>,
    );
    expect(received).not.toBeNull();
    expect((received as unknown as HTMLElement).textContent).toBe("value");
  });
});
