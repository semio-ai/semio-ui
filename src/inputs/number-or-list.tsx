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
        {value === null && "null"}
        {Array.isArray(value) ? (
          <input
            type="text"
            value={value.join(", ")}
            onChange={handleChange}
            className={clsx(
              "w-full px-2 py-1 text-sm rounded-md max-w-24",
              "dark:bg-neutral-800 dark:text-neutral-300",
              "bg-neutral-200 text-neutral-700",
            )}
          />
        ): (
          <input
            type="number"
            value={value}
            step={0.1}
            onChange={handleChange}
            className={clsx(
              "w-full px-2 py-1 text-sm rounded-md max-w-24",
              "dark:bg-neutral-800 dark:text-neutral-300",
              "bg-neutral-200 text-neutral-700",
            )}
          />
        )}
      </div>
    </div>
  );
}
