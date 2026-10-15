import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Dialog, Variant, type DialogProps } from "@semio/ui";

import { dialogComponent } from "./figma-links";

const design = (url: string) => ({ design: { type: "figma" as const, url } });

const meta: Meta<typeof Dialog> = {
  parameters: design(dialogComponent),
  component: Dialog,
  title: "ui/Dialog",
  decorators: [
    (Story) => (
      <div className="grid h-full place-items-center p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

function DialogRenderer(props: DialogProps): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(!open)} variant={props.variant}>
        {open ? "Close" : "Open"} Dialog
      </Button>
      <Dialog
        {...props}
        open={open}
        onStateChange={setOpen}
        onSubmit={(event) => {
          props.onSubmit?.(event);
          setOpen(false);
        }}
        onCancel={(event) => {
          props.onCancel?.(event);
          setOpen(false);
        }}
      />
    </>
  );
}

const confirmCopy =
  "This action will permanently apply the change. Are you sure you want to continue?";

export const Confirmation: Story = {
  name: "Confirmation (no body)",
  render: (args) => <DialogRenderer {...args} />,
  args: {
    title: "Confirm action",
    description: confirmCopy,
    children: null,
    submitText: "Confirm",
    variant: Variant.Default,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When no body is provided, the description acts as the dialog's message. Only a single hairline appears between the header and the footer — the empty body div is skipped entirely so there's no double divider.",
      },
    },
  },
};

export const WithBody: Story = {
  name: "With body (description as subtitle)",
  render: (args) => <DialogRenderer {...args} />,
  args: {
    title: "Remove tracks",
    description: "The following tracks will be removed from this animation.",
    children: (
      <ul className="list-disc pl-5 text-sm">
        <li>walk_cycle</li>
        <li>idle_pose</li>
        <li>wave_hand</li>
      </ul>
    ),
    submitText: "Remove",
    variant: Variant.Error,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When children are provided, the description sits inside the header as a subtitle and the body renders below it. Two hairlines flank the body — one between header and body, one between body and footer.",
      },
    },
  },
};

export const BodyOnly: Story = {
  name: "Body only (no description)",
  render: (args) => <DialogRenderer {...args} />,
  args: {
    title: "Heads up",
    children: (
      <p className="max-w-80 text-sm leading-relaxed text-neutral-500">
        Sometimes the body is the entire message — no header subtitle needed. The hairlines still
        demarcate the three sections cleanly.
      </p>
    ),
    submitText: "Got it",
    variant: Variant.Info,
  },
};

function AsyncDialogRenderer(props: DialogProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={props.variant}>
        Open async dialog
      </Button>
      <Dialog
        {...props}
        open={open}
        onStateChange={setOpen}
        submitDisabled={submitting}
        cancelDisabled={submitting}
        dismissDisabled={submitting}
        closeOnSubmitClick={false}
        onSubmit={async () => {
          setSubmitting(true);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setSubmitting(false);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const AsyncSubmit: Story = {
  name: "Async submit (stays open until resolved)",
  render: (args) => <AsyncDialogRenderer {...args} />,
  args: {
    title: "Save changes?",
    description:
      "The dialog stays open until the async submit handler resolves. Useful for network calls that should surface errors inline.",
    children: null,
    submitText: "Save",
    variant: Variant.Primary,
  },
};

const variantArgs: Partial<DialogProps> = {
  title: "Confirm action",
  description: confirmCopy,
  children: null,
  submitText: "Confirm",
};

export const Default: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Default },
};

export const Primary: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Primary },
};

export const Secondary: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Secondary },
};

export const Tertiary: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Tertiary },
};

export const Info: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Info },
};

export const Success: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Success },
};

export const Warning: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: { ...variantArgs, variant: Variant.Warning },
};

export const Error: Story = {
  render: (args) => <DialogRenderer {...args} />,
  args: {
    title: "Delete project",
    description:
      "Deleting this project is permanent and cannot be undone. All associated animations, assets, and history will be removed.",
    children: null,
    submitText: "Delete",
    cancelText: "Keep",
    variant: Variant.Error,
  },
};

function StepDialogRenderer(): ReactNode {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setConfirm(false);
          setOpen(true);
        }}
      >
        Open invitation
      </Button>
      <Dialog
        open={open}
        onStateChange={setOpen}
        title="Organization invitation"
        description={confirm ? "Decline this invitation?" : "Robotics Lab invited you as Member."}
        closeOnCancelClick={false}
        onCancel={() => setConfirm(!confirm)}
        cancelText={confirm ? "Cancel" : "Decline"}
        submitText={confirm ? "Decline" : "Accept"}
        onSubmit={() => setOpen(false)}
      />
    </>
  );
}

export const CancelChangesStep: Story = {
  render: () => <StepDialogRenderer />,
  parameters: {
    docs: {
      description: {
        story:
          "closeOnCancelClick=false keeps the dialog open while the cancel action changes its step. The header X still dismisses the dialog.",
      },
    },
  },
};
