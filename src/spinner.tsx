import type { ReactNode } from "react";

function Spinner({ children, speed }: { children?: ReactNode }): ReactNode {
  return (
    <div className="flex justify-center items-center h-auto">
      {children ? (
        <div className="animate-bounce">{children}</div>
      ) : (
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500" />
      )}
    </div>
  );
}

export { Spinner };
