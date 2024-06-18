import * as RadixProgress from "@radix-ui/react-progress";

export interface ProgressProps {
  progress: number;
  color?: string;
}

export function Progress({ progress, color }: ProgressProps) {
  const progressColor: string = color || "bg-gray-500";
  return (
    <RadixProgress.Root
      className="relative overflow-hidden dark:bg-gray-200 bg-gray-800 w-full h-2 translate-z-0"
      value={progress}
    >
      <RadixProgress.Indicator
        style={{ width: `${progress}%` }}
        className={`${progressColor} h-full duration-300 ease-in-out`}
      />
    </RadixProgress.Root>
  );
}
