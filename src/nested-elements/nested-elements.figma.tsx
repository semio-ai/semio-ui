import figma from "@figma/code-connect";
import { Variant } from "../types";
import { NestedItem } from "./item";
import { NestedLabel } from "./label";
import { NestedSeparator } from "./separator";
import { NestedRadio } from "./radio";
import { NestedCheckbox } from "./checkbox";
import { NestedSelect } from "./select";
import { NestedMenu } from "./menu";

/**
 * Code Connect for the nested-elements menu primitives (NestedItem / NestedLabel /
 * NestedSeparator). These render inside a Dropdown/ContextMenu (NestedParent
 * context); the Figma components are the menu-row visuals.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * NestedItem: `Variant=default` ↔ `variant`; the Figma `State` axis carries the
 * `data-highlighted` interaction (highlighted = 50% accent bg + white text) and
 * maps `disabled` to the prop. `Show icon`/`Icon` → the `left` slot; the `right`
 * slot (shortcut/submenu content) is arbitrary JSX, so it's illustrative only.
 */
figma.connect(NestedItem, "<SEMIO_UI_LIBRARY>?node-id=554-772", {
  props: {
    children: figma.string("Label"),
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      error: Variant.Error,
    }),
    left: figma.boolean("Show icon", {
      true: figma.instance("Icon"),
      false: undefined,
    }),
    // `right` is arbitrary JSX (shortcut hint / submenu chevron); the Show shortcut
    // toggle gates its presence, shown here with a representative shortcut string.
    right: figma.boolean("Show shortcut", { true: "⌘K", false: undefined }),
    disabled: figma.enum("State", { disabled: true, default: false, highlighted: false }),
  },
  example: ({ children, variant, left, right, disabled }) => (
    <NestedItem variant={variant} left={left} right={right} disabled={disabled}>
      {children}
    </NestedItem>
  ),
});

figma.connect(NestedLabel, "<SEMIO_UI_LIBRARY>?node-id=555-724", {
  props: { children: figma.string("Label") },
  example: ({ children }) => <NestedLabel>{children}</NestedLabel>,
});

figma.connect(NestedSeparator, "<SEMIO_UI_LIBRARY>?node-id=555-726", {
  example: () => <NestedSeparator />,
});

// The sub-type rows: NestedItem chrome + a left selection indicator (shown when
// selected). NestedCheckbox is a single labeled item (clean map); NestedRadio /
// NestedSelect are options-array-driven groups, so a single Figma row maps to a
// one-option example (illustrative).
figma.connect(NestedCheckbox, "<SEMIO_UI_LIBRARY>?node-id=562-782", {
  props: {
    label: figma.string("Label"),
    value: figma.enum("State", { checked: true, unchecked: false }),
  },
  example: ({ label, value }) => (
    <NestedCheckbox label={label} value={value} onChange={() => undefined} />
  ),
});

// The parser is static (no inline logic in `example`), so State drives value via
// figma.enum against the option's fixed value: State=selected selects "opt".
figma.connect(NestedRadio, "<SEMIO_UI_LIBRARY>?node-id=562-767", {
  props: {
    label: figma.string("Label"),
    value: figma.enum("State", { selected: "opt", unselected: "" }),
  },
  example: ({ label, value }) => (
    <NestedRadio value={value} onChange={() => undefined} options={[{ value: "opt", label }]} />
  ),
});

figma.connect(NestedSelect, "<SEMIO_UI_LIBRARY>?node-id=563-769", {
  props: {
    label: figma.string("Label"),
    values: figma.enum("State", { selected: ["opt"], unselected: [] }),
  },
  example: ({ label, values }) => (
    <NestedSelect values={values} onChange={() => undefined} options={[{ value: "opt", label }]} />
  ),
});

// NestedMenu: the submenu trigger row (NestedItem chrome + right chevron). The
// `children` (submenu content) is contextual; `State` is the highlight interaction.
figma.connect(NestedMenu, "<SEMIO_UI_LIBRARY>?node-id=586-833", {
  props: {
    label: figma.string("Label"),
    left: figma.boolean("Show icon", { true: figma.instance("Icon"), false: undefined }),
  },
  example: ({ label, left }) => (
    <NestedMenu label={label} left={left}>
      <span />
    </NestedMenu>
  ),
});
