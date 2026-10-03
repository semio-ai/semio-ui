import { memo } from "react";
import { clsx } from "clsx";
import {
  useActionItems,
  useActiveRightPane,
  useDesktopState,
  useHomeActionItem,
  usePanes,
  useRightMenuItems,
  useRightRegionActive,
  useSidePaneStack,
  useToolbarItems,
} from "../../hooks/layout-atoms";
import { Dropdown } from "../../floating/dropdown";
import { NestedLabel } from "../../nested-elements/label";
import { NestedChild } from "../../nested-elements/configured-render";
import { Icon, resolveIcon, type IconValue } from "../../icons/registry";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { PaneRegion, Size, ToolbarWidget, Variant } from "../../types";
import { HeaderButton } from "../../buttons/header-button";
import { isPlaceholder } from "./types";
import { showingSidePane } from "./side-pane-area";
import { paneCloseLabel, paneOpenLabel } from "./pane-control-labels";

function InnerHeader({ homeIcon }: { homeIcon?: IconValue }) {
  const desktop = useDesktopState();
  const toolbarItems = useToolbarItems();
  const homeActionItem = useHomeActionItem();
  const actionItems = useActionItems();
  const { toggleMenu, togglePaneRegion } = useLayoutActions();
  const rightMenuItems = useRightMenuItems();
  const rightRegionActive = useRightRegionActive();
  const activeRightPaneId = useActiveRightPane();
  const sideStack = useSidePaneStack();
  const panes = usePanes();
  // The side-panel toggle's name comes from the pane it acts on, so what the control
  // says and what it does always describe the same pane.
  const toggleTargetId: string | undefined = activeRightPaneId ?? rightMenuItems[0]?.id;
  const toggleTarget = panes.find((pane) => pane.id === toggleTargetId);
  // Docked, the toggle is hidden while its region is open, so it only ever opens. In
  // the shared row it stays put and closes its pane while that pane is the one showing;
  // covered by a Left pane, the same press brings it forward, which is an open.
  const toggleCloses =
    !desktop && toggleTargetId !== undefined && showingSidePane(sideStack)?.id === toggleTargetId;

  const mobileMenuItems = toolbarItems.filter(
    (item) => item.type === "toolbar-widget" && item.mobileConfig?.location === "menu",
  ) as ToolbarWidget[];

  return (
    <div className="grid-area-header z-0 h-full w-full">
      <div
        className={clsx(
          "flex h-10 items-center justify-stretch",
          // `desktop:pr-0` to match the existing `desktop:pl-0`: on desktop the
          // header carries no outer padding, so its contents line up with the
          // content panel beneath it. The stray `pr-1` left the trailing item 4px
          // short of that edge — invisible while a spacer sat there, obvious once
          // the toolbar's own card grew into the gap.
          "desktop:gap-1 desktop:pr-0 desktop:pl-0 w-full flex-row gap-2 pr-1 pl-1",
        )}
      >
        <span className="desktop:hidden grid flex-none place-items-center">
          <Dropdown
            side="bottom"
            disabled={
              !homeActionItem ||
              isPlaceholder(homeActionItem) ||
              homeActionItem.children.length + actionItems.length === 0
            }
            trigger={
              <span>
                <button
                  type="button"
                  role="tab"
                  className={clsx("grid h-9 w-9 place-items-center")}
                  onClick={() => {
                    toggleMenu();
                  }}
                >
                  {resolveIcon(homeIcon) ?? <Icon name="home" />}
                </button>
              </span>
            }
          >
            {homeActionItem &&
              !isPlaceholder(homeActionItem) &&
              homeActionItem?.children.map((child) => <NestedChild key={child.id} {...child} />)}
          </Dropdown>
        </span>

        {toolbarItems.map((item) => {
          const showMobile =
            item.type === "toolbar-widget" && item.mobileConfig?.location === "header";
          if (item.type === "toolbar-spacer" && desktop)
            return <div key={item.id} className="flex-1" />;
          else if (!desktop && showMobile) return item.mobileConfig?.component ?? item.component;
          else if (desktop && item.type === "toolbar-widget") return item.component;
          return null;
        })}

        <div className="desktop:hidden flex h-9 flex-1" />

        <Dropdown
          disabled={mobileMenuItems.length + actionItems.length === 0}
          trigger={
            <HeaderButton
              className="desktop:hidden grid flex-none"
              variant={Variant.Default}
              size={Size.Md}
              label="Toggle Menu"
              icon={<Icon name="navigation-menu" />}
            />
          }
        >
          {mobileMenuItems.length > 0 && (
            <>
              <NestedLabel className="flex sm:hidden">Actions</NestedLabel>
              {mobileMenuItems.map(
                (item: ToolbarWidget) =>
                  (item as ToolbarWidget).mobileConfig?.component ?? item.component,
              )}
            </>
          )}
          {actionItems.map(
            (item) => !isPlaceholder(item) && <NestedChild key={item.id} type="menu" {...item} />,
          )}
        </Dropdown>

        {/* No spacer here. A surface that wants its trailing controls pushed to the
            right registers a `toolbar-spacer` item, which the loop above renders.

            It used to be hardcoded, so every toolbar got one whether it wanted one or
            not — and a toolbar whose own content should absorb the free width had to
            out-grow it, which is why the dashboard's search card carried
            `grow-[9999]` against this `flex-1`. Two elements competing for the same
            space is not a layout. Opting in makes "what takes the slack" a property of
            the surface, which is where it is known. */}

        <HeaderButton
          className={clsx(
            "flex-none",
            // Docked toolbars need the same 8px separation as adjacent cards.
            // Keep that spacing on the control so closing its slot also removes it.
            "desktop:ml-1",
            // Keep the mobile control in this slot while the side pane occupies
            // the shared row. Docked panes carry their own close control.
            rightRegionActive && desktop ? "hidden" : "grid",
          )}
          variant={Variant.Default}
          size={Size.Md}
          label={toggleCloses ? paneCloseLabel(toggleTarget) : paneOpenLabel(toggleTarget)}
          icon={<Icon name={toggleCloses ? "close" : "inspect"} />}
          disabled={
            rightMenuItems.length === 0 ||
            rightMenuItems.filter((item) => !item.disabled).length === 0
          }
          onClick={() => {
            if (toggleTargetId !== undefined) togglePaneRegion(PaneRegion.Right, toggleTargetId);
          }}
        />
      </div>
    </div>
  );
}

export const Header = memo(InnerHeader);
