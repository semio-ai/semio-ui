import { useCallback, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Text, TextRole } from "@semio/ui";

/**
 * The four text roles, side by side in both themes.
 *
 * Both themes render at once rather than through the toolbar's theme switch, because the
 * thing worth checking is the PAIR. A light foreground with no dark counterpart looks
 * completely fine in the mode you happen to be viewing — that is the entire reason the
 * defect survives review — and toggling puts the two halves a second and a context switch
 * apart. Adjacent, a missing or unchanged half is obvious at a glance.
 */
const meta: Meta<typeof Text> = {
  component: Text,
  title: "ui/Text",
};

export default meta;
type Story = StoryObj<typeof Text>;

/**
 * What each role resolves to, for the reader. Optional: a role with no entry still
 * appears below, carrying a placeholder — the list itself comes from the enum, so a role
 * added during a migration shows up here without anyone remembering this file.
 */
const NOTES: Partial<Record<TextRole, string>> = {
  [TextRole.Value]: "14px · full contrast · selectable",
  [TextRole.Label]: "12px · muted · uppercase · CHROME",
  [TextRole.Caption]: "12px · muted · selectable",
  [TextRole.Body]: "14px · mid contrast · selectable",
};

const ROLES = Object.values(TextRole).map((role) => ({
  role,
  name: role.replace("text-role-", ""),
  note: NOTES[role] ?? "⚠ no note yet — add one to NOTES in text.stories.tsx",
}));

/**
 * One themed panel.
 *
 * ⚠ The `select-none` is not styling — it reproduces `LayoutRoot`, which sets it on the
 * app root so the product reads as an application rather than a document. Without it
 * every role here would be selectable and the selection story below would show nothing,
 * which is the one way this story could look right while telling you nothing.
 */
function Panel({ theme, children }: { theme: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="rounded-sm border border-neutral-500/20 bg-white p-4 select-none dark:bg-neutral-900">
        <Text role={TextRole.Label} as="h3" className="mb-3 block">
          {theme}
        </Text>
        {children}
      </div>
    </div>
  );
}

/** The roles in isolation, each with what it resolves to. */
function RoleList() {
  return (
    <dl className="flex flex-col gap-3">
      {ROLES.map(({ role, name, note }) => (
        <div key={name} className="flex flex-col gap-0.5">
          <Text role={TextRole.Label} as="dt">
            {name}
          </Text>
          <Text role={role} as="dd">
            The quick brown fox jumps over the lazy dog
          </Text>
          <Text role={TextRole.Caption} as="dd" className="opacity-70">
            {note}
          </Text>
        </div>
      ))}
    </dl>
  );
}

export const Roles: Story = {
  name: "Roles, light and dark",
  render: () => (
    <div className="grid gap-4 p-5 sm:grid-cols-2">
      <Panel theme="light">
        <RoleList />
      </Panel>
      <Panel theme="dark">
        <RoleList />
      </Panel>
    </div>
  ),
};

/** A fact list, which is where the roles sit next to each other in the product. */
function FactList() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Text role={TextRole.Value} as="h4" className="block font-semibold">
          Pepper Go
        </Text>
        <Text role={TextRole.Caption} className="block">
          @semio-ai · updated 3 days ago
        </Text>
      </div>
      <Text role={TextRole.Body} as="p" className="block">
        A humanoid upper-body platform used for interaction research. The description runs long
        enough to show how body copy sits against the facts below it.
      </Text>
      <dl className="flex flex-col gap-1.5">
        {[
          ["Owner", "@semio-ai"],
          ["Visibility", "Public"],
          ["Version", "2.4.1"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <Text role={TextRole.Label} as="dt">
              {label}
            </Text>
            <Text role={TextRole.Value} as="dd" className="truncate">
              {value}
            </Text>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Selection, made visible.
 *
 * `::selection` cannot be inspected passively — nothing about a resting page shows it —
 * so this story selects the content for you. The point to look at is what does NOT
 * highlight: the labels, the panel headings and the field names are chrome, so dragging
 * across a fact list takes the values and leaves the scaffolding behind.
 */
export const Selection: Story = {
  name: "Selection follows the role",
  render: function SelectionStory() {
    return (
      <div className="flex flex-col gap-4 p-5">
        <Text role={TextRole.Caption} as="p">
          Select either panel. Values, captions and body highlight; labels do not, because they are
          chrome — so a drag across a fact list takes the values and leaves the field names behind.
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectablePanel theme="light" />
          <SelectablePanel theme="dark" />
        </div>
      </div>
    );
  },
};

/**
 * One panel with its own select button.
 *
 * ⚠ **A button per panel, not one button selecting both.** A `Selection` holds a single
 * range in every browser but Firefox, so a loop calling `addRange` twice silently keeps
 * only the first — which left the dark panel permanently unhighlighted and hid exactly
 * half of what this story exists to show. Two buttons, two independent selections.
 */
function SelectablePanel({ theme }: { theme: "light" | "dark" }) {
  const ref = useRef<HTMLDivElement>(null);

  const select = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !ref.current) return;
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    selection.addRange(range);
  }, []);

  return (
    <Panel theme={theme}>
      <div className="flex flex-col gap-3">
        <Button onClick={select}>Select this panel</Button>
        <div ref={ref}>
          <FactList />
        </div>
      </div>
    </Panel>
  );
}

/**
 * What a caller's `text-*` utility does to a role.
 *
 * The override is total rather than partial: utilities sit in a later cascade layer than
 * the role's class, so one `text-neutral-500` beats both halves of the pair and the two
 * panels below match. A component that spread its own utilities instead would be
 * half-overridden here — the caller's class winning in light mode while the component's
 * `dark:` class survived in dark — which is the defect this design avoids.
 */
export const Overriding: Story = {
  name: "Overriding a role",
  render: () => (
    <div className="grid gap-4 p-5 sm:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex flex-col gap-2">
            <Text role={TextRole.Caption}>role only</Text>
            <Text role={TextRole.Value} as="p">
              Painted by the role
            </Text>
            <Text role={TextRole.Caption}>role + className=&quot;text-neutral-500&quot;</Text>
            <Text role={TextRole.Value} as="p" className="text-neutral-500">
              Painted by the caller, in both themes
            </Text>
          </div>
        </Panel>
      ))}
    </div>
  ),
};
