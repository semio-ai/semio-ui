import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type ToastData,
  type ToastContainerProps,
  Variant,
  ToastManager,
  useAddToast,
} from "@semio/ui";
import { type ReactNode } from "react";

const meta: Meta<typeof ToastManager> = {
  component: ToastManager,
  title: "ui/ToastManager",
  decorators: [
    (Story) => (
      <div className="grid place-items-center p-5 h-full">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToastManager>;

function AddButton(): ReactNode {
  const addToast = useAddToast();
  return (
    <button
      type="button"
      className="bg-neutral-500 text-white p-2 select-none pointer-events-auto"
      onClick={() => {
        // eslint-disable-next-line no-console -- alert for demo
        console.log("adding toast");
        const variant = getRandomVariant();
        const id = crypto.randomUUID();
        const [title, content] = getRandomTitleContent();
        addToast({
          id,
          title,
          content,
          variant,
          dismiss:
            Math.random() > 0.5
              ? {
                  label: getRandomAction(),
                  onClick: (data: ToastData) => {
                    // eslint-disable-next-line no-console -- alert for demo
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
function ToastContainerWithHooks(props: ToastContainerProps): JSX.Element {
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
