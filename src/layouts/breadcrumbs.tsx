import { memo, useCallback, useMemo, type ReactNode } from "react";
import { clsx } from "clsx";
import { Dropdown } from "../floating/dropdown";
import { SelectOption } from "../floating/select";
import { NestedRadio } from "../nested-elements/radio";
import { Size, Variant } from "../types";
import { Icon, resolveIcon } from "../icons/registry";

export interface BreadcrumbOptionElement {
  id: string;
  type: "option";
  options: (SelectOption & { children: BreadcrumbElement[]; default?: boolean })[];
}

export interface BreadcrumbStaticElement {
  id: string;
  type: "static";
  render: (value?: string) => ReactNode;
  child?: BreadcrumbElement;
}

export type BreadcrumbElement = BreadcrumbOptionElement | BreadcrumbStaticElement;

export interface BreadcrumbsProps {
  size?: Size;
  variant?: Variant;
  values: Record<string, string | undefined>;
  elements: BreadcrumbElement[];
  onChange?: (value: Record<string, string | undefined>) => void;
  showIcons?: boolean;
  elementClassName?: string;
  separator?: ReactNode;
}

export function InnerBreadcrumbs({
  size,
  variant,
  values,
  elements,
  onChange,
  showIcons = true,
  elementClassName,
  separator,
}: BreadcrumbsProps) {
  const renderedElements = useMemo(() => {
    return findRenderedElements(elements, values);
  }, [values, elements]);

  const changeHandler = useCallback(
    (id: string, value: string) => {
      const satisfyingValues = findSatisfyingValues({ ...values, [id]: value }, elements);
      onChange?.(satisfyingValues);
    },
    [values, elements, onChange],
  );

  if (elements.length === 0) {
    return null;
  }

  return (
    <div className={clsx(variant, "responsive variant-static-text flex items-center gap-2")}>
      {renderedElements.map((element, idx) => (
        <div key={element.id} className="flex items-center gap-2">
          {element.type === "option" ? (
            <Dropdown
              key={element.id}
              trigger={
                <button
                  type="button"
                  className={clsx(
                    variant,
                    size,
                    showIcons &&
                      element.options.find((option) => option.value === element.value)?.icon
                      ? "grid grid-cols-[auto_1fr_auto]"
                      : "grid grid-cols-[1fr_auto]",
                    "responsive variant-responsive-text variant-responsive-appearing-bg rounded-xs",
                    "variant-responsive-appearing-outline",
                    "sized-height place-items-center",
                    "sized-text px-1",
                    elementClassName,
                  )}
                >
                  {showIcons &&
                    element.options.find((option) => option.value === element.value)?.icon &&
                    (resolveIcon(
                      element.options.find((option) => option.value === element.value)?.icon,
                    ) ?? <Icon key="icon" name="option-placeholder" />)}
                  {element.options.find((option) => option.value === element.value)?.label ??
                    element.value}
                  <Icon
                    name="disclosure-open"
                    className={clsx(
                      "ease-in-out",
                      "opacity-20 group-hover/trigger:opacity-100 group-data-[state=open]/trigger:opacity-100",
                      "-rotate-90 transition-transform duration-75 group-data-[state=open]/trigger:rotate-0",
                    )}
                  />
                </button>
              }
            >
              <NestedRadio
                options={element.options}
                value={element.value}
                onChange={(val) => changeHandler(element.id, val)}
              />
            </Dropdown>
          ) : (
            <div
              key={element.id}
              className={clsx(size, "sized-height sized-text flex items-center", elementClassName)}
            >
              {element.render ? element.render(element.value) : element.value}
            </div>
          )}
          {idx < renderedElements.length - 1 && !separator && (
            <span key={`${element.id}-slash`} className="opacity-25">
              /
            </span>
          )}
          {idx < renderedElements.length - 1 && separator && (
            <span key={`${element.id}-slash`}>{separator}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export const Breadcrumbs = memo(InnerBreadcrumbs);

function findRenderedElements(
  elements: BreadcrumbElement[],
  values: Record<string, string | undefined>,
): (BreadcrumbElement & { value: string | undefined })[] {
  const renderedElements: (BreadcrumbElement & { value: string | undefined })[] = [];
  elements.some((el) => {
    const value = values[el.id];
    if (value === undefined) {
      return false;
    } else {
      renderedElements.push({ ...el, value });
      if (el.type === "option") {
        const children = el.options.find((option) => option.value === value)?.children ?? [];
        if (children.length > 0) {
          renderedElements.push(...findRenderedElements(children, values));
        }
      } else if (el.type === "static" && el.child) {
        renderedElements.push(...findRenderedElements([el.child], values));
      }
      return true;
    }
  });
  return renderedElements;
}

function findSatisfyingValues(
  settings: Record<string, string | undefined>,
  elements: BreadcrumbElement[],
): Record<string, string> {
  const values: Record<string, string> = {};
  elements.forEach((el) => {
    if (el.type === "option") {
      const option = el.options.find((o) => o.value === settings[el.id]);
      const defaultOption = el.options.find((o) => o.default);
      if (option) {
        values[el.id] = option.value;
        if (option.children) {
          Object.assign(values, findSatisfyingValues(settings, option.children));
        }
      } else if (defaultOption) {
        values[el.id] = defaultOption.value;
        if (defaultOption.children) {
          Object.assign(values, findSatisfyingValues(settings, defaultOption.children));
        }
      }
    } else if (el.type === "static" && el.child) {
      Object.assign(values, findSatisfyingValues(settings, [el.child]));
    }
  });
  return values;
}
