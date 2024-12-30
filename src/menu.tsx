import { ReactNode } from "react";
import { atom, useAtom } from "jotai";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

export interface MenuProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Menu({ header, footer, children }: MenuProps) {
  const { open } = useMenu();
  return (
    <div
      role="tablist"
      data-ui={open ? "expanded" : ""}
      className="group/menu relative transition-all duration-150 h-full w-10 data-expanded:w-48 min-w-10 content-between flex flex-col overflow-x-hidden"
    >
      <ScrollArea
        className="dark:bg-[#333] bg-[#ccc]"
        orientation="vertical"
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

const menuOpenState = atom(false);

export function useMenu(): { open: boolean; setOpen: (open: boolean) => void } {
  const [open, setOpen] = useAtom(menuOpenState);

  return {
    open,
    setOpen,
  };
}
