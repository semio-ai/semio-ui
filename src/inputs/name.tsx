import { useInput } from "../hooks/formInputHooks";

export interface NameInputProps {
  name: string;
  onNameChange: (value: string, field: string) => void;
}

export const NameInput = ({ name, onNameChange }: NameInputProps) => {
  const { inputValue, handleChange, handleBlur } = useInput(
    name,
    onNameChange,
    "name",
  );

  return (
    <div>
      <label
        htmlFor="name"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Name:
      </label>
      <input
        type="text"
        id="name"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter your name"
      />
    </div>
  );
};
