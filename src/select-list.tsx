import { ReactNode, useCallback, useMemo } from "react";
import { Size, Variant } from "./types";
import { ListGrid, type ListColumn } from "./list";
import { defaultResolveRowVisual, type ResolveRowVisual } from "./tree/resolve-row-visual";
import { SelectOption, SelectProps } from "./floating/select";
import { Icon, resolveIcon } from "./icons/registry";

/**
 * A select rendered as an always-open list of its options rather than as a menu
 * behind a trigger — for a picker that owns its panel (a search field above it, a
 * modal built around it) and has no room for a second layer of disclosure.
 *
 * Its API is `SelectProps` because what it presents is a select: a `value`, an
 * `onChange` and a set of `options`. That it draws them as rows is an
 * implementation choice, so a list model does not belong in this surface.
 *
 * Which option is chosen is shown the same way every row-shaped list in the system
 * shows selection — the shared left-edge bar and tint, tinted by `variant` — not by
 * a bespoke fill or an indicator column.
 */
// Module scope so their identities are stable across renders: `ListGrid` keys its
// row/order/column memos off these, and a fresh closure per render would rebuild
// every one of them on every keystroke in the search field above the list.
const getRowId = (option: SelectOption) => option.value;
const isRowDisabled = (option: SelectOption) => option.disabled === true;
const getSearchText = (option: SelectOption) => option.label;

const COLUMNS: ListColumn<SelectOption>[] = [
  {
    key: "item",
    align: "left",
    flex: true,
    render: (option) => (
      <div className="flex min-w-0 flex-row items-center gap-3">
        <div className="flex flex-row items-center justify-center rounded-full p-1 text-neutral-500">
          {resolveIcon(option.icon) ?? <Icon name="point-filled" />}
        </div>
        <div className="sized-text truncate select-none">{option.label}</div>
      </div>
    ),
  },
];

export function SelectList<T extends string | string[]>({
  value,
  onChange,
  options,
  variant = Variant.Default,
  size = Size.Md,
  notFound,
}: SelectProps<T> & { notFound?: ReactNode }) {
  const multiple = Array.isArray(value);

  const selectedKeys = useMemo(() => {
    if (Array.isArray(value)) {
      return new Set(value);
    } else if (value) {
      return new Set([value]);
    } else {
      return new Set<string>();
    }
  }, [value]);

  const handleSelectionChange = (keys: Set<string>) => {
    const keysArray = Array.from(keys);
    if (multiple) {
      onChange(keysArray as T);
    } else {
      onChange(keysArray[0] as T);
    }
  };

  const handleToggle = (v: string) => {
    if (multiple) {
      if (value?.includes(v)) {
        onChange(value.filter((f) => f !== v) as T);
      } else {
        onChange([...(value as string[]), v] as T);
      }
    } else {
      onChange(v as T);
    }
  };

  // The whole palette in one line: the shared resolver already knows the
  // intensities for hover and selection, and `variant` picks which
  // `--accent-color` those resolve against.
  const resolveVisual = useCallback<ResolveRowVisual<SelectOption>>(
    (state) => ({ ...defaultResolveRowVisual(state, undefined), variant }),
    [variant],
  );

  return (
    <ListGrid
      noHeader
      notFound={notFound}
      size={size}
      ariaLabel="Options"
      data={options}
      getRowId={getRowId}
      isRowDisabled={isRowDisabled}
      getSearchText={getSearchText}
      selectionMode={multiple ? "multiple" : "single"}
      selected={selectedKeys}
      onSelectionChange={handleSelectionChange}
      resolveVisual={resolveVisual}
      columns={COLUMNS}
      onAction={(key) => {
        handleToggle(key);
      }}
    />
  );
}
