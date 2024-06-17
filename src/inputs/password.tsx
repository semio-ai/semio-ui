import { useInput } from "../hooks/formInputHooks";
import { useState } from "react";

export interface PasswordInputProps {
    password: string;
    onPasswordChange: (value: string, field: string) => void;
  }
  
  export const PasswordInput = ({ password, onPasswordChange }: PasswordInputProps) => {
  const { inputValue, handleChange, handleBlur } = useInput(password, onPasswordChange, "password");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
  
    return (
      <div >
        <label 
          htmlFor="password"
          className="block text-gray-700 text-sm font-bold mb-2">
            Password:
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={inputValue}
            onBlur={handleBlur}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
          />
          <button 
            type="button" 
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" >
            {showPassword ? "Hide" : "Show Password"}
          </button>
        </div>
      </div>
    );
  };