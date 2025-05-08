import React, { useState } from "react";
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
}: ImageButtonProps): JSX.Element {
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
          "p-0 border-none bg-none cursor-pointer focus:outline-hidden",
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
            "transition duration-300 rounded-full ease-in-out",
            "transform hover:border-2 hover:border-black",
          )}
          style={dimensions}
        />
      </button>
      {showTooltip && hoverText && (
        <div
          className="absolute bg-gray-700 text-white text-xs rounded-sm py-1 px-2"
          style={{ top: tooltipPos.y + 10, left: tooltipPos.x + 10 }}
        >
          {hoverText}
        </div>
      )}
    </div>
  );
}
