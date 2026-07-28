import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { IconProps } from "@solar-icons/react-perf";

/**
 * A sphere with two dashed latitude arcs — the asset-type glyph for models.
 *
 * Follows the Solar line-duotone convention (as {@link SelectCursor} does) rather
 * than the fill-based shape of the older `IconFileType*` glyphs: a 1.5 primary
 * stroke plus a half-opacity dashed secondary. That also means it defaults to
 * `size="18px"` like a real Solar icon, so it needs no size wrapper in a
 * consumer's registry.
 *
 * Two things carried over deliberately from the authored SVG:
 *
 * - **The arcs' `strokeWidth` is 1.97, not 1.5.** Each arc sits under a matrix
 *   whose linear scale is 0.7572, so 1.97 renders at 1.49 — matching the circle's
 *   1.5. Setting it to 1.5 here would render 1.14 and read visibly thinner than
 *   the outline.
 * - **The arcs keep their group `opacity`** rather than moving to per-path
 *   `strokeOpacity`. The two arcs cross, and group opacity composites them
 *   flattened, so the crossing stays a uniform 50% instead of doubling up.
 */
const IconSphere: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> = forwardRef<
  SVGSVGElement,
  IconProps
>((props, ref) => {
  const { alt, color = "currentColor", size = "18px", mirrored = false, ...restProps } = props;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      color={color}
      fill="none"
      viewBox="0 0 24 24"
      transform={mirrored ? "scale(-1, 1)" : undefined}
      {...restProps}
    >
      {!!alt && <title>{alt}</title>}
      {/* Duotone secondary: the two latitude arcs, tilted as a pair. */}
      <g opacity={0.5} transform="matrix(0.950512,0.310687,-0.310687,0.950512,4.387306,-3.16579)">
        <path
          d="M24.719,12.4C20.562,18.883 9.901,20.457 2.559,17.435"
          transform="matrix(-0.037723,-0.696394,0.820808,-0.044463,0.217118,22.211813)"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth={1.97}
          strokeLinecap="round"
          strokeDasharray="3.936,3.936,0,0,0,0"
          strokeDashoffset={2.46}
        />
        <path
          d="M25.074,12.317C20.916,18.801 10.256,20.376 2.914,17.355"
          transform="matrix(-0.584233,0.380866,0.44891,0.68861,13.463402,-3.495688)"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth={1.97}
          strokeLinecap="round"
          strokeDasharray="3.936,3.936,0,0,0,0"
          strokeDashoffset={2.46}
        />
      </g>
      {/* Primary: the sphere outline. Closed path, so the default butt cap is
          invisible — matching the authored `stroke-linecap:butt`. */}
      <path
        d="M20,12C20,16.418 16.418,20 12,20C7.582,20 4,16.418 4,12C4,7.582 7.582,4 12,4C16.418,4 20,7.582 20,12Z"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
});

IconSphere.displayName = "IconSphere";

export { IconSphere };
