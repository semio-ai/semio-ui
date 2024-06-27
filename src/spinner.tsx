import type { ReactNode } from "react";

function Spinner({ children }: { children?: ReactNode }): ReactNode {
  return (
    <div className="flex justify-center items-center h-auto">
      {children ? (
        <div className="animate-bounce-spin relative">
          {/* <div className="blur-lg absolute translate-x-2 translate-y-2 rounded-full w-16 h-16 bg-[conic-gradient(#9233ea,#db2777,#2564eb,#9233ea)]" /> */}
          <div className="relative">{children}</div>
        </div>
      ) : (
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500" />
      )}
    </div>
  );
}

export { Spinner };
