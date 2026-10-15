import type { ReactNode } from "react";
import { ListRow, Size } from "@semio/ui";

enum Surface {
  Base = "Layout base",
  Raised = "Raised panel",
  Inset = "Layout inset",
  DeepInset = "Layout deep inset",
  Dialog = "Dialog body",
  Popover = "Popover body",
  List = "List row",
}

const surfaces: Record<Surface, string> = {
  [Surface.Base]: "bg-layout-light-base dark:bg-layout-dark-base",
  [Surface.Raised]: "bg-[#dcdcdc] dark:bg-[#252525]",
  [Surface.Inset]: "bg-layout-light-inset dark:bg-layout-dark-inset",
  [Surface.DeepInset]: "bg-layout-light-deep-inset dark:bg-layout-dark-deep-inset",
  [Surface.Dialog]: "card",
  [Surface.Popover]: "card-overlay",
  [Surface.List]: "bg-layout-light-inset dark:bg-layout-dark-inset",
};

/** Uses the dialog and popover surface classes without opening a portal. */
export function ControlSurfaces({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full gap-5 p-5 text-neutral-800 dark:text-neutral-200">
      {Object.values(Surface).map((surface) => (
        <section key={surface} className={`${surfaces[surface]} rounded-sm p-5`}>
          <h3 className="mb-4 font-semibold">{surface}</h3>
          {surface === Surface.List ? (
            <div className="grid grid-cols-1 gap-3">
              {[false, true].map((selected) => (
                <ListRow
                  key={String(selected)}
                  size={Size.Xl}
                  style={{ height: "auto" }}
                  className="py-4"
                  columns={[{ key: "controls" }]}
                  visual={{
                    background: selected
                      ? "color-mix(in oklab, var(--accent-color) 18%, transparent)"
                      : null,
                  }}
                  cells={[
                    <div key="controls" className="flex flex-wrap items-center gap-6">
                      {children}
                    </div>,
                  ]}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">{children}</div>
          )}
        </section>
      ))}
    </div>
  );
}
