import React, { useRef, useState } from "react";

export function ResizableDiv({ children }: { children: React.ReactNode }) {
  const resizableDivRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(258); // Initial width in pixels (256px = Tailwind's w-64)

  const handleMouseDownLeftEdge = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMoveLeftEdge);
    document.addEventListener("mouseup", handleMouseUpLeftEdge);
  };

  const handleMouseMoveLeftEdge = (e: { clientX: number }) => {
    if (resizableDivRef.current) {
      const newWidth =
        resizableDivRef.current.getBoundingClientRect().right - e.clientX;
      // console.log('newWidth', newWidth);
      setWidth(newWidth > 100 ? newWidth : 100); // Minimum width of 100px
    }
  };

  const handleMouseUpLeftEdge = () => {
    document.removeEventListener("mousemove", handleMouseMoveLeftEdge);
    document.removeEventListener("mouseup", handleMouseUpLeftEdge);
  };

  const handleMouseDownRightEdge = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMoveRightEdge);
    document.addEventListener("mouseup", handleMouseUpRightEdge);
  };

  const handleMouseMoveRightEdge = (e: { clientX: number }) => {
    if (resizableDivRef.current) {
      const newWidth =
        e.clientX - resizableDivRef.current.getBoundingClientRect().left;
      // console.log('newWidth', newWidth);
      setWidth(newWidth > 100 ? newWidth : 100); // Minimum width of 100px
    }
  };

  const handleMouseUpRightEdge = () => {
    document.removeEventListener("mousemove", handleMouseMoveRightEdge);
    document.removeEventListener("mouseup", handleMouseUpRightEdge);
  };

  return (
    <div className="relative">
      <div
        ref={resizableDivRef}
        style={{ width: `${width.toString()}px` }}
        className="h-full flex min-h-[90vh] w-full"
      >
        <div className="flex grow justify-items-center">
          <div className="grow">{children}</div>
        </div>
      </div>
      <button
        type="button"
        onMouseDown={handleMouseDownLeftEdge}
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize"
      />
      <button
        type="button"
        onMouseDown={handleMouseDownRightEdge}
        className="absolute right-0 top-0 h-full w-1 cursor-ew-resize"
      />
    </div>
  );
}
