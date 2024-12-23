import { ReactNode } from "react";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

export interface MenuProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Menu({ header, footer, children }: MenuProps) {
  return (
    <div
      className="relative transition-all duration-150 h-full w-10 min-w-10 content-between flex flex-col"
      role="tablist"
    >
      <ScrollArea
        className="dark:bg-[#333] bg-[#ccc]"
        header={
          header ? (
            <>
              {header}
              <Separator orientation="horizontal" variant="layout" />
            </>
          ) : undefined
        }
        footer={
          footer ? (
            <>
              <Separator orientation="horizontal" variant="layout" />
              {footer}
            </>
          ) : undefined
        }
      >
        {children}
      </ScrollArea>
    </div>
  );
}
