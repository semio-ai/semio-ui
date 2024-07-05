import { useInput } from "../hooks/formInputHooks";

export interface UserNameInputProps {
  userName: string;
  onUserNameChange: (value: string, field: string) => void;
}

export function UserNameInput({
  userName,
  onUserNameChange,
}: UserNameInputProps) {
  const { inputValue, handleChange, handleBlur } = useInput(
    userName,
    onUserNameChange,
    "userName",
  );

  return (
    <div>
      <label
        htmlFor="userName"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        User Name:
      </label>
      <input
        type="text"
        id="userName"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter your user name"
      />
    </div>
  );
}
