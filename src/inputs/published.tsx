import { useBooleanInput } from "../hooks/formInputHooks";

export interface PublishedInputProps {
  published: boolean;
  onPublishedChange: (value: boolean, field: string) => void;
}

export function PublishedInput({
  published,
  onPublishedChange,
}: PublishedInputProps) {
  const { inputValue, handleChange } = useBooleanInput(
    published,
    onPublishedChange,
    "published",
  );

  return (
    <div>
      <label
        htmlFor="published"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Published:
      </label>
      <input
        type="checkbox"
        id="published"
        checked={inputValue}
        onChange={handleChange}
        className="mr-2 leading-tight"
      />
      <span>{inputValue ? "Published" : "Not Published"}</span>
    </div>
  );
}
