import { ReactNode, useState } from "react";
import { Modal } from "../modal";
import { Button } from "../button";

export interface ButtonModalProps {
  children: (onSubmit: () => void) => ReactNode;
  buttonTitle: string;
  modalTitle: string;
  className?: string;
}

export function ButtonModal({
  children,
  buttonTitle,
  modalTitle,
  className,
}: ButtonModalProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);

  const CN = className
    ? className
    : "bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow";

  const onSubmit = () => {
    console.log("Submit called from in modal");
    setShowModal(false);
  };

  return (
    <div className="flex justify-center">
      <Button onClick={() => setShowModal(true)} className={CN}>
        {buttonTitle}
      </Button>

      <Modal
        open={showModal}
        onClickBackdrop={() => {
          setShowModal(false);
        }}
        title={modalTitle}
      >
        {children(onSubmit)}
      </Modal>
    </div>
  );
}
