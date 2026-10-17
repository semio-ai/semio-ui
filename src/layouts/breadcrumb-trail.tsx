import { useEffect, useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { Button } from "../buttons/button";
import { Dropdown } from "../floating/dropdown";
import { NestedItem } from "../nested-elements/item";
import { NestedSeparator } from "../nested-elements/separator";
import { NestedLabel } from "../nested-elements/label";
import { NestedRadio } from "../nested-elements/radio";
import { TextField } from "../inputs/text-field";
import { Icon, type IconValue } from "../icons/registry";
import { Size } from "../types";
import { SearchableBreadcrumbSwitcher } from "./searchable-breadcrumb-switcher";

export interface BreadcrumbSibling {
  icon?: IconValue;
  value: string;
  label: string;
}

export interface BreadcrumbTrailItem {
  id: string;
  label: string;
  /** Reserved label width in pixels, independent of the sibling-menu button. */
  labelWidth?: number;
  href?: string;
  onNavigate?: () => void;
  node?: ReactNode;
  switcher?: {
    label: string;
    value: string;
    options: BreadcrumbSibling[];
    onSelect: (value: string) => void;
    searchable?: boolean;
    loading?: boolean;
    error?: string;
    emptyText?: string;
    browse?: { label: string; icon?: IconValue; onSelect: () => void };
  };
  /** Enables double-click, F2 and the menu's Rename action. Enter/blur commit; Escape cancels. */
  onRename?: (name: string) => void | Promise<void>;
  renameIcon?: IconValue;
  /** Hide the menu action when the consumer offers renaming through another surface. */
  showRenameAction?: boolean;
}

function BreadcrumbLevel({
  item,
  current,
  size,
}: {
  item: BreadcrumbTrailItem;
  current: boolean;
  size: Size;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const editingRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const switcher = item.switcher;
  const splitSwitcher = switcher && item.labelWidth !== undefined && !item.node;
  const editable = current && item.onRename && !item.node;
  const editableSwitcher = editable && switcher && !splitSwitcher;
  const showTriggerLabel = current && !editing && !item.node && !splitSwitcher;
  const labelStyle =
    item.labelWidth === undefined
      ? undefined
      : {
          width: item.labelWidth,
          minWidth: item.labelWidth,
        };

  useEffect(() => {
    if (!editing) return;
    const frame = requestAnimationFrame(() => {
      nameRef.current?.focus();
      nameRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [editing]);

  const beginRename = () => {
    if (!item.onRename) return;
    setOpen(false);
    setDraft(item.label);
    editingRef.current = true;
    setEditing(true);
  };
  const finishRename = (commit: boolean, restoreFocus = false) => {
    if (!editingRef.current) return;
    editingRef.current = false;
    setEditing(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
    const name = draft.trim();
    if (commit && name && name !== item.label) item.onRename?.(name);
  };
  const visibleOptions = switcher?.options ?? [];
  const labelClass = clsx(
    size,
    "sized-height inline-flex min-w-0 items-center truncate rounded-xs px-2",
    switcher && "bg-neutral-500/10 hover:bg-neutral-500/25 rounded-r-none",
  );
  const nameField = (
    <TextField
      ref={nameRef}
      aria-label={`Rename ${item.label}`}
      size={size}
      style={labelStyle}
      value={draft}
      onChange={setDraft}
      outline="hidden"
      onBlur={() => finishRename(true)}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
          finishRename(event.key === "Enter", true);
        }
      }}
      wrapperClassName={item.labelWidth !== undefined ? "min-w-0 shrink-0" : "w-0 min-w-0 flex-1"}
      className="!rounded-r-none !bg-transparent !pl-1.5"
    />
  );
  const label = editing ? (
    nameField
  ) : item.node ? (
    item.node
  ) : !current && item.href ? (
    <a
      href={item.href}
      className={labelClass}
      style={labelStyle}
      onClick={(event) => {
        if (!item.onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        item.onNavigate();
      }}
    >
      {item.label}
    </a>
  ) : switcher ? (
    <button
      ref={editable ? triggerRef : undefined}
      type="button"
      className={labelClass}
      style={labelStyle}
      aria-label={`${switcher.label}: ${item.label}`}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "F2" && editable) {
          event.preventDefault();
          beginRename();
        }
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        beginRename();
      }}
    >
      {item.label}
    </button>
  ) : editable ? (
    <button
      ref={triggerRef}
      type="button"
      style={labelStyle}
      aria-label={`Rename ${item.label}`}
      className={clsx(
        labelClass,
        "w-full cursor-pointer bg-neutral-500/10 hover:bg-neutral-500/25",
      )}
      onClick={beginRename}
      onDoubleClick={beginRename}
      onKeyDown={(event) => {
        if (event.key === "F2") {
          event.preventDefault();
          beginRename();
        }
      }}
    >
      {item.label}
    </button>
  ) : (
    <span className={labelClass} style={labelStyle}>
      {item.label}
    </span>
  );

  const trigger = switcher ? (
    editableSwitcher && editing ? (
      <div className="flex w-full min-w-0 items-center rounded-xs bg-neutral-500/10 hover:bg-neutral-500/25">
        {nameField}
        <Button
          size={size}
          visuals="inverted"
          leftIcon="select-indicator"
          altText={editing ? `${switcher.label} menu` : `${switcher.label}: ${item.label}`}
          disabled={editing}
          className="!rounded-l-none rounded-r-xs shrink-0"
        />
      </div>
    ) : (
      <Button
        ref={splitSwitcher && editable ? undefined : triggerRef}
        size={size}
        onDoubleClick={(event) => {
          if (!item.onRename || !current) return;
          event.preventDefault();
          beginRename();
        }}
        onKeyDown={(event) => {
          if (event.key === "F2" && item.onRename && current) {
            event.preventDefault();
            beginRename();
          }
        }}
        visuals="inverted"
        title={item.label}
        altText={showTriggerLabel ? `${switcher.label}: ${item.label}` : `${switcher.label} menu`}
        rightIcon={showTriggerLabel ? "select-indicator" : undefined}
        leftIcon={
          !showTriggerLabel ? (
            current ? (
              "select-indicator"
            ) : (
              <span className="grid h-full w-full place-items-center">
                <span className="desktop:hidden">…</span>
                <span className="hidden h-full w-full place-items-center desktop:grid">
                  <Icon name="select-indicator" />
                </span>
              </span>
            )
          ) : undefined
        }
        className={clsx(
          "min-w-0 rounded-xs bg-neutral-500/10 hover:bg-neutral-500/25",
          !showTriggerLabel && "rounded-xs bg-neutral-500/10 hover:bg-neutral-500/25",
          !current && "desktop:!rounded-l-none",
          splitSwitcher && current && "!rounded-l-none",
          editableSwitcher && "w-full",
          showTriggerLabel &&
            "flex-1 !flex overflow-hidden [&>div:first-child]:min-w-0 [&>div:first-child]:flex-1 [&>div:last-child]:shrink-0",
        )}
      >
        {showTriggerLabel ? (
          <span className="block w-full min-w-0 truncate text-left">{item.label}</span>
        ) : undefined}
      </Button>
    )
  ) : (
    <span />
  );

  return (
    <span
      className={clsx(
        size,
        "sized-text flex min-w-0 items-center rounded-xs",
        editable && item.labelWidth === undefined && "w-52 max-w-full",
        switcher && (!current || splitSwitcher) && "gap-0.5",
      )}
      aria-current={current ? "page" : undefined}
    >
      {!editableSwitcher &&
        (!switcher || !current || editing || item.node || splitSwitcher) &&
        (!current && switcher ? <span className="hidden desktop:contents">{label}</span> : label)}
      {switcher &&
        (editing && editableSwitcher ? (
          trigger
        ) : switcher.searchable || editable ? (
          <SearchableBreadcrumbSwitcher
            switcher={switcher}
            trigger={trigger}
            open={open && !editing}
            onOpenChange={setOpen}
            onRename={item.onRename && item.showRenameAction !== false ? beginRename : undefined}
            renameIcon={item.renameIcon}
          />
        ) : (
          <Dropdown
            open={open && !editing}
            onOpenChange={(next) => {
              setOpen(next);
            }}
            disabled={editing}
            onTriggerDoubleClick={(event) => {
              if (!item.onRename || !current) return;
              event.preventDefault();
              event.stopPropagation();
              beginRename();
            }}
            matchTriggerWidth={false}
            contentClassName="desktop:w-80 max-w-[calc(100vw-16px)]"
            trigger={trigger}
            header={
              <div className="flex flex-col gap-2 px-2 pt-2 pb-px">
                <NestedLabel>{switcher.label}</NestedLabel>
              </div>
            }
          >
            <div>
              {switcher.loading ? (
                <p role="status" className="p-2 text-sm">
                  Loading…
                </p>
              ) : switcher.error ? (
                <p role="status" className="p-2 text-sm">
                  {switcher.error}
                </p>
              ) : (
                <>
                  <NestedRadio
                    value={switcher.value}
                    options={visibleOptions.slice(0, 50)}
                    onChange={(value) => {
                      setOpen(false);
                      switcher.onSelect(value);
                    }}
                  />
                  {visibleOptions.length === 0 && (
                    <p role="status" className="p-2 text-sm">
                      {switcher.emptyText ?? "No options available"}
                    </p>
                  )}
                  {visibleOptions.length > 50 && (
                    <p className="p-2 text-sm">Showing 50 results. Refine your search.</p>
                  )}
                </>
              )}
            </div>
            {item.onRename && item.showRenameAction !== false && (
              <NestedItem left={item.renameIcon} onClick={beginRename}>
                Rename
              </NestedItem>
            )}
            {switcher.browse && (
              <>
                <NestedSeparator />
                <NestedItem
                  left={switcher.browse.icon}
                  onClick={() => {
                    setOpen(false);
                    switcher.browse?.onSelect();
                  }}
                >
                  {switcher.browse.label}
                </NestedItem>
              </>
            )}
          </Dropdown>
        ))}
    </span>
  );
}

/** A flat location trail. The caller owns routes, permissions and navigation guards. */
export function BreadcrumbTrail({
  items,
  size = Size.Sm,
}: {
  items: BreadcrumbTrailItem[];
  size?: Size;
}) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="variant-scope variant-static-text min-w-0 max-w-full">
      <ol className="flex min-w-0 items-center gap-1">
        {items.map((item, index) => (
          <li key={item.id} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="opacity-25">
                /
              </span>
            )}
            <BreadcrumbLevel item={item} current={index === items.length - 1} size={size} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
