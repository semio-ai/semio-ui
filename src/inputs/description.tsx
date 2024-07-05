import { useInput } from "../hooks/formInputHooks";

export interface DescriptionInputProps {
  description: string;
  onDescriptionChange: (value: string, field: string) => void;
}

export function DescriptionInput({
  description,
  onDescriptionChange,
}: DescriptionInputProps) {
  const { inputValue, handleChange, handleBlur } = useInput(
    description,
    onDescriptionChange,
    "description",
  );

  return (
    <div>
      <label
        htmlFor="description"
        className="block dark:text-white/50 text-black/50 text-sm font-bold mb-2"
      >
        Description:
      </label>
      <textarea
        id="description"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={3}
        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter your description"
      />
    </div>
  );
}
