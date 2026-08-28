import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Combobox, Dropdown, Modal, NestedItem, Size, Variant } from "@semio/ui";

/**
 * `portalContainer` on the overlay components: which element the popup's portal goes into.
 *
 * Every overlay in this package portals to the end of `<body>` by default and sets no
 * `z-index`, so it lands at `auto` in the root stacking context. That is sufficient against
 * ordinary page chrome, and it is deliberately not a number the library picks: a host with
 * its own stacking ladder is a page the library cannot see, so any value chosen here would
 * be a guess, and one that only ever has to be raised again.
 *
 * `portalContainer` is the way out for such a host. Hand an overlay the element whose
 * stacking context its popup should join, and the ordering becomes the host's to decide.
 *
 * The stories below put a `z-index: 100` scrim over the page — the shape of a host ladder —
 * and show the same overlay on both sides of that decision. The scrim is
 * `pointer-events: none` so the controls underneath stay usable; that affects hit testing
 * only, never paint order, so what you see is the real stacking.
 */
const meta: Meta = {
  title: "floating/PortalContainer",
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj;

const ITEMS = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
];

/**
 * A host's overlay layer: covers the viewport on its own `z-index`, and hands back an
 * element inside itself to use as a portal target.
 */
function HostLadder({ onContainer }: { onContainer?: (el: HTMLDivElement | null) => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-100 bg-black/50">
      <p className="p-4 font-mono text-xs text-white">host layer — z-index: 100</p>
      <div ref={onContainer ?? (() => {})} />
    </div>
  );
}

/**
 * Both halves at once, so the difference is one screenshot rather than two.
 *
 * The left popup takes the default portal and paints **under** the host layer — you are
 * seeing it through the scrim, dimmed. The right popup was given a container inside that
 * layer and paints **over** it, at full contrast. Neither popup carries a `z-index`.
 */
export const DefaultPortalVersusAHostContainer: Story = {
  render: function Render() {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [left, setLeft] = useState("alpha");
    const [right, setRight] = useState("alpha");
    return (
      <div className="relative grid h-dvh grid-cols-2 items-start gap-8 p-8 pt-20">
        <div>
          <p className="mb-40 text-sm">Default portal — under the host layer</p>
          <Combobox options={ITEMS} value={left} onChange={setLeft} open />
        </div>
        <div>
          <p className="mb-40 text-sm">portalContainer — over the host layer</p>
          <Combobox
            options={ITEMS}
            value={right}
            onChange={setRight}
            open
            portalContainer={container}
          />
        </div>
        <HostLadder onContainer={setContainer} />
      </div>
    );
  },
};

/**
 * `Dropdown` takes the same prop, portalled into the host layer so its menu paints above
 * the scrim.
 */
export const DropdownIntoTheHostLadder: Story = {
  render: function Render() {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    return (
      <div className="relative h-dvh p-8 pt-24">
        <Dropdown
          trigger={<Button size={Size.Md}>Open menu</Button>}
          side="bottom"
          portalContainer={container}
        >
          <NestedItem>Alpha</NestedItem>
          <NestedItem>Beta</NestedItem>
          <NestedItem>Gamma</NestedItem>
        </Dropdown>
        <HostLadder onContainer={setContainer} />
      </div>
    );
  },
};

/**
 * The modals take it too, backdrop included — so a host embedding this library inside its
 * own dialog stack can place the whole modal where it belongs.
 *
 * Inspect the DOM to see it: the dialog subtree is inside the container `div`, not a
 * sibling of `#storybook-root`.
 */
export const ModalIntoAContainer: Story = {
  render: function Render() {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    return (
      <div className="relative h-dvh p-8">
        <div ref={setContainer} data-testid="modal-host-container" />
        <Button size={Size.Md} variant={Variant.Primary} onClick={() => setOpen(true)}>
          Open modal in a container
        </Button>
        <Modal
          open={open}
          title="Portalled into a host element"
          description="Backdrop and popup both render inside the container."
          onStateChange={setOpen}
          onCancel={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
          portalContainer={container}
        >
          <p className="text-sm">
            This whole dialog subtree lives inside the container div above the button.
          </p>
        </Modal>
      </div>
    );
  },
};
