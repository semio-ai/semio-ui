import {
  alpha,
  Stack,
  ScrollArea,
  Group,
  Title,
  CloseButton,
} from "@mantine/core";
import { type ReactNode } from "react";
import styled from "@emotion/styled";
import { useElementSize } from "@mantine/hooks";
import { useTransition, animated } from "@react-spring/web";
// import styles from "./layout.module.css";

// import { motion, AnimatePresence } from "framer-motion";

export interface LayoutProps {
  // The contents of the main area
  children: ReactNode;
}

export const Main = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: var(--mantine-color-body);
`;

export const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 0;
`;

export const Footer = styled.div`
  bottom: 0;
  width: 100vw;
  background-color: ${alpha("var(--mantine-color-body)", 0.8)};
  backdrop-filter: blur(10px);
  --Webkit-backdrop-filter: blur(10px);
  z-index: 1;
`;

export const Header = styled.div`
  top: 0;
  width: 100vw;
  background-color: ${alpha("var(--mantine-color-body)", 0.8)};
  backdrop-filter: blur(10px);
  --Webkit-backdrop-filter: blur(10px);
  z-index: 1;
`;

// const SidebarContainer = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   flex: 1;
//   width: 100vw;
//   z-index: 0;
// `;

const CenterContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  height: 0;
  z-index: -1;
`;

export interface SidebarProps {
  // The contents of the sidebar
  sidebars: Record<string, { label: ReactNode; children: ReactNode }>;
  // Id of the sidebar
  id?: string;
  // the sidebar side
  side?: "left" | "right";
  // Callback for when the sidebar changes
  onSidebarChange?: (id: string | undefined) => void;
  // Height
  height: number;
}

export function Sidebar({
  side = "right",
  id,
  sidebars,
  onSidebarChange,
  height,
}: SidebarProps): ReactNode {
  const transitions = useTransition(id, {
    from: {
      transform: side === "right" ? "translateX(100px)" : "translateX(-100px)",
      opacity: 0,
    },
    enter: {
      transform: "translateX(0%)",
      opacity: 1,
    },
    leave: {
      transform: side === "right" ? "translateX(100px)" : "translateX(-100px)",
      opacity: 0,
    },
    exitBeforeEnter: true,
    config: {
      duration: 150,
    },
    delay: 30,
  });

  // const containerRef = useRef<HTMLDivElement>(null);

  // const { ref: containerRef, height } = useElementSize();

  return (
    <>
      {transitions((spring, item) => (
        <animated.div
          // ref={containerRef}
          style={{
            zIndex: 4,
            height,
            // display: "unset",
            // flexDirection: "co",
            // alignItems: "center",
            // backgroundColor: "blue",
            // height: 500,
            minWidth: 200,
            backgroundColor: alpha("var(--mantine-color-body)", 0.8),
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            overflow: "hidden",
            ...spring,
          }}
        >
          <Group
            justify="space-between"
            style={{
              height: 40,
              backgroundColor: alpha("var(--mantine-color-body)", 0.5),
            }}
          >
            <Title order={4} style={{ padding: "0 10px" }}>
              {sidebars[item || ""]?.label}
            </Title>
            <CloseButton
              onClick={() => {
                onSidebarChange?.(undefined);
              }}
              style={{ marginRight: 10 }}
            />
          </Group>

          {/* {sidebars[item || ""]} */}
          <ScrollArea.Autosize mah={height - 40} scrollbars="y">
            {sidebars[item || ""]?.children}
          </ScrollArea.Autosize>
        </animated.div>
      ))}
    </>
  );
}

export interface LayoutManagerProps {
  footer: ReactNode;
  header: ReactNode;
  sidebars: Record<string, { label: ReactNode; children: ReactNode }>;
  backdrop: ReactNode;
  rightSidebar?: string;
  leftSidebar?: string;
  onRightSidebarChange?: (id: string | undefined) => void;
  onLeftSidebarChange?: (id: string | undefined) => void;
}
export function LayoutManager({
  sidebars,
  rightSidebar,
  leftSidebar,
  footer,
  header,
  backdrop,
  onLeftSidebarChange,
  onRightSidebarChange,
}: LayoutManagerProps): ReactNode {
  const { ref: mainRef, height: appHeight } = useElementSize();
  const { ref: headerRef, height: headerHeight } = useElementSize();
  const { ref: footerRef, height: footerHeight } = useElementSize();

  return (
    <Main ref={mainRef}>
      <Backdrop>{backdrop}</Backdrop>
      <Stack
        gap={0}
        flex={1}
        styles={{
          root: { flex: 1, height: "100dvh" },
        }}
      >
        <Header ref={headerRef}>{header}</Header>
        <div style={{ flex: 1, display: "flex" }}>
          <Sidebar
            side="left"
            id={leftSidebar}
            sidebars={sidebars}
            onSidebarChange={onLeftSidebarChange}
            height={appHeight - headerHeight - footerHeight}
          />
          <CenterContainer />
          <Sidebar
            side="right"
            id={rightSidebar}
            sidebars={sidebars}
            onSidebarChange={onRightSidebarChange}
            height={appHeight - headerHeight - footerHeight}
          />
        </div>
        <Footer ref={footerRef}>{footer}</Footer>
      </Stack>
    </Main>
  );
}
