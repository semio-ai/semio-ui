import { useRef, type ReactNode, type MouseEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { ScrollArea } from "../layouts/scroll-area";
import { Variant } from "../types";
import { Button } from "../buttons/button";

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  title?: string | ReactNode;
  description?: string | ReactNode;
  headerBottom?: ReactNode;
  /** Custom actions inside the standard divided footer. */
  footer?: ReactNode;
  /** Status or error content to the left of the footer actions. */
  footerStatus?: ReactNode;
  dismissDisabled?: boolean;
  /** Keep the close button visible when dismissal is disabled. */
  showDisabledClose?: boolean;
  submitDisabled?: boolean;
  submitText?: string;
  onStateChange: (open: boolean) => void;
  onSubmit?: (event: MouseEvent) => void;
  onCancel?: (event: MouseEvent) => void;
  variant?: Variant;
  /**
   * Whether clicking the submit button should close the modal immediately.
   *
   * - `true` (default) — the modal closes synchronously on click, regardless
   *   of whether `onSubmit` is sync or async. Suitable for handlers that
   *   don't need to keep the modal open (sync state writes, fire-and-forget
   *   uploads).
   * - `false` — the modal stays open after the click; the consumer is
   *   responsible for eventually calling `onStateChange(false)` (typically
   *   after a successful `await` of the submit work). On error, leave the
   *   modal open and surface the error inline so the user can retry.
   *
   * Cancel and the X close button always close immediately regardless of
   * this prop — async cancel is rare and "discard my work" should be
   * instant. Use `dismissDisabled` to lock those out during an
   * in-flight submit.
   */
  closeOnSubmitClick?: boolean;
  /**
   * How wide the modal gets on desktop.
   *
   * - `"fit"` (default) — sized by its content, floored at `min-w-96`. Right for
   *   a confirmation or a couple of fields, where a fixed width would leave a
   *   short sentence stranded in a wide box.
   * - `"medium"` — the sign-in surface's desktop width, up to 46.875rem.
   * - `"wide"` — the clamped width `SidebarModal` uses, `clamp(40rem, 80vw,
   *   72rem)`. Right for a form with sections and side-by-side fields, where
   *   `"fit"` collapses to the widest single control and everything wraps.
   *
   * Deliberately opt-in rather than a new default: most modals here are the
   *  first kind, and widening them all would be a worse fit for each.
   */
  size?: "fit" | "medium" | "wide";
  /** Custom container for the dialog portal. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}

/**
 * A flexible modal dialog built on base-ui's `Dialog` primitive.
 *
 * Provides a full-screen overlay modal with customisable header, content
 * area, and footer. Includes automatic scroll handling, responsive
 * design, and smooth fade-and-slide animations. Submit/cancel actions
 * are configurable; custom content can be slotted into the header area
 * below the description.
 *
 * Why base-ui (not Radix): Radix's `DismissableLayer` treats clicks
 * inside other portals (e.g. base-ui's `Autocomplete` popup) as
 * "outside", which closed the modal *and* swallowed the popup's option
 * `onClick`. base-ui's `Dialog` and `Autocomplete` coordinate via the
 * `FloatingPortal` machinery and don't have that conflict.
 *
 * Features:
 * - Full-screen dim overlay on every breakpoint; centred card on desktop
 * - Responsive (full-bleed on mobile, fit-to-content on desktop)
 * - Automatic scroll area with header/footer hairline dividers
 * - Header with title, description, X close, and optional `headerBottom`
 * - Optional submit/cancel footer with configurable close semantics
 * - Keyboard (Esc) and click-away dismissal (configurable)
 * - Variant-based styling
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onStateChange={setIsOpen}
 *   title="Edit Settings"
 *   description="Modify your application settings below"
 *   submitText="Save Changes"
 *   onSubmit={() => handleSave()}
 *   onCancel={() => setIsOpen(false)}
 *   variant={Variant.Primary}
 * >
 *   <SettingsForm />
 * </Modal>
 * ```
 */
export function Modal({
  children,
  open,
  title,
  description,
  headerBottom,
  footer,
  footerStatus,
  dismissDisabled = false,
  showDisabledClose = false,
  submitDisabled,
  submitText = "Submit",
  onStateChange,
  onSubmit,
  onCancel,
  variant,
  closeOnSubmitClick = true,
  size = "fit",
  portalContainer,
}: ModalProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const showFooter = footer || footerStatus || onSubmit || onCancel;
  const showHeader = title || description;
  const submitButton = onSubmit && (
    <Button
      tabIndex={0}
      variant={variant}
      onClick={(event) => {
        onSubmit(event);
        if (closeOnSubmitClick) {
          onStateChange(false);
        }
      }}
      disabled={submitDisabled}
    >
      {submitText}
    </Button>
  );
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        // Honour `dismissDisabled` for every close reason (escape, outside
        // press, focus out). Open requests still propagate so a controlled
        // parent can `setOpen(true)` programmatically — though typically
        // the parent already manages `open` itself.
        if (dismissDisabled && !nextOpen) return;
        onStateChange(nextOpen);
      }}
      // Lock out pointer dismissal entirely when disabled; the
      // `onOpenChange` guard above covers escape/focus-out too.
      disablePointerDismissal={dismissDisabled}
    >
      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Backdrop
          className={clsx(
            "fixed inset-0 bg-black/40",
            "transition-opacity duration-200",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
          )}
        />
        <Dialog.Viewport className="fixed inset-0 grid place-items-center p-0">
          <Dialog.Popup
            ref={popupRef}
            initialFocus={(openType) => {
              // Custom footers may change visual order, so choose the rightmost
              // enabled action by position rather than assuming DOM order.
              const actions = Array.from(
                footerRef.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? [],
              ).filter(
                (action) =>
                  action.getClientRects().length > 0 &&
                  !action.matches(":disabled, [aria-disabled='true']"),
              );
              const rightmost = actions.reduce<HTMLElement | null>(
                (candidate, action) =>
                  !candidate ||
                  action.getBoundingClientRect().right >= candidate.getBoundingClientRect().right
                    ? action
                    : candidate,
                null,
              );
              // A footer button cannot open the virtual keyboard. Without one,
              // keep the dialog primitive's touch behavior of focusing the popup.
              return rightmost ?? (openType === "touch" ? popupRef.current : true);
            }}
            className={clsx(
              "variant-scope flex flex-col focus:outline-hidden",
              "card overflow-clip",
              variant,
              "h-[calc(100dvh-4px)] w-[calc(100vw-4px)]",
              "desktop:max-w-[calc(100vw-4px)] desktop:max-h-[calc(100dvh-4px)]",
              "desktop:min-h-72",
              // A DEFINITE height for the wide form, not `h-fit`. `fit-content`
              // leaves the popup's height indefinite during layout, so every
              // percentage and flex basis inside it resolves to `auto` and the
              // scroller grows to its content instead of capping it — which is
              // why a tall modal had nothing to scroll. The clamp is
              // `SidebarModal`'s, which is where this was already solved.
              size === "wide"
                ? "desktop:h-[clamp(24rem,75dvh,calc(100dvh-4rem))]"
                : "desktop:h-fit",
              // Width is the one dimension that differs by kind of modal; see
              // the `size` prop. The clamp is `SidebarModal`'s, so the two large
              // surfaces in the app agree about how wide "large" is.
              size === "wide"
                ? "desktop:w-[clamp(40rem,80vw,72rem)]"
                : size === "medium"
                  ? "desktop:w-[min(75vw,46.875rem)]"
                  : "desktop:min-w-96 desktop:w-fit",
              // Fade plus a short vertical slide, via base-ui's `data-starting-style` /
              // `data-ending-style` transition hooks.
              //
              // **Translate, never scale, and the difference is not cosmetic.** A scale
              // transition resizes the whole subtree: at 0.9 a 16px glyph paints at
              // 14.4px, every intermediate value is fractional too, and the box beneath
              // it changes size at the same time — so fine artwork visibly slides inside
              // boxes that never moved, then settles when the transition ends. Sizing
              // glyphs in whole pixels does not help, because that fixes where they sit
              // at rest and the animation is what moves them.
              //
              // Translate has no such effect. Nothing is resized — a 16px glyph is 16px
              // at every frame — and the resting state is exactly `translate: none` over
              // a whole-pixel travel, so the final rasterization is the same one the
              // element would have had with no animation at all. Motion during the
              // transition reads as motion, which is the point; it is content shifting
              // against a stationary box that reads as a defect.
              //
              // Keep the distance a whole number of pixels. A fractional travel lands
              // the element off the pixel grid on the way and can settle visibly at the
              // end, which is the failure this comment exists to prevent.
              "transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "data-starting-style:opacity-0 data-starting-style:translate-y-2",
              "data-ending-style:opacity-0 data-ending-style:translate-y-2",
            )}
          >
            <ScrollArea
              orientation="vertical"
              // `wrapperClassName`, and no size of its own. `ScrollArea` puts
              // `className` on its VIEWPORT and `wrapperClassName` on its root;
              // the popup above already carries every size constraint, so the
              // scroller's whole job is to fill it. Sizing the viewport instead
              // made it size from its own content, which is both how the form
              // came to sit in a narrow column inside a wide dialog and half of
              // why a tall modal had nothing to scroll (STUDIO-193).
              wrapperClassName="min-h-0 w-full flex-1"
              header={
                <div
                  className={clsx(
                    "flex flex-col gap-1",
                    !showHeader && "hidden",
                    "border-b border-neutral-500/15",
                  )}
                >
                  <div
                    className={clsx(headerBottom ? "px-3 pt-3 pb-0" : "p-3", "flex flex-col gap-1")}
                  >
                    <div className="flex flex-row items-center justify-between">
                      <Dialog.Title
                        className={clsx(
                          variant,
                          "align-center flex text-base/7 font-medium",
                          "variant-scope variant-static-text justify-between",
                        )}
                      >
                        {title}
                      </Dialog.Title>
                      {(!dismissDisabled || showDisabledClose) && (
                        <Dialog.Close
                          render={(props) => (
                            <Button
                              {...props}
                              altText="Close"
                              disabled={dismissDisabled}
                              variant={variant}
                              leftIcon="close"
                            />
                          )}
                        />
                      )}
                    </div>
                    <Dialog.Description className="text-sm/6 text-black/50 dark:text-white/50">
                      {description ?? ""}
                    </Dialog.Description>
                  </div>

                  {headerBottom}
                </div>
              }
              footer={
                showFooter && (
                  <div
                    ref={footerRef}
                    className="flex justify-end gap-3 p-3 border-t border-neutral-500/15"
                  >
                    {footerStatus && (
                      <div className="min-w-0 flex-1 self-center">{footerStatus}</div>
                    )}
                    {footer ??
                      (onCancel && (
                        <Button
                          tabIndex={0}
                          variant={Variant.Default}
                          onClick={(event) => {
                            onCancel(event);
                            onStateChange(false);
                          }}
                          disabled={dismissDisabled}
                        >
                          Cancel
                        </Button>
                      ))}
                    {!footer && submitButton}
                  </div>
                )
              }
            >
              <div className="flex-1 p-0 text-black md:flex-none dark:text-white">{children}</div>
            </ScrollArea>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
