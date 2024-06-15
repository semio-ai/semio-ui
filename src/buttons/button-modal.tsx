import { useState } from "react";
import { Modal } from "../modal";
import { Button } from "../button";

export interface ButtonModalProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    buttonTitle: string;
    modalTitle: string;
}

export function ButtonModal({ children, buttonTitle, modalTitle }: ButtonModalProps): JSX.Element {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex justify-center">
      <Button 
        onClick={()=>setShowModal(true)} 
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
        >
        {buttonTitle}
      </Button>
      <Modal open={showModal} onClickBackdrop={() => {setShowModal(false)}} title={modalTitle}>
        {children}
      </Modal>
    </div>
  );
};