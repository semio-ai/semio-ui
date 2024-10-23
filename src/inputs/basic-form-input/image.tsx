import { Field, Input, Label } from "@headlessui/react";
import { useImageInput } from "../../hooks/formInputHooks";
import { Spinner } from "../../spinner";

export interface ImageInputProps {
  imageUrl?: string;
  onImageChange: (file: File | null) => void;
  uploading?: boolean;
  inputTitle?: string;
}

export function ImageInput({
  imageUrl,
  onImageChange,
  uploading = false,
  inputTitle = "Upload Image:",
}: ImageInputProps) {
  const { localImageURL, handleChange, handleRemove } = useImageInput(onImageChange, imageUrl);

  return (
    <div>
      {uploading ? (
        <div className="w-full h-auto rounded-lg">
          <p>Uploading...</p>
          <Spinner />
        </div>
      ) : (
        <Field>
          <Label className="block mb-2">{inputTitle}</Label>
          <Input type="file" accept="image/*" onChange={handleChange} className="mb-2" />
          {localImageURL && (
            <div className="mb-2 flex flex-col justify-center items-center">
              <img src={localImageURL} alt="Preview" className="max-w-36 h-auto rounded-lg" />
              <button type="button" onClick={handleRemove} className="mt-2 text-red-500">
                Remove
              </button>
            </div>
          )}
        </Field>
      )}
    </div>
  );
}
