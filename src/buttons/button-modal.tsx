import { ReactNode, useState, type MouseEvent } from "react";
import { Modal } from "../modal";
import { Button } from "../button";

export interface ButtonModalProps {
  children: ReactNode;
  button: ReactNode;
  modalTitle: string;
  modalDescription?: string;
  className?: string;
  open: boolean;
  onClose?: (event: MouseEvent) => void;
  onSubmit?: (event: MouseEvent) => void;
}

export function ButtonModal({
  children,
  button,
  modalTitle,
  modalDescription,
  className,
  onSubmit,
  onClose,
}: ButtonModalProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);

  const CN = className
    ? className
    : "bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow";

  // const onSubmit = () => {
  //   console.log("Submit called from in modal");
  //   setShowModal(false);
  // };

  return (
    <div className="flex justify-center">
      {button}

      <Modal
        open={showModal}
        onStateChange={(v) => {
          setShowModal(v);
        }}
        title={modalTitle}
        description={modalDescription ?? ""}
        onSubmit={(e) => {
          onSubmit?.(e);
          setShowModal(false);
        }}
        onCancel={(e) => {
          onClose?.(e);
          setShowModal(false);
        }}
      >
        {children}
      </Modal>
    </div>
  );
}
