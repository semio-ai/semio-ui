import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "@semio/ui";
import { spinnerPreview } from "./figma-links";

// The Figma preview is a static representation of the animated ring.
const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  title: "ui/Spinner",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  parameters: design(spinnerPreview),
  render: () => <Spinner />,
};
