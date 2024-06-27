import { ReactNode, useState, type MouseEvent } from "react";
import { Modal } from "../modal";
import { Button } from "../button";

export interface ButtonModalProps {
  text: string;
  onClick: () => void;
}

export function ButtonModal({
  text, onClick
}: ButtonModalProps): JSX.Element {



  return (
  <button
    type="submit"
    onClick={onClick}
    className="m-1 p-1 rounded-sm bg-tertiary-700 hover:bg-tertiary-900 text-white"
  >
    {text}
  </button>
  );
}
