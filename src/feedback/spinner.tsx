import type { ReactNode } from "react";

/**
 * Renders a spinner component. If children are provided, the spinner will bounce and spin the child,
 * Otherwise, it will render a default spinner, an animated semi-circle.
 *
 * @example
 * ```tsx
 * <Spinner>
 *   <img src="spinner.gif" alt="Loading..." />
 * </Spinner>
 * ```
 */
function Spinner({ children }: { children?: ReactNode }): ReactNode {
  return (
    <div className="flex h-auto items-center justify-center">
      {children ? (
        <div className="animate-bounce-spin relative">
          <div className="relative">{children}</div>
        </div>
      ) : (
        <div className="h-32 w-32 animate-spin rounded-full border-t-4 border-blue-500" />
      )}
    </div>
  );
}

export { Spinner };
