import { useEffect, useRef, useState, type ReactNode } from "react";
import { Combobox } from "../inputs/combobox";
import { ListGrid } from "../list/list-grid";
import { NestedRadio } from "../nested-elements/radio";
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
  extraItems,
}: {
  entry: OverlayEntry;
  onLaunch: () => void;
  extraItems?: ReactNode;
}) {
  const item = (
    <>
      <NestedItem onClick={onLaunch}>New entity</NestedItem>
      {extraItems}
    </>
  );
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
  const [innerOpen, setInnerOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [innerPicked, setInnerPicked] = useState<string | null>(null);
  const [sceneActions, setSceneActions] = useState(0);
  const launcher = <OverlayLauncher entry={entry} onLaunch={() => setOpen(true)} />;
  const content = (
    <>
      {inside && (
        <>
          <button type="button">Outer dialog action</button>
          <OverlayLauncher entry={entry} onLaunch={() => setInnerOpen(true)} />
          <ModalOverlay
            open={innerOpen}
            title="New Entity"
            onStateChange={setInnerOpen}
            onSubmit={() => setInnerOpen(false)}
            submitText="Create"
          >
            <Combobox
              value={innerPicked}
              onChange={setInnerPicked}
              options={[{ label: "Model", value: "model" }]}
              placeholder="Pick model"
            />
          </ModalOverlay>
        </>
      )}
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
      {/* Keep the background action outside the launcher's popup geometry. */}
      <div className="flex min-h-96 flex-col items-start justify-between">
        {!inside && launcher}
        <div>
          <button type="button" onClick={() => setSceneActions((count) => count + 1)}>
            Scene row
          </button>
          <output aria-label="Scene actions">{sceneActions}</output>
          <button type="button" onClick={() => setOpen(true)}>
            Direct dialog
          </button>
        </div>
      </div>
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

export enum MenuSurroundings {
  Modal = "Modal",
  Sidebar = "SidebarModal",
  Listing = "ListGrid",
}

export const MENU_ENTRIES = Object.values(OverlayEntry).filter(
  (entry) => entry !== OverlayEntry.Popover,
);

export function MenuUsabilityFixture({
  entry,
  surroundings,
}: {
  entry: OverlayEntry;
  surroundings: MenuSurroundings;
}) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState(0);
  const [kept, setKept] = useState(0);
  const [role, setRole] = useState("editor");
  const launcher = (
    <OverlayLauncher
      entry={entry}
      onLaunch={() => setSelected((count) => count + 1)}
      extraItems={
        <>
          <NestedItem closeOnSelect={false} onClick={() => setKept((count) => count + 1)}>
            Keep menu open
          </NestedItem>
          <NestedRadio
            value={role}
            onChange={setRole}
            options={[
              { value: "editor", label: "Editor" },
              { value: "admin", label: "Admin" },
            ]}
          />
        </>
      }
    />
  );
  const content = (
    <div className="flex min-h-64 flex-col items-start justify-between">
      {launcher}
      <output aria-label="Selections">{selected}</output>
      <output aria-label="Kept open">{kept}</output>
      <output aria-label="Chosen role">{role}</output>
      {/* Keep the outside press below the root menu, including its radio group. */}
      <button type="button">Outside menu</button>
    </div>
  );
  if (surroundings === MenuSurroundings.Modal)
    return (
      <ModalOverlay open={open} onStateChange={setOpen} title="Menu dialog">
        {content}
      </ModalOverlay>
    );
  if (surroundings === MenuSurroundings.Sidebar)
    return (
      <SidebarModal
        open={open}
        onStateChange={setOpen}
        title="Menu dialog"
        tabs={[{ key: "menu", title: "Menu tab", content }]}
      />
    );
  return (
    <>
      {content}
      <ListGrid
        ariaLabel="Focus managing list"
        selectionMode="single"
        data={[
          { id: "first", label: "First row" },
          { id: "second", label: "Second row" },
        ]}
        getRowId={(row) => row.id}
        columns={[{ key: "label", flex: true, render: (row) => row.label }]}
      />
    </>
  );
}

export const OVERLAY_SELECTION_CASES = Object.values(OverlayEntry).flatMap<
  [OverlayEntry, "click" | "keyboard"]
>((entry) =>
  entry === OverlayEntry.Popover
    ? [[entry, "click"]]
    : [
        [entry, "click"],
        [entry, "keyboard"],
      ],
);
