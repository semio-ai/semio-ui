import type { ReactNode, Ref } from "react";
// Base UI, not Radix. This package is migrating off Radix, so a NEW component
// wrapping a primitive takes the one we are moving toward — `Avatar` still wraps
// Radix and is left alone until that migration reaches it.
//
// ⚠ A `@base-ui/react/*` subpath must be pinned in the studio app's
// `optimizeDeps.include`. Vite has not pre-bundled it otherwise, so it is
// discovered mid-run and the re-optimize reloads the page out from under the
// browser-test runner ("Vitest failed to find the runner").
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { clsx } from "clsx";
import { Variant } from "./types";

export interface MediaSurfaceProps {
  /** The image. Absent or failing to load falls back to {@link fallback}. */
  src?: string | null;
  /** Describes the image. Empty where the surface is decorative and named nearby. */
  alt?: string;
  /**
   * What fills the surface when there is no image — a glyph, a monogram, a scene.
   *
   * A node rather than a name, so the surface knows nothing about what it is
   * standing in for. A consumer that has entity types keeps them.
   */
  fallback?: ReactNode;
  /** Drives the ground and the foreground derived from it. */
  variant?: Variant;
  /** The box: the caller states size or aspect ratio, and any radius. */
  className?: string;
  /**
   * The rendered node, which is a `<span>`.
   *
   * Base UI's avatar root renders a span, so naming a div here would hand consumers
   * a type the DOM never produces. It type-checks either way — `HTMLSpanElement`
   * adds nothing to `HTMLElement`, so a div is structurally a subtype of it — which
   * is exactly why the declaration has to be right rather than merely accepted.
   */
  ref?: Ref<HTMLSpanElement>;
}

/**
 * An image, or something standing in for one, filling the box its caller states.
 *
 * **Distinct from `Avatar`, which it deliberately does not reuse.** An avatar is a
 * tile: a small square identifying a party, floating in padding at one of the size
 * scale's rungs. This is a surface: it fills whatever it is given — a card's media
 * slot, a pane's full-bleed head — and the two want opposite things from the same
 * properties.
 *
 * Two of those differences are why routing a hero through `Avatar` breaks:
 *
 * - **This states NO radius.** `Avatar` hardcodes `rounded-sm` on its root, image
 *   and fallback alike, so a caller cannot remove it: a per-site `rounded-*` is the
 *   same utility family, and which one wins is decided by their order in the
 *   compiled stylesheet rather than by the order they were written. A tile wants
 *   that radius; a surface meeting its container's edges does not, and the corners
 *   where it abuts the next block are exactly where the difference shows. Here the
 *   caller owns it: a tile passes `rounded-sm`, a full-bleed head passes nothing.
 * - **The ground is painted by the ROOT, not only by the fallback**, so an image
 *   with transparency sits on the surface's own fill rather than showing whatever
 *   is behind it. `Avatar` spreads one `className` onto its root, image and
 *   fallback together, which is why a caller cannot back the image there without
 *   also covering the fallback's fill and stranding the foreground derived from it.
 *
 * `variant-static-bg` sets the fill AND the foreground derived from it, which is
 * what keeps a glyph legible on whatever ground the variant chose. Do not pass a
 * `bg-*` utility instead: a caller's utility sits in a later cascade layer than a
 * `variant-*` component class, so it wins the background while the derived
 * foreground stays computed for a fill nothing paints — with both classes present
 * and both applying, so nothing reports it.
 */
export function MediaSurface({
  src,
  alt = "",
  fallback,
  variant = Variant.Default,
  className,
  ref,
}: MediaSurfaceProps) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={clsx(
        variant,
        "variant-scope",
        "variant-static-bg",
        // ⚠ `block` is load-bearing, not tidiness. Radix renders the root as a `span`,
        // and `aspect-ratio` does not apply to a non-replaced INLINE box — so a caller
        // passing `aspect-video w-full` gets a box sized to its content instead: a
        // 400px-wide hero came out 48px tall, the height of the glyph inside it.
        // `overflow-hidden` needs it too, since an inline box does not establish the
        // formatting context that clips.
        //
        // `Avatar` has an inline root and no such problem only because it spreads one
        // `className` onto its root, image AND fallback — the ratio lands on the
        // fallback, which is `grid`. This puts the caller's box on the root alone, so
        // the root is what has to be able to hold it.
        "block overflow-hidden",
        className,
      )}
    >
      <AvatarPrimitive.Image src={src ?? undefined} alt={alt} className="size-full object-cover" />
      <AvatarPrimitive.Fallback className="grid size-full place-items-center select-none">
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
