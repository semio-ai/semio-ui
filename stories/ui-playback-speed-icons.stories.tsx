import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "@semio/ui";

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: "ui/Playback Speed Icons",
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Rates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 text-neutral-800 dark:text-neutral-100">
      {[18, 24, 36].map((size) => (
        <div key={size} className="flex gap-6">
          {(["0.1", "0.5", "1.0", "1.5", "2.0"] as const).map((rate) => (
            <div key={rate} className="flex w-20 flex-col items-center gap-2">
              <Icon name={`playback-${rate}`} size="none" style={{ width: size, height: size }} />
              <span className="text-xs">
                {rate}× · {size}px
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
