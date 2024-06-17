import { ChangeEvent } from "react";
import {useEmailsInput} from "../hooks/formInputHooks";

export interface EmailsInputProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  title?: string;
}

// EmailsInput component using the useEmailsInput custom hook
export const EmailsInput = ({ emails: initialEmails, onEmailsChange, title = "Emails:" }: EmailsInputProps) => {
  const { emails, inputValue, setInputValue, handleKeyDown, handleRemoveEmail, error } = useEmailsInput(initialEmails, onEmailsChange, "emails");

  return (
    <div>
      <label 
        htmlFor="emails"
        className="block text-gray-700 text-sm font-bold mb-2">
          {title}
      </label>
      <div className="mb-2">
        {emails.map((email, index) => (
          <span key={index} className="bg-green-100 rounded-lg p-2 m-1">
            {email} <button className="text-red-700" type="button" onClick={() => handleRemoveEmail(email)}> X</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        id="emails"
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter an email and press Enter to add it to the list."
      />
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};
