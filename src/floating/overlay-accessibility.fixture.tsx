import { useEffect, useRef, useState, type ReactNode } from "react";
import { Combobox } from "../inputs/combobox";
import { NestedItem } from "../nested-elements/item";
import { NestedMenu } from "../nested-elements/menu";
import { ContextMenu as ContextMenuOverlay } from "./context-menu";
import { Dropdown as DropdownOverlay } from "./dropdown";
import { Modal as ModalOverlay } from "./modal";
import { Popover as PopoverOverlay } from "./popover";
import { SidebarModal } from "./sidebar-modal";
import { TooltipHost } from "./tooltip-3d/tooltip-host";
import { useTooltipStore } from "./tooltip-3d/store";

export enum OverlayEntry {
  Dropdown = "dropdown",
  DropdownSubmenu = "dropdown submenu",
  ContextMenu = "context menu",
  ContextSubmenu = "context submenu",
  CanvasMenu = "canvas context menu",
  CanvasPopover = "canvas click popover",
  Popover = "popover",
}

export enum DialogSurface {
  Modal = "modal",
  Sidebar = "sidebar modal",
}

const ANCHOR_ID = "overlay-accessibility";

function CanvasEntry({ children, popover }: { children: ReactNode; popover: boolean }) {
  const contentRef = useRef(children);
  contentRef.current = children;
  useEffect(() => {
    const store = useTooltipStore.getState();
    store.registerAnchor({
      id: ANCHOR_ID,
      content: () => contentRef.current,
      interactive: true,
      mode: popover ? "click" : "context-menu",
      positioning: {},
      screenPosition: { x: 80, y: 80 },
    });
    return () => store.unregisterAnchor(ANCHOR_ID);
  }, [popover]);
  return (
    <TooltipHost>
      <button
        type="button"
        onClick={() => useTooltipStore.getState().showTooltip(ANCHOR_ID, "button")}
      >
        Open menu
      </button>
    </TooltipHost>
  );
}

export function OverlayLauncher({
  entry,
  onLaunch,
}: {
  entry: OverlayEntry;
  onLaunch: () => void;
}) {
  const item = <NestedItem onClick={onLaunch}>New entity</NestedItem>;
  const submenu = <NestedMenu label="Create">{item}</NestedMenu>;
  switch (entry) {
    case OverlayEntry.Dropdown:
      return (
        <DropdownOverlay trigger={<button type="button">Open menu</button>}>{item}</DropdownOverlay>
      );
    case OverlayEntry.DropdownSubmenu:
      return (
        <DropdownOverlay trigger={<button type="button">Open menu</button>}>
          {submenu}
        </DropdownOverlay>
      );
    case OverlayEntry.ContextSubmenu:
      return (
        <ContextMenuOverlay content={submenu}>
          <button type="button">Open menu</button>
        </ContextMenuOverlay>
      );
    case OverlayEntry.ContextMenu:
      return (
        <ContextMenuOverlay content={item}>
          <button type="button">Open menu</button>
        </ContextMenuOverlay>
      );
    case OverlayEntry.CanvasMenu:
    case OverlayEntry.CanvasPopover:
      return <CanvasEntry popover={entry === OverlayEntry.CanvasPopover}>{item}</CanvasEntry>;
    case OverlayEntry.Popover:
      return (
        <PopoverOverlay trigger={<button type="button">Open menu</button>}>
          <button type="button" onClick={onLaunch}>
            New entity
          </button>
        </PopoverOverlay>
      );
  }
}

export function OverlayAccessibilityFixture({
  entry = OverlayEntry.Dropdown,
  surface = DialogSurface.Modal,
  inside = false,
}: {
  entry?: OverlayEntry;
  surface?: DialogSurface;
  inside?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const launcher = <OverlayLauncher entry={entry} onLaunch={() => setOpen(true)} />;
  const content = (
    <>
      {inside && <OverlayLauncher entry={entry} onLaunch={() => {}} />}
      <Combobox
        value={picked}
        onChange={setPicked}
        options={[{ label: "Model", value: "model" }]}
        placeholder="Pick model"
      />
    </>
  );
  return (
    <>
      {!inside && launcher}
      <button type="button">Scene row</button>
      <button type="button" onClick={() => setOpen(true)}>
        Direct dialog
      </button>
      {surface === DialogSurface.Modal ? (
        <ModalOverlay
          open={open}
          title="Add Entity"
          onStateChange={setOpen}
          onSubmit={() => setOpen(false)}
          submitText="Add"
        >
          {content}
        </ModalOverlay>
      ) : (
        <SidebarModal
          open={open}
          title="Add Entity"
          onStateChange={setOpen}
          tabs={[
            {
              key: "assets",
              title: "Assets",
              content,
              contentFooter: (
                <button type="button" onClick={() => setOpen(false)}>
                  Add
                </button>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
