import {
  useState,
  useCallback,
  type ChangeEvent,
  type FocusEvent,
  TouchEvent,
  DragEvent,
  KeyboardEvent,
  useMemo,
} from "react";
import {
  NumericStatus,
  NumericState,
  NumericConfig,
  parseNumericInput,
  isValidNumericChar,
  validateNumericChange,
  validateOnBlur,
  calculateSteppedValue,
  revertToValue,
} from "./numeric-utils";

export type ValidChangeEvent =
  | ChangeEvent<HTMLInputElement>
  | PointerEvent
  | MouseEvent
  | TouchEvent
  | DragEvent
  | KeyboardEvent
  | FocusEvent<HTMLInputElement>;

interface NumericProps {
  initial?: number;
  stepSize?: number;
  min?: number;
  max?: number;
  onValidChange?: (value: number, event: ValidChangeEvent) => void;
  sigFigs?: number;
  enforceLimits?: boolean;
}

export interface NumericInterface {
  textValue: string;
  status: NumericStatus;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeDirect: (value: number, event: MouseEvent) => void;
  onChangeHeadless: (value: number) => void;
  onBlur: (event: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => void;
  onStepUp: (event: MouseEvent) => void;
  onStepDown: (event: MouseEvent) => void;
}

export const useNumeric = ({
  initial = 0,
  stepSize = 1,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  sigFigs = 2,
  onValidChange = () => {},
  enforceLimits = true,
}: NumericProps): NumericInterface => {
  const config: NumericConfig = useMemo(
    () => ({
      bounds: { min, max },
      sigFigs,
      enforceLimits,
    }),
    [min, max, sigFigs, enforceLimits],
  );

  const [state, setState] = useState<NumericState>(parseNumericInput(initial, min, max, sigFigs));
  const [currentExternalValue, setCurrentExternalValue] = useState<number>(initial);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Check for invalid characters in the input data
      // @ts-expect-error React Type description is wrong (data is present)
      if (event?.nativeEvent?.data) {
        // @ts-expect-error React Type description is wrong (data is present)
        if (!isValidNumericChar(event.nativeEvent.data as string)) {
          // Don't update state, just ignore the invalid character
          return;
        }
      }

      const inputValue = event.target.value;
      const validationResult = validateNumericChange(inputValue, config);

      // Always update the internal state to show what the user typed
      setState(validationResult.newState);

      // Only call onChange callback if the value should trigger it
      if (validationResult.shouldCallOnChange && validationResult.valueToEmit !== undefined) {
        onValidChange(validationResult.valueToEmit, event);
      }
    },
    [config, onValidChange],
  );

  const onChangeDirect = useCallback(
    (value: number, event: MouseEvent) => {
      const newState = parseNumericInput(value, min, max, sigFigs);
      setState(newState);

      const validationResult = validateNumericChange(value.toString(), config);
      if (validationResult.shouldCallOnChange && validationResult.valueToEmit !== undefined) {
        onValidChange(validationResult.valueToEmit, event);
      }
    },
    [min, max, sigFigs, config, onValidChange],
  );

  const onChangeHeadless = useCallback(
    (value: number) => {
      const newState = parseNumericInput(value, min, max, sigFigs);
      setState(newState);
      setCurrentExternalValue(value);
    },
    [min, max, sigFigs],
  );

  const onStepUp = useCallback(
    (event: MouseEvent) => {
      const newState = calculateSteppedValue(state.numeric, stepSize, "up", min, max, sigFigs);
      setState(newState);

      const validationResult = validateNumericChange(newState.numeric.toString(), config);
      if (validationResult.shouldCallOnChange && validationResult.valueToEmit !== undefined) {
        onValidChange(validationResult.valueToEmit, event);
      }
    },
    [stepSize, min, max, sigFigs, config, onValidChange, state.numeric],
  );

  const onStepDown = useCallback(
    (event: MouseEvent) => {
      const newState = calculateSteppedValue(state.numeric, stepSize, "down", min, max, sigFigs);
      setState(newState);

      const validationResult = validateNumericChange(newState.numeric.toString(), config);
      if (validationResult.shouldCallOnChange && validationResult.valueToEmit !== undefined) {
        onValidChange(validationResult.valueToEmit, event);
      }
    },
    [stepSize, min, max, sigFigs, config, onValidChange, state.numeric],
  );

  const onBlur = useCallback(
    (event: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => {
      // If current state is invalid, revert to the current external value
      if (state.status === NumericStatus.Invalid) {
        const revertedState = revertToValue(currentExternalValue, config);
        setState(revertedState);
        onValidChange(currentExternalValue, event);
      } else {
        const blurResult = validateOnBlur(state, config);
        setState(blurResult.finalState);
        onValidChange(blurResult.valueToEmit, event);
      }
    },
    [state, config, onValidChange, currentExternalValue],
  );

  return {
    textValue: state.textValue,
    status: state.status,
    onChange,
    onChangeDirect,
    onChangeHeadless,
    onBlur,
    onStepUp,
    onStepDown,
  };
};
