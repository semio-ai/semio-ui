import { useImageInput } from "../hooks/formInputHooks";
import { Spinner } from '../LoadingSpinner';

export interface ImageInputProps {
  imageUrl?: string;
  onImageChange: (file: File | null) => void;
  uploading?: boolean;
}

export const ImageInput = ({ imageUrl, onImageChange, uploading=false}: ImageInputProps) => {
  const { localImageURL, handleChange, handleRemove } = useImageInput(onImageChange, imageUrl);

  return (
    <div>
      {uploading ?
        <div className="w-full h-auto rounded-lg">
          <p>Uploading...</p>
          <Spinner />
        </div> :
      <div>
      <label
        htmlFor="image"
        className="block text-gray-700 text-sm font-bold mb-2">
        Upload Image:
      </label>
      <input
        type="file"
        id="image"
        accept="image/*"
        onChange={handleChange}
        className="mb-2"
      />
      {localImageURL && (
        <div className="mb-2">
          <img src={localImageURL} alt="Preview" className="w-full h-auto rounded-lg" />
          <button
            type="button"
            onClick={handleRemove}
            className="mt-2 text-red-500">
            Remove
          </button>
        </div>
      )}
      </div>
    }
    </div>
  );
};

