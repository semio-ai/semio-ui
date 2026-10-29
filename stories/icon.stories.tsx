import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Icon,
  IconProvider,
  DisclosureIcon,
  KeyIcon,
  defaultIconRegistry,
  roleIconRegistry,
  type IconName,
} from "@semio/ui";
import { IconHeart, IconPlus, IconMinus } from "@tabler/icons-react";
import { figmaNode } from "./figma-links";

/**
 * Visual coverage for the icon registry: the default registry gallery, semantic
 * role keys, standardized sizing, `IconProvider` overrides, the unknown-name
 * fallback, and the stateful wrappers (`DisclosureIcon`, `KeyIcon`).
 */
const meta: Meta<typeof Icon> = {
  component: Icon,
  title: "ui/Icon",
  parameters: { design: { type: "figma", url: figmaNode("145-40") } },
  decorators: [
    (Story) => (
      <div className="p-6 text-neutral-800 dark:text-neutral-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Icon>;

/** A labeled, fixed-size slot so icon proportions are visible and comparable. */
function Cell({ name, label }: { name: IconName; label?: string }) {
  return (
    <div className="flex w-24 flex-col items-center gap-1">
      <div className="grid size-9 place-items-center rounded-sm bg-neutral-200 dark:bg-neutral-700">
        <Icon name={name} />
      </div>
      <span className="truncate text-[10px] opacity-70">{label ?? name}</span>
    </div>
  );
}

function Gallery({ keys }: { keys: IconName[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {keys.map((k) => (
        <Cell key={k} name={k} />
      ))}
    </div>
  );
}

/** The whole default registry — catches a missing/broken glyph at a glance. */
export const DefaultRegistry: Story = {
  // `Object.keys` widens to `string[]`; these are by definition registry keys.
  render: () => <Gallery keys={Object.keys(defaultIconRegistry).sort() as IconName[]} />,
};

/** The semantic role keys — named for their UI function, not their glyph. */
export const RoleKeys: Story = {
  render: () => <Gallery keys={Object.keys(roleIconRegistry).sort() as IconName[]} />,
};

/** Standardized sizing: `standard` (60%), `larger` (70%), `none` (bespoke). */
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-6">
      {(["standard", "larger", "none"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <div className="grid size-9 place-items-center rounded-sm bg-neutral-200 dark:bg-neutral-700">
            <Icon name="home" size={size} className={size === "none" ? "size-5" : undefined} />
          </div>
          <span className="text-[10px] opacity-70">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `IconProvider` overrides a role key for its subtree (nearest-wins, merges over
 * the default). Here `close` is re-skinned to a heart inside the provider only.
 */
export const ProviderOverride: Story = {
  render: () => (
    <div className="flex gap-10">
      <div className="flex flex-col items-center gap-2">
        <Cell name="close" label="default close" />
      </div>
      <IconProvider registry={{ close: IconHeart }}>
        <div className="flex flex-col items-center gap-2">
          <Cell name="close" label="overridden close" />
        </div>
      </IconProvider>
    </div>
  ),
};

/** Unknown names render nothing (and warn in dev). */
export const UnknownFallback: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-sm bg-neutral-200 dark:bg-neutral-700">
        {/* @ts-expect-error: An unregistered name exercises the runtime fallback. */}
        <Icon name="definitely-not-a-real-icon" />
      </div>
      <span className="text-xs opacity-70">
        renders nothing — check the console for the dev warning
      </span>
    </div>
  ),
};

/**
 * `DisclosureIcon`: with the default registry both keys are the same chevron, so
 * it rotates between open/closed. Override the pair with two different glyphs
 * (here plus/minus) and it swaps instead — same consuming markup either way.
 */
export const Disclosure: Story = {
  render: () => (
    <div className="flex gap-10">
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-3">
          <DisclosureIcon open={false} className="size-5" />
          <DisclosureIcon open className="size-5" />
        </div>
        <span className="text-[10px] opacity-70">default: rotates (closed / open)</span>
      </div>
      <IconProvider registry={{ "disclosure-closed": IconPlus, "disclosure-open": IconMinus }}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-3">
            <DisclosureIcon open={false} className="size-5" />
            <DisclosureIcon open className="size-5" />
          </div>
          <span className="text-[10px] opacity-70">overridden: swaps (+ / −)</span>
        </div>
      </IconProvider>
    </div>
  ),
};

/** `KeyIcon`: typed state props forwarded through the `key` role. */
export const Key: Story = {
  render: () => (
    <div className="flex gap-6">
      {[
        { label: "filled", props: {} },
        { label: "outline", props: { fillOpacity: 0 } },
        { label: "partial", props: { fillOpacity: 0.5 } },
        { label: "dashed", props: { dashed: true, fillOpacity: 0 } },
        { label: "+ center", props: { fillOpacity: 0, center: "plus" as const } },
        { label: "− center", props: { fillOpacity: 0, center: "minus" as const } },
        { label: "dashed", props: { dashed: true, fillOpacity: 0.5 } },
        { label: "+ partial", props: { fillOpacity: 0.5, center: "plus" as const } },
        { label: "− partial", props: { fillOpacity: 0.5, center: "minus" as const } },
      ].map(({ label, props }) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div className="grid size-9 place-items-center rounded-sm bg-neutral-200 dark:bg-neutral-700">
            <KeyIcon {...props} />
          </div>
          <span className="text-[10px] opacity-70">{label}</span>
        </div>
      ))}
    </div>
  ),
};
