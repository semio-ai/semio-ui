import React, { useState, type ReactElement } from "react";
import { clsx } from "clsx";

export interface ImageButtonProps {
  imageUrl: string;
  altText: string;
  hoverText?: string;
  dimensions?: { width: string; height: string };
  onClick: () => void;
}

export function ImageButton({
  imageUrl,
  altText,
  hoverText,
  dimensions,
  onClick,
}: ImageButtonProps): ReactElement {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (event: React.MouseEvent) => {
    setShowTooltip(true);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  return (
    <div>
      <button
        type="button"
        className={clsx(
          "cursor-pointer border-none bg-none p-0 focus:outline-hidden",
          "cursor-pointer disabled:cursor-default",
        )}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={imageUrl}
          alt={altText}
          className={clsx(
            "rounded-full transition duration-300 ease-in-out",
            "transform hover:border-2 hover:border-black",
          )}
          style={dimensions}
        />
      </button>
      {showTooltip && hoverText && (
        <div
          className="absolute rounded-sm bg-gray-700 px-2 py-1 text-xs text-white"
          style={{ top: tooltipPos.y + 10, left: tooltipPos.x + 10 }}
        >
          {hoverText}
        </div>
      )}
    </div>
  );
}
