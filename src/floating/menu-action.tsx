import { createContext, useCallback, useContext, useMemo, useRef } from "react";

const MenuActionContext = createContext<((action: () => void) => void) | null>(null);
export const MenuActionProvider = MenuActionContext.Provider;

/** Queue closing selections on the root menu, including selections in submenus. */
export function useMenuAction() {
  const enqueue = useContext(MenuActionContext);
  return useCallback(
    (action: () => void, closesMenu: boolean) => {
      if (closesMenu && enqueue) enqueue(action);
      else action();
    },
    [enqueue],
  );
}

export function useMenuActionHandoff() {
  const contentRef = useRef<HTMLDivElement>(null);
  const pending = useRef(new Map<EventTarget | null, () => void>());
  const enqueue = useCallback((action: () => void) => {
    pending.current.set(contentRef.current, action);
  }, []);
  const onCloseAutoFocus = useCallback((event: Event) => {
    // StrictMode can rehearse effect cleanup while the content remains mounted.
    if ((event.target as HTMLElement).isConnected) return;
    // Each selection belongs to its content instance: a root can reopen before
    // an earlier FocusScope's close event arrives.
    const action = pending.current.get(event.target);
    if (!action) return;
    pending.current.delete(event.target);
    // Radix emits this event after content unmount and hideOthers cleanup.
    // Finish its focus restoration and FocusScope removal before an action
    // can mount a Base UI dialog with its own background-hiding counter.
    queueMicrotask(action);
  }, []);
  return useMemo(() => ({ contentRef, enqueue, onCloseAutoFocus }), [enqueue, onCloseAutoFocus]);
}

/** The topmost Radix menu consumes Escape before a Base UI dialog can receive it. */
export function stopMenuEscapePropagation(event: KeyboardEvent) {
  event.stopPropagation();
}
