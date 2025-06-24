import { isNumber, isNaN } from "lodash";
import { strip } from "number-precision";

const VALID_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "-"];

export enum NumericStatus {
  Below = "below",
  LowerBound = "lower-bound",
  Within = "within",
  UpperBound = "upper-bound",
  Above = "above",
  Invalid = "invalid",
}

export const PassableNumericStatuses = [
  NumericStatus.LowerBound,
  NumericStatus.Within,
  NumericStatus.UpperBound,
];

export interface NumericState {
  numeric: number;
  status: NumericStatus;
  textValue: string;
}

export interface NumericBounds {
  min: number;
  max: number;
}

export interface NumericConfig {
  bounds: NumericBounds;
  sigFigs: number;
  enforceLimits: boolean;
}

/**
 * Determines the status of a numeric value relative to its bounds
 */
export function getNumericStatus(value: number, min: number, max: number): NumericStatus {
  if (value < max && value > min) {
    return NumericStatus.Within;
  } else if (value > max) {
    return NumericStatus.Above;
  } else if (value === min) {
    return NumericStatus.LowerBound;
  } else if (value === max) {
    return NumericStatus.UpperBound;
  } else if (value < min) {
    return NumericStatus.Below;
  } else {
    return NumericStatus.Invalid;
  }
}

/**
 * Parses a numeric input (string or number) into a NumericState
 */
export function parseNumericInput(
  input: number | string,
  min: number,
  max: number,
  sigFigs: number,
): NumericState {
  if (typeof input === "number") {
    return {
      numeric: input,
      status: getNumericStatus(input, min, max),
      textValue: input.toFixed(sigFigs),
    };
  }

  if (typeof input === "string") {
    // Handle special case for just a minus sign
    if (input === "-") {
      return {
        numeric: 0,
        status: getNumericStatus(0, min, max),
        textValue: input,
      };
    }

    // Handle empty string
    if (input === "") {
      return {
        numeric: 0,
        status: getNumericStatus(0, min, max),
        textValue: input,
      };
    }

    const parsed = Number(input);
    if (isNumber(parsed) && !isNaN(parsed)) {
      return {
        numeric: parsed,
        status: getNumericStatus(parsed, min, max),
        textValue: input,
      };
    }
  }

  // Invalid input
  return {
    numeric: 0,
    status: NumericStatus.Invalid,
    textValue: String(input),
  };
}

/**
 * Validates if a character is allowed in numeric input
 */
export function isValidNumericChar(char: string): boolean {
  return VALID_CHARS.includes(char);
}

/**
 * Determines if a numeric state change should trigger onChange callback
 */
export function shouldTriggerOnChange(state: NumericState, enforceLimits: boolean): boolean {
  // Always trigger for invalid states when limits aren't enforced
  if (!enforceLimits) {
    return state.status !== NumericStatus.Invalid;
  }

  // Only trigger for passable statuses when limits are enforced
  return PassableNumericStatuses.includes(state.status);
}

/**
 * Calculates the final value to use when enforcing limits
 */
export function getFinalValueWithLimits(
  state: NumericState,
  min: number,
  max: number,
  enforceLimits: boolean,
): number {
  if (!enforceLimits) {
    return state.numeric;
  }

  switch (state.status) {
    case NumericStatus.Below:
      return min;
    case NumericStatus.Above:
      return max;
    default:
      return state.numeric;
  }
}

/**
 * Handles stepping up/down with bounds checking
 */
export function calculateSteppedValue(
  currentValue: number,
  stepSize: number,
  direction: "up" | "down",
  min: number,
  max: number,
  sigFigs: number,
): NumericState {
  const delta = direction === "up" ? stepSize : -stepSize;
  const newValue = strip(currentValue + delta);

  return parseNumericInput(newValue, min, max, sigFigs);
}

/**
 * Creates a formatted display value for blur/final state
 */
export function formatDisplayValue(value: number, sigFigs: number): string {
  return value.toFixed(sigFigs);
}

/**
 * Creates a NumericState for reverting to a specific value
 */
export function revertToValue(value: number, config: NumericConfig): NumericState {
  const { bounds, sigFigs } = config;
  const { min, max } = bounds;

  return {
    numeric: value,
    status: getNumericStatus(value, min, max),
    textValue: formatDisplayValue(value, sigFigs),
  };
}

/**
 * Validates numeric input change and returns updated state
 */
export function validateNumericChange(
  inputValue: string,
  config: NumericConfig,
): {
  newState: NumericState;
  shouldCallOnChange: boolean;
  valueToEmit?: number;
} {
  const { bounds, sigFigs, enforceLimits } = config;
  const { min, max } = bounds;

  // Parse the new input
  const newState = parseNumericInput(inputValue, min, max, sigFigs);

  // Determine if we should call onChange
  const shouldCallOnChange = shouldTriggerOnChange(newState, enforceLimits);

  // Determine what value to emit
  let valueToEmit: number | undefined;
  if (shouldCallOnChange) {
    valueToEmit = newState.numeric;
  }

  return {
    newState,
    shouldCallOnChange,
    valueToEmit,
  };
}

/**
 * Handles blur event validation and returns final state
 */
export function validateOnBlur(
  currentState: NumericState,
  config: NumericConfig,
): {
  finalState: NumericState;
  valueToEmit: number;
} {
  const { bounds, sigFigs, enforceLimits } = config;
  const { min, max } = bounds;

  // Get the final value (with limits enforced if needed)
  const finalValue = getFinalValueWithLimits(currentState, min, max, enforceLimits);

  // Create final state with formatted display value
  const finalState: NumericState = {
    numeric: finalValue,
    status: getNumericStatus(finalValue, min, max),
    textValue: formatDisplayValue(finalValue, sigFigs),
  };

  return {
    finalState,
    valueToEmit: finalValue,
  };
}
