import clsx from "clsx";

export function NumberOrListInput({
  value,
  onChange,
  title,
}: {
  value: number | number[];
  onChange: (value: number | number[]) => void;
  title?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Array.isArray(value)) {
      const values = e.target.value.split(",").map((v) => parseFloat(v.trim()));
      onChange(values);
    } else {
      onChange(parseFloat(e.target.value));
    }
  };

  return (
    <div className="flex flex-row m-1 items-center">
      {title && <div>{title}:</div>}
      <div>
        <input
          type={Array.isArray(value) ? "text" : "number"}
          value={Array.isArray(value) ? value.join(", ") : value}
          step={!Array.isArray(value) ? 0.1 : undefined}
          onChange={handleChange}
          className={clsx(
            "w-full px-2 py-1 text-sm rounded-md",
            "dark:bg-neutral-800 dark:text-neutral-300",
            "bg-neutral-200 text-neutral-700",
          )}
        />
      </div>
    </div>
  );
}
