import { ReactNode } from "react";
import { clsx } from "clsx";
import { IconCheck, IconCircle } from "@tabler/icons-react";
import { Button } from "./buttons/button";

export interface Step {
  label: string;
  completed: boolean;
  disabled: boolean;
  content?: ReactNode;
}

export interface VerticalStepperProps {
  steps: Step[];
  activeStep?: number;
  onStepChange: (step: number) => void;
}

export function VerticalStepper({ steps, onStepChange, activeStep = 0 }: VerticalStepperProps) {
  return (
    <div className="flex">
      <div className="flex flex-col space-y-4 py-2">
        {steps.map((step, index) => (
          <Button
            invert
            aria-selected={index === activeStep}
            disabled={step.disabled}
            onClick={() => {
              onStepChange(index);
            }}
            key={index}
            className={clsx("text-nowrap gap-2 focus:outline-hidden group/button")}
            leftIcon={
              step.completed ? (
                <IconCheck
                  className={clsx(
                    "w-6 h-6 rounded-full p-1",
                    "group-aria-selected/button:bg-info-500",
                    "dark:group-aria-selected/button:text-neutral-800",
                    "group-aria-selected/button:text-neutral-200",
                    "bg-transparent text-info-500",
                  )}
                />
              ) : (
                <IconCircle
                  className={clsx(
                    "w-6 h-6 rounded-full p-0.5",
                    "group-aria-selected/button:bg-neutral-500",
                    "dark:group-aria-selected/button:text-neutral-800",
                    "group-aria-selected/button:text-neutral-200",
                    "bg-transparent text-neutral-500",
                    "group-disabled/button:text-neutral-500/50",
                  )}
                />
              )
            }
          >
            {step.label}
          </Button>
        ))}
      </div>
      <div className="w-full">{activeStep !== -1 && steps[activeStep].content}</div>
    </div>
  );
}
