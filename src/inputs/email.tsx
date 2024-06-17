import { useEmailInput } from "../hooks/formInputHooks";

export interface EmailInputProps {
  email: string;
  onEmailChange: (email: string, field: string) => void;
}

export const EmailInput = ({
  email: initialEmail,
  onEmailChange,
}: EmailInputProps) => {
  const { email, error, handleChange } = useEmailInput(
    initialEmail,
    onEmailChange,
    "email",
  );

  return (
    <div>
      <label
        htmlFor="email"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Email:
      </label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={handleChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter your email"
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};
