import { Result } from "@semio/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type ToastData,
  type ToastContainerProps,
  Variant,
  ToastManager,
  useAddToast,
  ToastContext,
  Button,
  Size,
} from "@semio/ui";
import { type ReactElement, type ReactNode, useContext, useEffect, useRef } from "react";

const meta: Meta<typeof ToastManager> = {
  component: ToastManager,
  title: "ui/ToastManager",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToastManager>;

enum ToastExampleKind {
  Plain,
  Dismiss,
  Clipboard,
  ActionMenu,
}

const toastExampleKinds = [
  ToastExampleKind.Plain,
  ToastExampleKind.Dismiss,
  ToastExampleKind.Clipboard,
  ToastExampleKind.ActionMenu,
];

function AddButton(): ReactNode {
  const addToast = useAddToast();
  const nextExample = useRef(0);
  return (
    <button
      type="button"
      className="pointer-events-auto bg-neutral-500 p-2 text-white select-none"
      onClick={() => {
        const kind = toastExampleKinds[nextExample.current++ % toastExampleKinds.length];
        const variant = getRandomVariant();
        const id = crypto.randomUUID();
        const [title, content] = getRandomTitleContent();
        addToast({
          id,
          title,
          content,
          variant,
          clipboardContent:
            kind === ToastExampleKind.Clipboard
              ? JSON.stringify({ id, title, content, variant }, null, 2)
              : undefined,
          actionMenu:
            kind === ToastExampleKind.ActionMenu
              ? {
                  icon: "menu2",
                  label: "Notification actions",
                  items: [
                    {
                      id: "prepare",
                      label: "Prepare export",
                      onSelect: () => Result.Ok<string, string>("Export prepared."),
                    },
                    {
                      id: "fail",
                      label: "Try unavailable export",
                      onSelect: () => Result.Err<string, string>("Export unavailable. Try again."),
                    },
                    {
                      id: "slow",
                      label: "Prepare slowly (6 seconds)",
                      onSelect: async () => {
                        await new Promise((resolve) => setTimeout(resolve, 6000));
                        return Result.Ok<string, string>("Slow export prepared.");
                      },
                    },
                  ],
                }
              : undefined,
          dismiss:
            kind === ToastExampleKind.Dismiss
              ? {
                  label: getRandomAction(),
                  onClick: (data: ToastData) => {
                    console.log(data);
                  },
                }
              : undefined,
        });
      }}
    >
      Add Toast
    </button>
  );
}

// Create a wrapped version of the story with hooks to
// illustrate callback behavior
function ToastContainerWithHooks(props: ToastContainerProps): ReactElement {
  return (
    <ToastManager {...props}>
      <AddButton />
    </ToastManager>
  );
}

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: (props) => {
    return <ToastContainerWithHooks {...props} />;
  },
  name: "Toast Manager",
};

const exampleToasts: ToastData[] = [
  {
    id: "save-error",
    title: "Project save failed",
    content: "Your changes are still here. Try saving again.",
    variant: Variant.Error,
    clipboardContent: JSON.stringify(
      {
        operation: "save-project",
        error: { name: "DriverError", kind: "no-response", message: "Save was not confirmed." },
        session: "anonymous",
        pane: "Devices",
        build: "storybook-example",
      },
      null,
      2,
    ),
    dismiss: 60000,
  },
  {
    id: "device-warning",
    title: "Device connection failed",
    content: "The device did not respond. Check its connection and try again.",
    variant: Variant.Warning,
    clipboardContent:
      "Operation: connect-device\nError: Connection timed out\nBuild: storybook-example",
    dismiss: 60000,
  },
  {
    id: "save-success",
    title: "Project saved",
    content: "Your changes have been saved.",
    variant: Variant.Success,
    dismiss: 60000,
  },
];

function ClipboardExamplesContent({
  toasts = exampleToasts,
  heading = "Toast clipboard proposal",
}: {
  toasts?: ToastData[];
  heading?: string;
}) {
  const { addToast, clear } = useContext(ToastContext);
  useEffect(() => {
    toasts.forEach(addToast);
    return clear;
  }, [addToast, clear, toasts]);
  return (
    <div className="min-h-screen w-full p-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-lg font-medium">{heading}</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
        Errors and warnings can offer copyable details. Ordinary notifications keep their simple
        layout.
      </p>
      <div className="mt-4">
        <Button
          size={Size.Sm}
          onClick={() => {
            clear();
            toasts.forEach(addToast);
          }}
        >
          Show examples again
        </Button>
      </div>
    </div>
  );
}

/** Long durations keep this comparison available for visual review. */
export const ClipboardExamples: Story = {
  render: () => (
    <ToastManager>
      <ClipboardExamplesContent />
    </ToastManager>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Optional `clipboardContent` adds an outlined clipboard icon beside Close. Copying leaves the toast open, confirms success, and permits retry after failure. These examples stay for 60 seconds; payload-bearing toasts normally stay for 10 seconds.",
      },
    },
  },
};

function getRandomVariant(): Variant {
  const variants: Variant[] = [
    Variant.Success,
    Variant.Error,
    Variant.Warning,
    Variant.Default,
    Variant.Primary,
    Variant.Secondary,
    Variant.Info,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function getRandomAction(): string {
  const actions: string[] = ["Undo", "Retry", "Cancel", "Dismiss", "Close", "Destroy"];
  return actions[Math.floor(Math.random() * actions.length)];
}

function getRandomTitleContent(): [string, string | undefined] {
  const titles: string[] = ["Saved", "Error", "What?", "Just Title", "Long Description"];
  const contents: (string | undefined)[] = [
    "The project was saved!",
    "There was an error saving the project. Please try again.",
    "I'm just as confused as you.",
    undefined,
    "This is a really long description. It's so long that it might not fit in the toast. I wonder what will happen if it doesn't fit. Will it wrap? Will it be cut off? Will it be truncated? I guess we'll find out soon enough.",
  ];
  const index = Math.floor(Math.random() * titles.length);
  return [titles[index], contents[index]];
}

const genericActionToasts: ToastData[] = [
  {
    id: "export-actions",
    title: "Export ready",
    content: "Choose what to do with this export.",
    variant: Variant.Info,
    dismiss: 60000,
    actionMenu: {
      icon: "menu2",
      label: "Export actions",
      items: [
        {
          id: "copy-id",
          label: "Copy export ID",
          icon: "copy",
          onSelect: async () => {
            try {
              await navigator.clipboard.writeText("example-export");
              return Result.Ok<string, string>("Export ID copied.");
            } catch {
              return Result.Err<string, string>("Could not copy the export ID.");
            }
          },
        },
        {
          id: "prepare",
          label: "Prepare export",
          onSelect: () => Result.Ok<string, string>("Export prepared."),
        },
      ],
    },
  },
];

export const ActionMenuExample: Story = {
  render: () => (
    <ToastManager>
      <ClipboardExamplesContent toasts={genericActionToasts} heading="Toast action menu" />
    </ToastManager>
  ),
};
