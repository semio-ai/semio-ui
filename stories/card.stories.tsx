import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, CardGrid, Chip, Icon, Size, Variant } from "@semio/ui";

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

/**
 * `CardGrid` adds selection and two-dimensional keyboard navigation: Left/Right
 * step one card, Up/Down step a whole row, Home/End jump to the ends, Enter
 * activates, and Cmd/Ctrl+Arrow moves focus without changing the selection.
 *
 * The row step is derived from the *measured* column count, so it stays correct as
 * the responsive `grid-cols-*` classes change it — resize the preview and the
 * vertical arrows follow.
 */
export const InteractiveGrid: Story = {
  render: () => {
    const items = [
      "Quori",
      "Reception Bot",
      "Wave",
      "Friendly Face",
      "Pepper",
      "Greeter Body",
      "Idle Blink",
      "Neutral Face",
    ].map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }));

    return (
      <div className="w-[52rem]">
        <CardGrid
          data={items}
          getItemId={(item) => item.id}
          ariaLabel="Example cards"
          className="grid-cols-2 gap-3 lg:grid-cols-4"
          selectionMode="single"
          getSearchText={(item) => item.name}
        >
          {(item, { selected }) => (
            <Card
              media={<Icon name="box" size="none" className="size-10 opacity-30" />}
              title={item.name}
              titleTrailing={
                <Chip size={Size.Xs} variant={Variant.Tertiary}>
                  Model
                </Chip>
              }
              selected={selected}
              interactive
              primaryAction={
                <Button size={Size.Sm} variant={Variant.Tertiary} visuals="inverted-border">
                  Open
                </Button>
              }
            >
              <MetaLine>{selected ? "Selected" : "Click or arrow to select"}</MetaLine>
            </Card>
          )}
        </CardGrid>
      </div>
    );
  },
};

/**
 * `primaryAction` renders full-width across the bottom. It is distinct from
 * `footer` on purpose: it encodes that a card face carries exactly ONE verb, with
 * anything additional belonging to a preview, the item's own page, or an overflow
 * menu rather than competing for the face.
 */
export const PrimaryAction: Story = {
  render: () => (
    <div className="flex w-[38rem] flex-row gap-3">
      {[
        { title: "Published asset", verb: "Go to page", icon: "external-link" as const },
        { title: "Project asset", verb: "Open in project", icon: "chevron-right" as const },
      ].map((item) => (
        <div key={item.title} className="w-72">
          <Card
            media={<Icon name="box" size="none" className="size-10 opacity-30" />}
            mediaCorner={
              <Button size={Size.Sm} visuals="inverted" leftIcon="menu" altText="More actions" />
            }
            title={item.title}
            primaryAction={
              <Button
                size={Size.Sm}
                variant={Variant.Info}
                visuals="inverted-border"
                rightIcon={item.icon}
              >
                {item.verb}
              </Button>
            }
          >
            <MetaLine>One verb on the face; the rest lives elsewhere.</MetaLine>
          </Card>
        </div>
      ))}
    </div>
  ),
};

/**
 * `selected` and `interactive` use the same intensities as
 * `defaultResolveRowVisual`, so a selected card matches a selected row: an 18%
 * accent tint plus an accent border, and 8% on hover. Hover the unselected card —
 * and hover the selected one, which must keep its highlight rather than lose it
 * under the cursor.
 */
export const SelectedAndHover: Story = {
  render: () => (
    <div className="flex w-[38rem] flex-row gap-3">
      {[
        { title: "Selected", selected: true },
        { title: "Not selected", selected: false },
      ].map((item) => (
        <div key={item.title} className="w-72">
          <Card
            media={<Icon name="box" size="none" className="size-10 opacity-30" />}
            title={item.title}
            selected={item.selected}
            interactive
            primaryAction={
              <Button size={Size.Sm} variant={Variant.Tertiary} visuals="inverted-border">
                Open
              </Button>
            }
          >
            <MetaLine>{item.selected ? "18% accent tint" : "8% on hover"}</MetaLine>
          </Card>
        </div>
      ))}
    </div>
  ),
};

/**
 * Fixed-width tracks, and where the leftover width goes.
 *
 * `repeat(auto-fill, minmax(min(280px, 100%), 280px))` keeps every card exactly one
 * size and lets the COUNT change with the container — the inverse of a
 * `grid-cols-N` ladder, which fixes the count and lets each card slide. Below one
 * card's width the `min()` lets the single column shrink, so it scales rather than
 * overflowing.
 *
 * Fixed tracks are what make `justify` mean anything: `1fr` tracks absorb the spare
 * width themselves and leave nothing to justify. Resize the frame to watch the
 * column count step, and compare where the slack lands.
 */
export const FixedWidthTracks: Story = {
  parameters: { layout: "padded" },
  render: () => {
    const tracks = "repeat(auto-fill, minmax(min(280px, 100%), 280px))";
    const options = ["start", "center", "space-between"] as const;
    return (
      <div className="flex flex-col gap-8">
        {options.map((justify) => (
          <div key={justify} className="flex flex-col gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              justify=&quot;{justify}&quot;
            </span>
            <CardGrid
              data={[1, 2, 3, 4, 5].map((n) => ({ key: `card-${String(n)}`, n }))}
              getItemId={(item) => item.key}
              ariaLabel={`Cards justified ${justify}`}
              className="gap-3"
              style={{ gridTemplateColumns: tracks }}
              justify={justify}
            >
              {(item) => (
                <Card
                  media={<Icon name="box" size="none" className="size-10 opacity-30" />}
                  title={`Card ${String(item.n)}`}
                >
                  <MetaLine>Always 280px wide</MetaLine>
                </Card>
              )}
            </CardGrid>
          </div>
        ))}
      </div>
    );
  },
};
