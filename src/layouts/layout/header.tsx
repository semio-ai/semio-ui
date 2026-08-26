import { memo } from "react";
import { clsx } from "clsx";
import {
  useActionItems,
  useActiveRightPane,
  useDesktopState,
  useHomeActionItem,
  useRightMenuItems,
  useRightRegionActive,
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

function InnerHeader({ homeIcon }: { homeIcon?: IconValue }) {
  const desktop = useDesktopState();
  const toolbarItems = useToolbarItems();
  const homeActionItem = useHomeActionItem();
  const actionItems = useActionItems();
  const { toggleMenu, togglePaneRegion } = useLayoutActions();
  const rightMenuItems = useRightMenuItems();
  const rightRegionActive = useRightRegionActive();
  const activeRightPaneId = useActiveRightPane();

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
              size={Size.Sm}
              label="Toggle Menu"
              icon={<Icon name="menu2" />}
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
            // `ml-1` on top of the row's `gap-1` makes 8px — the same separation the
            // toolbar's own cards keep from each other (`gap-1` plus their `mr-1`).
            // The row gap alone left this button 4px from the preceding card, which
            // reads as touching when both carry a border. Margin on the button rather
            // than padding on the row, so it disappears with the button when a right
            // pane is open instead of lingering as a phantom inset.
            "desktop:ml-1",
            // Shown at every width. It used to be desktop-only, which made the
            // right region *unreachable* on a phone rather than merely arranged
            // differently — the panes it opens are now sheets, so the control that
            // opens them has to exist wherever they do. Still hidden while the
            // region is open, where the pane carries its own way out.
            rightRegionActive ? "hidden" : "grid",
          )}
          variant={Variant.Default}
          size={Size.Md}
          // Named for what it does. It shared "Toggle Menu" with the actions
          // dropdown beside it, so the two were indistinguishable to anything
          // that goes by accessible name.
          label="Toggle side panel"
          icon={
            <Icon
              name="sidebar-toggle"
              className={clsx(
                "transition-transform duration-100 ease-in-out",
                rightRegionActive ? "rotate-360" : "rotate-180",
              )}
            />
          }
          disabled={
            rightMenuItems.length === 0 ||
            rightMenuItems.filter((item) => !item.disabled).length === 0
          }
          onClick={() =>
            togglePaneRegion(PaneRegion.Right, activeRightPaneId ?? rightMenuItems[0]?.id)
          }
        />
      </div>
    </div>
  );
}

export const Header = memo(InnerHeader);
