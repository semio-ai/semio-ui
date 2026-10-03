import { ReactNode, useCallback, useMemo } from "react";
import { clsx } from "clsx";
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
  //
  // A disabled option gets neither. `ListGrid` reports hover for a row it will
  // refuse to activate, so without this the option would light up under the
  // pointer and then do nothing when clicked.
  const resolveVisual = useCallback<ResolveRowVisual<SelectOption>>(
    (state, option) =>
      option.disabled
        ? { variant, bar: null, background: null }
        : { ...defaultResolveRowVisual(state, option), variant },
    [variant],
  );

  // `sized-text` resolves against a `size-*` class on the SAME element — the rules
  // are `.sized-text:where(.size-lg)`, not a descendant selector — so the row's own
  // size does not reach the label and `size` has to be spelled here to scale it.
  const columns = useMemo<ListColumn<SelectOption>[]>(
    () => [
      {
        key: "item",
        align: "left",
        flex: true,
        render: (option) => (
          <div
            className={clsx(
              "flex min-w-0 flex-row items-center gap-3",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <div className="flex flex-row items-center justify-center rounded-full p-1 text-neutral-500">
              {resolveIcon(option.icon) ?? <Icon name="option-placeholder" />}
            </div>
            <div className={clsx(size, "sized-text truncate select-none")}>{option.label}</div>
          </div>
        ),
      },
    ],
    [size],
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
      columns={columns}
      onAction={(key) => {
        handleToggle(key);
      }}
    />
  );
}

// At module scope because they close over nothing, not to satisfy a memo: `ListGrid`
// keys its row memos on `[data, getRowId]`, and `data` here is `options`, which a
// caller filtering by a search field replaces on every keystroke anyway.
const getRowId = (option: SelectOption) => option.value;
const isRowDisabled = (option: SelectOption) => option.disabled === true;
const getSearchText = (option: SelectOption) => option.label;
