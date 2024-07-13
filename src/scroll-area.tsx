import { type ReactNode } from "react";
import * as RadixScrollArea from "@radix-ui/react-scroll-area";
// import { ParentSize } from "@visx/responsive";

export function ScrollArea({ children }: { children: ReactNode }) {
  return (
    <RadixScrollArea.Root
      className="w-full h-full"
      // style={{ height, width }}
    >
      <RadixScrollArea.Viewport className="w-full h-full">
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar
        className="flex select-none touch-none p-0.5 bg-black/5 dark:bg-white/5 transition-colors duration-[160ms] ease-out hover:dark:bg-white/25 hover:bg-black/25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
        orientation="vertical"
      >
        <RadixScrollArea.Thumb className="flex-1 bg-default-500/75 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Scrollbar
        className="flex select-none touch-none p-0.5 bg-black/5 dark:bg-white/5 transition-colors duration-[160ms] ease-out hover:dark:bg-white/25 hover:bg-black/25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
        orientation="horizontal"
      >
        <RadixScrollArea.Thumb className="flex-1 bg-default-500/75 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Corner className="bg-black/5" />
    </RadixScrollArea.Root>
  );
}
