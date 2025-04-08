import React, { useState } from "react";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  return (
    <div className="flex-col items-center space-y-2">
      <h1 className="">Public Link:</h1>
      <p className="text-sm text-blue-500 truncate max-w-full">{link}</p>
      <button
        type="button"
        onClick={(e) => {
          void handleCopy(e);
        }}
        className={`px-3 py-1 border rounded-sm ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
