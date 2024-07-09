
import { Field, Input, Label, Textarea } from '@headlessui/react'
import { useInput } from "../../hooks/formInputHooks";

export interface TextInputProps {
  textValue: string;
  fieldName: string;
  onTextChange: (value: string, field: string) => void;
  inputTitle?: string;
  inputPlaceholder?: string;
  inputSize?: number;
}

export function TextInput({ 
  textValue, 
  fieldName,
  onTextChange,
  inputTitle="",
  inputPlaceholder="",
  inputSize=1
}: TextInputProps) {

  const { inputValue, handleChange, handleBlur } = useInput(
    textValue,
    onTextChange,
    fieldName,
  );

  return (
    <Field>
      <Label 
      className="block text-lg"
      >
        {inputTitle}
      </Label>
      {inputSize === 1 ?
      <Input
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="mt-1 block w-full rounded-md shadow dark:border border-slate-400 py-1 px-3 placeholder:font-thin
          bg-inherit placeholder:text-inherit text-inherit"
        placeholder={inputPlaceholder}
      /> :
      <Textarea
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={inputSize}
        className="mt-1 block w-full rounded-md shadow dark:border border-slate-400 py-1 px-3 placeholder:font-thin
          bg-inherit placeholder:text-inherit text-inherit"
        placeholder={inputPlaceholder}
      />}
    </Field>
  );
}