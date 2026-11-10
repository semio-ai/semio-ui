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
  type FocusEvent as ReactFocusEvent,
  type ReactNode,
  type Ref,
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
  // stop of its own, which would nest a second button around the real one.
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
 * Keeps Shift+Tab inside a context or canvas menu. Base UI's list navigation closes an
 * open menu on Shift+Tab (reason `focus-out`) and focuses its trigger unless the close
 * is cancelled, while its focus guards keep a plain Tab inside. These menus keep focus
 * in both directions.
 */
export function keepsTabInMenu(
  details: Pick<Menu.Root.ChangeEventDetails, "reason" | "event" | "cancel">,
) {
  if (
    details.reason === "focus-out" &&
    details.event instanceof KeyboardEvent &&
    details.event.key === "Tab"
  ) {
    details.cancel();
    return true;
  }
  return false;
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

/** Correct only the initial keyboard focus that Base UI skips over disabled entries. */
export function useFirstMenuEntryFocus() {
  const pending = useRef(false);
  const onOpenChange = (open: boolean, details: Pick<Menu.Root.ChangeEventDetails, "event">) => {
    const event = details.event;
    pending.current =
      open &&
      (event instanceof KeyboardEvent || (event instanceof MouseEvent && event.detail === 0));
  };
  const onFocus = (event: ReactFocusEvent<HTMLElement>) => {
    const popup = event.currentTarget;
    const focused = event.target;
    if (!pending.current || focused.closest('[role="menu"]') !== popup) return;
    // List navigation finishes its initial focus before this correction. Focusing
    // the first entry also updates Base UI's highlight through its normal onFocus.
    queueMicrotask(() => {
      if (!popup.isConnected || !popup.contains(document.activeElement)) return;
      const entries = Array.from(popup.querySelectorAll<HTMLElement>('[role^="menuitem"]')).filter(
        (entry) => entry.closest('[role="menu"]') === popup && !entry.closest("[hidden]"),
      );
      const index = entries.indexOf(focused);
      if (
        (index > 0 &&
          entries
            .slice(0, index)
            .every((entry) => entry.getAttribute("aria-disabled") === "true")) ||
        (focused === popup &&
          entries.length > 0 &&
          entries.every((entry) => entry.getAttribute("aria-disabled") === "true"))
      ) {
        pending.current = false;
        entries[0].focus({ preventScroll: true });
      } else if (focused !== popup) pending.current = false;
    });
  };
  return { onOpenChange, onFocus };
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

/** Completion is delivered before React removes the popup; dispatch after that commit. */
export function useMenuActionHandoff(afterClose?: () => void) {
  const pending = useRef<(() => void)[]>([]);
  const [completed, setCompleted] = useState<(() => void)[][]>([]);
  const afterCloseRef = useRef(afterClose);
  afterCloseRef.current = afterClose;
  const enqueue = useCallback((action: () => void) => {
    pending.current.push(action);
  }, []);
  const onOpenChangeComplete = useCallback((open: boolean) => {
    if (open) return;
    const actions = pending.current.splice(0);
    setCompleted((cycles) => [...cycles, actions]);
  }, []);
  useEffect(() => {
    if (!completed.length) return;
    setCompleted([]);
    // Base UI returns focus in a cleanup microtask. Dialog actions must follow it.
    queueMicrotask(() => {
      for (const actions of completed) for (const action of actions) action();
      afterCloseRef.current?.();
    });
  }, [completed]);
  return { enqueue, onOpenChangeComplete };
}

/** ActionMenu needs browser user activation for operations such as clipboard writes. */
export function runMenuActionImmediately(action: () => void) {
  action();
}
