import { useRef, useState, type ReactElement, type ReactNode, type CSSProperties } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Icon, resolveIcon, type IconValue } from "../icons/registry";
import { Text, TextRole } from "../text";
import { Size, Variant } from "../types";
import { Arrow } from "../floating/arrow";
import {
  inputClassName,
  inputGroupClassName,
  itemClassName,
  itemIndicatorClassName,
  positionerClassName,
} from "../inputs/combobox-shared";
import { ScrollArea } from "./scroll-area";
import type { BreadcrumbSibling, BreadcrumbTrailItem } from "./breadcrumb-trail";

type Switcher = NonNullable<BreadcrumbTrailItem["switcher"]>;

/**
 * A search-in-popup picker keeps DOM focus on its input while choices are highlighted.
 * TODO(semio-agent): Replace this internal adapter when the shared Base UI picker supports
 * a custom trigger, popup search/header/footer, and actions delivered after popup teardown.
 * Preserve hover typing focus, double-click/F2 rename and menu-to-dialog accessibility
 * regressions when consolidating it; this adapter is not a pattern for new popups.
 */
export function SearchableBreadcrumbSwitcher({
  switcher,
  trigger,
  open,
  onOpenChange,
  onRename,
  renameIcon,
}: {
  switcher: Switcher;
  trigger: ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename?: () => void;
  renameIcon?: IconValue;
}) {
  const [query, setQuery] = useState("");
  const pendingAction = useRef<(() => void) | null>(null);
  const selected = switcher.options.find((option) => option.value === switcher.value) ?? null;
  const visible = switcher.options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const closeWithAction = (action: () => void) => {
    pendingAction.current = action;
    onOpenChange(false);
  };
  const separator = (
    <div
      role="separator"
      className="variant-scope variant-separator-fill pointer-events-none m-1.25 h-px select-none"
    />
  );
  return (
    <Combobox.Root<BreadcrumbSibling>
      items={visible.slice(0, 50)}
      filter={null}
      value={selected}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(option) => option.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(next) => {
        if (next) return;
        setQuery("");
        const action = pendingAction.current;
        pendingAction.current = null;
        action?.();
      }}
      onValueChange={(option) => {
        if (option) closeWithAction(() => switcher.onSelect(option.value));
      }}
    >
      <Combobox.Trigger render={trigger} />
      <Combobox.Portal>
        <Combobox.Positioner
          sideOffset={3}
          align="center"
          collisionPadding={2}
          className={positionerClassName()}
        >
          <Combobox.Popup
            data-state={open ? "open" : "closed"}
            style={
              {
                "--radix-dropdown-content-transform-origin": "var(--transform-origin)",
              } as CSSProperties
            }
            className="variant-scope card-overlay dropdown-content m-0.5 min-w-55 w-[calc(var(--available-width)-4px)] max-w-[calc(100vw-16px)] desktop:w-80 max-h-[calc(var(--available-height)-4px)] outline-hidden"
          >
            <Combobox.Arrow className="data-[side=bottom]:-top-1.5 data-[side=bottom]:rotate-180 data-[side=top]:-bottom-1.5 data-[side=right]:-left-2.25 data-[side=right]:rotate-90 data-[side=left]:-right-2.25 data-[side=left]:-rotate-90">
              <Arrow filled={false} variant={Variant.Default} className="block h-1.5 w-3" />
            </Combobox.Arrow>
            <ScrollArea
              shrinkHeight
              orientation="vertical"
              wrapperClassName="max-h-[calc(var(--available-height)-8px)]"
              className="flex flex-col gap-0.5 p-0.5"
              header={
                <div className="flex flex-col gap-2 px-2 pt-2 pb-px">
                  <Text as="div" role={TextRole.Value} className="px-4 font-semibold">
                    {switcher.label}
                  </Text>
                  <Combobox.InputGroup className={inputGroupClassName(Size.Sm)}>
                    <Combobox.Input
                      aria-label={`Search ${switcher.label.toLowerCase()}`}
                      placeholder="Search…"
                      className={inputClassName(Size.Sm, Variant.Default, {
                        leftPadded: false,
                        rightPadded: false,
                      })}
                    />
                  </Combobox.InputGroup>
                </div>
              }
            >
              {separator}
              {switcher.loading || switcher.error ? (
                <p role="status" className="p-2 text-sm">
                  {switcher.loading ? "Loading…" : switcher.error}
                </p>
              ) : (
                <>
                  <Combobox.List aria-label={switcher.label} className="flex flex-col">
                    {(option: BreadcrumbSibling) => (
                      <Combobox.Item
                        key={option.value}
                        value={option}
                        className={itemClassName()}
                        render={(props) => (
                          <div
                            {...props}
                            data-state={option.value === switcher.value ? "checked" : "unchecked"}
                          >
                            <span className={itemIndicatorClassName()}>
                              <span className="icon-slot">
                                {resolveIcon(option.icon) ?? <Icon name="radio-selected" />}
                              </span>
                            </span>
                            {option.label}
                          </div>
                        )}
                      />
                    )}
                  </Combobox.List>
                  {visible.length === 0 && (
                    <p role="status" className="p-2 text-sm">
                      {query ? "No matches" : (switcher.emptyText ?? "No options available")}
                    </p>
                  )}
                  {visible.length > 50 && (
                    <p className="p-2 text-sm">Showing 50 results. Refine your search.</p>
                  )}
                </>
              )}
              {onRename && (
                <PickerAction icon={renameIcon} onClick={() => closeWithAction(onRename)}>
                  Rename
                </PickerAction>
              )}
              {switcher.browse && (
                <>
                  {separator}
                  <PickerAction
                    icon={switcher.browse.icon}
                    onClick={() => closeWithAction(switcher.browse!.onSelect)}
                  >
                    {switcher.browse.label}
                  </PickerAction>
                </>
              )}
            </ScrollArea>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

/** Native actions share the highlighted treatment used by the picker's options. */
function PickerAction({
  icon,
  onClick,
  children,
}: {
  icon?: IconValue;
  onClick: () => void;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <button
      type="button"
      className={itemClassName({ extras: "w-full text-left" })}
      data-state="unchecked"
      data-highlighted={hovered || focused ? "" : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={onClick}
    >
      <span className={itemIndicatorClassName()}>
        <span className="icon-slot">{resolveIcon(icon)}</span>
      </span>
      {children}
    </button>
  );
}
