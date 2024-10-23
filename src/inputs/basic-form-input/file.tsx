import { ChangeEvent } from "react";
import { Field, Label } from "@headlessui/react";
// import { useInput } from "../../hooks/formInputHooks";

export interface FileInputProps {
  fileObj: File | null;
  setFile: (file: File | null) => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  types?: string;
  inputTitle?: string;
}

export function FileInput({
  fileObj,
  setFile,
  handleFileChange,
  types = ".glb, .txt, .json",
  inputTitle = "",
}: FileInputProps) {
  return (
    <Field>
      <Label className="block text-lg">{inputTitle}</Label>
      {fileObj ? (
        <div className="flex justify-between mt-1">
          <span> File: {fileObj.name} </span>
          <button className="text-red-500" type="button" onClick={() => setFile(null)}>
            Remove
          </button>
        </div>
      ) : (
        <input
          type="file"
          id="model"
          accept={types} // Modified to accept .txt files
          onChange={handleFileChange}
          className="mb-2"
        />
      )}
    </Field>
  );
}
