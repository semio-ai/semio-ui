import { ReactNode } from "react";
import { clsx } from "clsx";
import { Button } from "../buttons/button";
import { Icon } from "../icons/registry";
import { Variant } from "../types";

export interface ProgressStepperProps {
  steps: readonly string[];
  activeStep: number;
  /** Names the sequence for assistive technology. */
  label: string;
}

/** A non-interactive progress indicator for a sequence controlled by account state. */
export function ProgressStepper({ steps, activeStep, label }: ProgressStepperProps) {
  return (
    <ol aria-label={label} className="flex w-full items-start px-2 py-3">
      {steps.map((step, index) => {
        const completed = index < activeStep;
        const current = index === activeStep;
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center"
          >
            <div className="flex w-full items-center">
              <span
                aria-hidden="true"
                className={clsx(
                  "h-px flex-1",
                  index > 0 && (completed || current)
                    ? clsx("variant-scope variant-static-bg", Variant.Primary)
                    : "bg-neutral-500/25",
                  index === 0 && "invisible",
                )}
              />
              <span
                aria-hidden="true"
                className={clsx(
                  "variant-scope grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium",
                  completed || current ? "variant-static-bg" : "variant-subtle-bg",
                  completed || current ? Variant.Primary : Variant.Default,
                )}
              >
                {completed ? (
                  <Icon name="step-complete" size="none" className="size-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                aria-hidden="true"
                className={clsx(
                  "h-px flex-1",
                  completed
                    ? clsx("variant-scope variant-static-bg", Variant.Primary)
                    : "bg-neutral-500/25",
                  index === steps.length - 1 && "invisible",
                )}
              />
            </div>
            <span className={clsx("text-xs", current ? "font-medium" : "opacity-65")}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

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
            visuals="inverted"
            aria-selected={index === activeStep}
            disabled={step.disabled}
            onClick={() => {
              onStepChange(index);
            }}
            key={index}
            className={clsx("group/button gap-2 text-nowrap focus:outline-hidden")}
            leftIcon={
              step.completed ? (
                <Icon
                  name="step-complete"
                  size="none"
                  className={clsx(
                    "h-6 w-6 rounded-full p-1",
                    "group-aria-selected/button:bg-info-500",
                    "dark:group-aria-selected/button:text-neutral-800",
                    "group-aria-selected/button:text-neutral-200",
                    "text-info-500 bg-transparent",
                  )}
                />
              ) : (
                <Icon
                  name="step-pending"
                  size="none"
                  className={clsx(
                    "h-6 w-6 rounded-full p-0.5",
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
