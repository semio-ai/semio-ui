import { type ReactNode, useEffect, useRef } from 'react';

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  title?: string;
  onClickBackdrop?: () => void;
}

export const Modal = ({ children, open, title, onClickBackdrop }: ModalProps): ReactNode => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef && open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [dialogRef, open]);
  if (!open) {
    return null;
  }
  return (
    <dialog ref={dialogRef} className="modal" onClick={onClickBackdrop}>
      <div
        className="modal-box container mx-auto rounded-none
                   dark:bg-gray-800/30 bg-gray-500/30 dark:text-gray-200 text-gray-800
                   p-0 backdrop-blur border-2 border-transparent border-t-orange-500"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="text-2xl dark:bg-gray-800/30 bg-gray-500/30 p-2">{title || 'Modal'}</div>
        {children}
      </div>
    </dialog>
  );
};