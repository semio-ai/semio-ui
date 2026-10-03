import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, EmptyState, Size, Text, TextRole, Variant } from "@semio/ui";

/**
 * `EmptyState` in both themes at once.
 *
 * Side by side rather than through the toolbar's theme switch, because what matters is
 * the pair: a glyph or sentence tuned in one theme looks fine there and falls below the
 * surrounding text's contrast in the other. Each panel carries a line of ordinary body
 * text above the empty state so its contrast can be read against something.
 */
const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  title: "ui/EmptyState",
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

function Panel({ theme, children }: { theme: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="card flex flex-col gap-4 rounded-sm p-4">
        <Text role={TextRole.Label} as="h3">
          {theme}
        </Text>
        <Text role={TextRole.Body} as="p">
          Surrounding body text, for comparison.
        </Text>
        {children}
      </div>
    </div>
  );
}

function BothThemes({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Panel theme="light">{children}</Panel>
      <Panel theme="dark">{children}</Panel>
    </div>
  );
}

/** A listing with nothing in it, and the next step. */
export const WithAction: Story = {
  render: () => (
    <BothThemes>
      <EmptyState
        icon="add-file"
        className="min-h-48"
        actions={
          <Button size={Size.Sm} variant={Variant.Info} visuals="inverted-border">
            Browse the marketplace
          </Button>
        }
      >
        You have no published assets yet. Ones you publish, are given access to, or add appear here.
      </EmptyState>
    </BothThemes>
  ),
};

/** Standing in for a whole page: a heading as well as the sentence. */
export const WithTitle: Story = {
  render: () => (
    <BothThemes>
      <EmptyState
        icon="info"
        title="Not available"
        className="min-h-48"
        actions={
          <Button size={Size.Sm} visuals="inverted-border" leftIcon="retry">
            Try again
          </Button>
        }
      >
        This doesn&apos;t exist, or you don&apos;t have access to it.
      </EmptyState>
    </BothThemes>
  ),
};

/** Only the sentence — no glyph, title or action. */
export const SentenceOnly: Story = {
  render: () => (
    <BothThemes>
      <EmptyState className="min-h-24">
        Nothing selected. Pick an item to see its details here.
      </EmptyState>
    </BothThemes>
  ),
};
