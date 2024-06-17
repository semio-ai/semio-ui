import { useInput } from "../hooks/formInputHooks";

export interface VersionInputProps {
  version: string;
  onVersionChange: (value: string, field: string) => void;
}

export const VersionInput = ({
  version,
  onVersionChange,
}: VersionInputProps) => {
  const { inputValue, handleChange, handleBlur } = useInput(
    version,
    onVersionChange,
    "version",
  );

  return (
    <div>
      <label
        htmlFor="version"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Version Number:
      </label>
      <input
        type="text"
        id="version"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter your version number. E.g. 1.0.0"
      />
    </div>
  );
};
