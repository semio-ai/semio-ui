import React, { useState } from "react";

export const CopyLinkButton: React.FC<{ link: string }> = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
    });
  };

  return (
    <div className="flex-col items-center space-y-2">
      <h1 className="text-sm font-bold">Public Link:</h1>
      <p className="text-sm text-blue-800 truncate max-w-full">{link}</p>
      <button
        onClick={handleCopy}
        className={`px-3 py-1 border rounded ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
};
