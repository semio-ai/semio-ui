import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { mergeRefs } from "react-merge-refs";
import type { Menu } from "@base-ui/react/menu";
import { isEscapeConsumedByTooltip } from "./tooltip";

/** Compose a consumer's trigger and retain its ref, handlers and menu state contract. */
export function renderMenuTrigger(
  trigger: ReactNode,
  props: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> },
  open: boolean,
) {
  if (!isValidElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>(trigger)) {
    return (
      <span {...props} data-state={open ? "open" : "closed"}>
        {trigger}
      </span>
    );
  }
  // A non-button element such as `<span><MenuButton /></span>` wraps the control the user
  // focuses and only relays its events and menu state. It takes no button role or tab
  // stop of its own, which would nest a second button around the real one. A non-button
  // element that is the control itself declares its own `role` and `tabIndex`, which
  // win over these defaults below.
  const relay = typeof trigger.type === "string" && trigger.type !== "button";
  const { role: _role, tabIndex: _tabIndex, ...relayProps } = props;
  return cloneElement(trigger, {
    ...mergeProps(relay ? relayProps : props, trigger.props),
    ref: mergeRefs([props.ref, trigger.props.ref]),
    "data-state": open ? "open" : "closed",
  } as typeof props);
}

/** Notifications belong inside menu dismissal boundaries, including focus after a press. */
export function preserveMenuInteraction(
  details: Pick<Menu.Root.ChangeEventDetails, "reason" | "event" | "cancel">,
) {
  const target =
    details.reason === "focus-out" && details.event instanceof FocusEvent
      ? details.event.relatedTarget
      : details.event.target;
  if (
    (details.reason === "outside-press" || details.reason === "focus-out") &&
    target instanceof Element &&
    target.closest("[data-notifications-region]")
  ) {
    details.cancel();
    return true;
  }
  // Tooltip marks the native Escape it dismisses in document capture. Only that
  // mark preserves this menu (and its submenus); disabled items preventDefault on
  // ordinary Escape too, and must still allow dismissal.
  if (details.reason === "escape-key" && isEscapeConsumedByTooltip(details.event)) {
    details.cancel();
    return true;
  }
  return false;
}

/**
 * Keeps Tab and Shift+Tab on the focused entry of a context or canvas menu, its
 * submenus included. The listener runs in the document's capture phase, ahead of
 * Base UI: its list navigation closes a menu on Shift+Tab, and its focus guards
 * close a submenu on Tab.
 */
export function useMenuTabContainment(open: boolean, popupRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !menuContainsFocus(popupRef.current)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, popupRef]);
}

/**
 * Shift+Tab anywhere in an open Dropdown, a submenu included, closes the whole menu
 * through `exit`, which returns focus to the trigger. Base UI would close only the
 * submenu that has focus. Tab already closes the whole menu and moves on.
 */
export function useMenuShiftTabExit(
  open: boolean,
  popupRef: RefObject<HTMLElement | null>,
  exit: () => void,
) {
  const exitRef = useRef(exit);
  exitRef.current = exit;
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !event.shiftKey || !menuContainsFocus(popupRef.current)) return;
      event.preventDefault();
      event.stopPropagation();
      exitRef.current();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, popupRef]);
}

/** Resolve relay wrappers to the actual control for both immediate and final focus. */
export function menuTriggerFocusTarget(trigger: HTMLElement | null) {
  if (!trigger || trigger.matches("button, a[href], input, select, textarea, [tabindex]"))
    return trigger;
  return trigger.querySelector<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  );
}

/** Submenus share Base UI's root owner even when their popups use another portal. */
export function menuContainsFocus(popup: HTMLElement | null) {
  if (!popup) return false;
  const active = popup.ownerDocument.activeElement;
  if (popup.contains(active)) return true;
  const owner = popup.getAttribute("data-rootownerid");
  return !!owner && active?.closest('[role="menu"]')?.getAttribute("data-rootownerid") === owner;
}

/** A menu receives Escape before a toast when focus is in the notifications region. */
export function useNotificationMenuEscape(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        !(event.target instanceof Element) ||
        !event.target.closest("[data-notifications-region]") ||
        event.target.closest('[role="menu"]')
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      closeRef.current();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);
}

const MenuActionContext = createContext<((action: () => void) => void) | null>(null);
export const MenuActionProvider = MenuActionContext.Provider;

/** Closing selections wait for focus restoration; other selections execute in the event. */
export function useMenuAction() {
  const enqueue = useContext(MenuActionContext);
  return (action: () => void, closesMenu: boolean) => {
    if (closesMenu && enqueue) enqueue(action);
    else action();
  };
}

/**
 * Runs closing selections after the menu has finished closing. Base UI reports
 * completion before React removes the popup and returns focus in a cleanup
 * microtask, so actions run in a microtask after the commit that removes it: a
 * dialog an action opens then starts after focus has left the menu. A consumer that
 * unmounts the menu as it closes still gets the selected action.
 */
export function useMenuActionHandoff(afterClose?: () => void) {
  const pending = useRef<(() => void)[]>([]);
  const completed = useRef<(() => void)[]>([]);
  const [completions, setCompletions] = useState(0);
  const afterCloseRef = useRef(afterClose);
  afterCloseRef.current = afterClose;
  const enqueue = useCallback((action: () => void) => {
    pending.current.push(action);
  }, []);
  const onOpenChangeComplete = useCallback((open: boolean) => {
    if (open) return;
    completed.current.push(...pending.current.splice(0));
    setCompletions((count) => count + 1);
  }, []);
  useEffect(() => {
    if (completions === 0) return;
    const actions = completed.current.splice(0);
    queueMicrotask(() => {
      // An action that throws still lets the menu's own close cleanup run.
      try {
        for (const action of actions) action();
      } finally {
        afterCloseRef.current?.();
      }
    });
  }, [completions]);
  useEffect(
    () => () => {
      const actions = [...completed.current.splice(0), ...pending.current.splice(0)];
      if (actions.length > 0)
        queueMicrotask(() => {
          for (const action of actions) action();
        });
    },
    [],
  );
  return { enqueue, onOpenChangeComplete };
}

/** ActionMenu needs browser user activation for operations such as clipboard writes. */
export function runMenuActionImmediately(action: () => void) {
  action();
}
