import { ReactNode, type MouseEvent } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { TabChild, useTabsState } from "../hooks/use-tabs-state";
import { TabsRow, TabsContent } from "../layouts/tabs";
import { Variant } from "../types";
import { Modal } from "./modal";

export interface TabbedModalProps {
  children: TabChild[];
  open: boolean;
  title?: string | ReactNode;
  description?: string | ReactNode;
  headerBottom?: ReactNode;
  dismissDisabled?: boolean;
  submitDisabled?: boolean;
  submitText?: string;
  onStateChange: (open: boolean) => void;
  onTabChange?: (selected: string) => void;
  selected?: string; // Optional selected tab key, defaults to first tab if not provided
  onSubmit?: (event: MouseEvent) => void;
  onCancel?: (event: MouseEvent) => void;
  variant?: Variant;
  /** See `Modal.closeOnSubmitClick`. Forwarded as-is. */
  closeOnSubmitClick?: boolean;
}

/**
 * A modal dialog component with integrated tabbed interface for organizing content.
 *
 * This component extends the base Modal with tabbed functionality, automatically managing
 * tab state and providing smooth sliding animations between tab content. It wraps the
 * standard Modal component with Radix UI's Tabs primitive and renders tab navigation
 * in the header area below the description.
 *
 * Features:
 * - Automatic tab state management with useTabsState hook
 * - Smooth sliding animations between tab content based on navigation direction
 * - Tab navigation rendered in modal header below description
 * - Support for icons, labels, or both on tabs
 * - Combines user's headerBottom content with tab navigation
 * - All standard modal functionality (submit/cancel, dismissal, etc.)
 * - Responsive design with proper scroll handling
 * - Automatic default content when no tabs are provided
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const tabs = [
 *   {
 *     key: "general",
 *     title: "General Settings",
 *     icon: <IconSettings />,
 *     content: <GeneralSettingsForm />
 *   },
 *   {
 *     key: "advanced",
 *     title: "Advanced",
 *     icon: <IconCode />,
 *     variant: Variant.Warning,
 *     content: <AdvancedSettingsForm />
 *   }
 * ];
 *
 * <TabbedModal
 *   open={isOpen}
 *   onStateChange={setIsOpen}
 *   title="Application Settings"
 *   description="Configure your application settings"
 *   children={tabs}
 *   submitText="Save Settings"
 *   onSubmit={(event) => handleSave()}
 *   onCancel={(event) => setIsOpen(false)}
 *   variant={Variant.Primary}
 * />
 * ```
 *
 * @param children - Array of tab objects, each containing key, title, content, and optional icon/variant
 * @param open - Controls whether the modal is visible
 * @param title - Optional title displayed in the modal header
 * @param description - Optional description text below the title
 * @param headerBottom - Optional additional content rendered below tabs but within header area
 * @param dismissDisabled - When true, prevents closing modal via ESC key or click-away
 * @param submitDisabled - When true, disables the submit button
 * @param submitText - Text for the submit button (defaults to "Submit")
 * @param onStateChange - Callback fired when modal should open/close
 * @param onSubmit - Optional callback for submit button click (shows submit button when provided)
 * @param onCancel - Optional callback for cancel button click (shows cancel button when provided)
 * @param variant - Visual variant for styling the modal and buttons
 */
export function TabbedModal({
  children,
  open,
  title,
  description,
  headerBottom,
  dismissDisabled = false,
  submitDisabled,
  submitText = "Submit",
  onStateChange,
  onTabChange,
  selected,
  onSubmit,
  onCancel,
  variant,
  closeOnSubmitClick,
}: TabbedModalProps) {
  const { childrenTabs } = useTabsState(children, selected, undefined, "No tabs");

  const tabsContent = <TabsContent childrenTabs={childrenTabs} />;

  const combinedHeaderBottom = (
    <>
      <TabsRow visuals="both" selected={selected} tabsContainerClassName="px-0.5 pb-0.5">
        {childrenTabs}
      </TabsRow>
      {headerBottom}
    </>
  );

  return (
    <TabsPrimitive.Root
      value={selected}
      onValueChange={(value) => {
        if (typeof value === "string") {
          onTabChange?.(value);
        }
      }}
    >
      <Modal
        open={open}
        title={title}
        description={description}
        headerBottom={combinedHeaderBottom}
        dismissDisabled={dismissDisabled}
        submitDisabled={submitDisabled}
        submitText={submitText}
        onStateChange={onStateChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        variant={variant}
        closeOnSubmitClick={closeOnSubmitClick}
      >
        {tabsContent}
      </Modal>
    </TabsPrimitive.Root>
  );
}
