import { useState, type ReactNode } from "react";
import type { Meta, StoryObj, ReactRenderer } from "@storybook/react";
import { type ArgsStoryFn } from "@storybook/core/csf";
import { Button, Modal, Variant, type ModalProps } from "@semio/ui";

const meta: Meta<typeof Modal> = {
  component: Modal,
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

type Story = StoryObj<typeof Modal>;

function ModalRenderer(props: ModalProps): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(!open)} variant={props.variant}>
        {open ? "Close" : "Open"} Modal
      </Button>
      <Modal {...props} open={open} onStateChange={setOpen} onCancel={() => setOpen(false)} />
    </>
  );
}

const lorem = [
  "Lorem ipsum dolor sit amet, ",
  "consectetur adipiscing elit. Morbi efficitur cursus ornare. ",
  "Vivamus iaculis tristique arcu sit amet aliquam. ",
  "Vestibulum placerat luctus erat a blandit. Nam erat lorem, ",
  "faucibus id neque ac, mollis tempus sapien. Aliquam sagittis ",
  "diam ac diam mollis sollicitudin. Sed accumsan efficitur nibh, ",
  "quis luctus lorem tincidunt non. Etiam erat ligula, viverra ",
  "at feugiat in, vulputate at metus. Cras molestie pretium tincidunt. ",
  "Integer pulvinar ligula enim, eget aliquam quam feugiat sit amet. ",
  "Mauris ultricies euismod magna, nec facilisis quam laoreet eget. ",
  "Sed ultrices purus a bibendum maximus. Ut semper porttitor ",
  "nibh et fringilla. Etiam quis orci quis velit blandit pretium ",
  "sit amet eget odio. Maecenas vehicula id velit eu tempus. ",
  "Vivamus suscipit, odio ut vehicula fermentum, nisl orci interdum ",
  "turpis, ut convallis neque dui blandit diam. Pellentesque ",
  "habitant morbi tristique senectus et netus et malesuada ",
  "fames ac turpis egestas. Mauris tempus elit nec nunc sodales ",
  "laoreet. Aliquam sit amet faucibus metus, at semper ligula. ",
  "Vivamus ut tortor nisi. In justo diam, lacinia non cursus ",
  "ultricies, posuere sit amet massa. Etiam fringilla in sapien ",
  "eget congue. Nunc scelerisque vestibulum purus, sed ornare arcu ",
  "efficitur ut. Phasellus auctor felis ac turpis feugiat vehicula. ",
  "Sed sed orci orci. Etiam consectetur lectus id fringilla finibus. ",
  "Nulla eleifend cursus nunc egestas sagittis. Fusce egestas, ipsum ",
  "quis venenatis vulputate, nulla est egestas mi, id semper sem ",
  "turpis non mi. Vivamus tellus lacus, sagittis at pretium nec, ",
  "feugiat vel nisl. Curabitur congue nisl eros, a varius massa ",
  "finibus id. Nulla ultricies metus quis tristique iaculis. Curabitur ",
  "non ipsum dui. Integer euismod tempor urna sit amet rutrum. ",
  "Class aptent taciti sociosqu ad litora torquent per conubia nostra, ",
  "per inceptos himenaeos. Fusce quis bibendum quam, vel congue erat. ",
  "Donec id diam eu sapien molestie lobortis. Etiam euismod luctus odio, ",
  "in euismod dolor hendrerit aliquam. Cras at leo dictum erat commodo ",
  "lacinia a in turpis. Sed laoreet justo in scelerisque convallis. ",
  "In risus ipsum, porta ac eros in, lobortis vulputate orci. ",
  "Vivamus arcu justo, pharetra ut accumsan sed, interdum vel ex. ",
  "In dolor leo, laoreet a facilisis sit amet, viverra eget nulla. ",
  "Quisque egestas eros eget ipsum ultricies condimentum. ",
  "Donec ut nisl nec est finibus luctus nec at erat. Etiam porta ",
  "mattis tellus quis pharetra. Sed vel mattis mi, quis scelerisque ",
  "neque. Vivamus cursus leo at odio accumsan dictum. ",
  "Phasellus iaculis augue vitae massa tincidunt varius. ",
  "Maecenas tincidunt commodo neque non suscipit. Curabitur ",
  "feugiat erat eget mauris porttitor, eu malesuada orci imperdiet. ",
  "Nunc eget viverra ex. Vestibulum dapibus malesuada rhoncus. ",
  "Maecenas eleifend porttitor accumsan. Class aptent taciti ",
  "sociosqu ad litora torquent per conubia nostra, per inceptos ",
  "himenaeos. Donec vel ante volutpat, blandit erat nec, sodales ",
  "ligula. Maecenas tempus ultricies nunc a tempus. Aliquam quis ",
  "vulputate neque.",
].join("");

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Default,
    scrollDisabled: true,
  },
};

export const Primary: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Primary,
  },
};

export const Secondary: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Secondary,
  },
};

export const Tertiary: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Tertiary,
  },
};

export const Info: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Info,
  },
};

export const Success: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Success,
  },
};

export const Warning: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Warning,
  },
};

export const Error: Story = {
  render: ModalRenderer as ArgsStoryFn<ReactRenderer, ModalProps>,
  args: {
    title: "Modal Title",
    description: "Modal Description",
    children: lorem,
    variant: Variant.Error,
  },
};
