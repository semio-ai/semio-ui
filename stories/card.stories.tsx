import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Chip, Icon, Size, Variant } from "@semio/ui";

const meta: Meta<typeof Card> = {
  component: Card,
  title: "ui/Card",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

/** A muted body line, as a consumer would write one. */
function MetaLine({ children }: { children: React.ReactNode }) {
  return (
    <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">{children}</span>
  );
}

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <Card
        media={<Icon name="box" size="none" className="size-10 opacity-30" />}
        mediaCorner={
          <Button size={Size.Sm} visuals="inverted" leftIcon="menu" altText="More actions" />
        }
        title="Quori"
        titleTrailing={
          <Chip size={Size.Xs} variant={Variant.Tertiary}>
            Model
          </Chip>
        }
        footer={
          <Button size={Size.Sm} variant={Variant.Tertiary} visuals="inverted-border">
            Add
          </Button>
        }
      >
        <MetaLine>@semio/quori</MetaLine>
        <MetaLine>Created by you · Owner · v1.2.0</MetaLine>
      </Card>
    </div>
  ),
};

/**
 * Cards in a grid stretch to a shared row height, and the footer's `mt-auto` is
 * what keeps the action row aligned across cards with unequal body content — the
 * middle card here has an extra line and the last has none.
 */
export const InAGrid: Story = {
  render: () => (
    <ul className="grid w-[52rem] grid-cols-3 gap-3">
      {[
        { name: "Quori", lines: ["@semio/quori", "Owner · v1.2.0"] },
        {
          name: "Reception Bot",
          lines: ["@semio/reception-bot", "Owner · v0.3.0", "3 dependencies"],
        },
        { name: "Wave", lines: [] },
      ].map((item) => (
        <li key={item.name}>
          <Card
            media={<Icon name="box" size="none" className="size-10 opacity-30" />}
            title={item.name}
            titleTrailing={
              <Chip size={Size.Xs} variant={Variant.Tertiary}>
                Model
              </Chip>
            }
            footer={
              <Button size={Size.Sm} variant={Variant.Tertiary} visuals="inverted-border">
                Add
              </Button>
            }
          >
            {item.lines.map((line) => (
              <MetaLine key={line}>{line}</MetaLine>
            ))}
          </Card>
        </li>
      ))}
    </ul>
  ),
};

/** Media and footer are both optional; without them the card is a titled panel. */
export const TitleAndBodyOnly: Story = {
  render: () => (
    <div className="w-72">
      <Card title="No preview, no actions">
        <MetaLine>The media slot is not rendered at all rather than</MetaLine>
        <MetaLine>collapsing to a zero-height band.</MetaLine>
      </Card>
    </div>
  ),
};

/** A real image should cover the slot; the slot's tint is the empty-state look. */
export const WithImageMedia: Story = {
  render: () => (
    <div className="w-72">
      <Card
        media={
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
            alt=""
            className="size-full object-cover"
          />
        }
        title="Covering media"
        footer={
          <Button size={Size.Sm} variant={Variant.Tertiary} visuals="inverted-border">
            Open
          </Button>
        }
      >
        <MetaLine>size-full object-cover</MetaLine>
      </Card>
    </div>
  ),
};

/** `footerAlign` distributes the footer row; `between` pins to both edges. */
export const FooterAlignment: Story = {
  render: () => (
    <div className="flex w-[38rem] flex-row gap-3">
      {(["start", "end", "between"] as const).map((align) => (
        <div key={align} className="w-56">
          <Card
            title={`footerAlign="${align}"`}
            footerAlign={align}
            footer={
              <>
                <Button size={Size.Sm} visuals="inverted">
                  Secondary
                </Button>
                <Button size={Size.Sm} variant={Variant.Tertiary} visuals="inverted-border">
                  Primary
                </Button>
              </>
            }
          >
            <MetaLine>Body line</MetaLine>
          </Card>
        </div>
      ))}
    </div>
  ),
};

/** The three media aspect ratios. */
export const MediaAspects: Story = {
  render: () => (
    <div className="flex w-[38rem] flex-row gap-3">
      {(["video", "square", "wide"] as const).map((aspect) => (
        <div key={aspect} className="w-56">
          <Card
            mediaAspect={aspect}
            media={<Icon name="box" size="none" className="size-10 opacity-30" />}
            title={`mediaAspect="${aspect}"`}
          />
        </div>
      ))}
    </div>
  ),
};
