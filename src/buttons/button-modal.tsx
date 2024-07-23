export interface ButtonModalProps {
  titleText: string;
  onClick: () => void;
}

export function ButtonModal({
  titleText,
  onClick,
}: ButtonModalProps): JSX.Element {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="m-1 p-1 bg-tertiary-700 hover:bg-tertiary-900 text-white"
    >
      {titleText}
    </button>
  );
}
