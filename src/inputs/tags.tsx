import { ChangeEvent } from "react";
import { useItemsInput } from "../hooks/formInputHooks";

export interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[], field: string) => void;
}

export const TagsInput = ({
  tags: initialTags,
  onTagsChange,
}: TagsInputProps) => {
  const { items, inputValue, setInputValue, handleKeyDown, handleRemoveItem } =
    useItemsInput(initialTags, onTagsChange, "tags");

  return (
    <div>
      <label
        htmlFor="tags"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Tags:
      </label>
      <div className="mb-2">
        {items.map((tag, index) => (
          <span key={index} className="bg-green-100 rounded-lg p-2 m-1">
            {tag}{" "}
            <button
              type="button"
              className="text-red-700"
              onClick={() => handleRemoveItem(tag)}
            >
              x
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        id="tags"
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setInputValue(e.target.value)
        }
        onKeyDown={handleKeyDown}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter a tag and press Enter to add it to the list."
      />
    </div>
  );
};
