import {
  useState,
  useCallback,
  type ChangeEvent,
  type FocusEvent,
  TouchEvent,
  DragEvent,
  KeyboardEvent,
} from "react";
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

interface NumericState {
  numeric: number;
  status: NumericStatus;
  textValue: string;
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
  const [state, setState] = useState<NumericState>(parse(initial, min, max, sigFigs));

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.log("onChange w/ enforceLimits", enforceLimits);
      // @ts-expect-error React Type description is wrong (data is present)
      if (event?.nativeEvent?.data) {
        // @ts-expect-error React Type description is wrong (data is present)
        if (!VALID_CHARS.includes(event.nativeEvent.data as string)) {
          setState((prev) => ({
            numeric: prev.numeric,
            status: prev.status,
            textValue: prev.textValue,
          }));
          return;
        }
      }
      if (event.target?.value === "-") {
        setState({
          numeric: 0,
          status: getStatus(0, min, max),
          textValue: event.target.value,
        });
        return;
      }

      if (event.target.value === "") {
        setState({
          numeric: 0,
          status: getStatus(0, min, max),
          textValue: event.target.value,
        });
        return;
      }

      const newState = parse(event.target.value, min, max, sigFigs);
      if (!newState) {
        setState((prev) => ({
          numeric: prev.numeric,
          status: NumericStatus.Invalid,
          textValue: event.target.value,
        }));
      } else if (!enforceLimits || PassableNumericStatuses.includes(newState.status)) {
        setState(newState);
        onValidChange(newState.numeric, event);
      } else if (newState.status === NumericStatus.Below) {
        setState(newState);
        onValidChange(min, event);
      } else if (newState.status === NumericStatus.Above) {
        setState(newState);
        onValidChange(max, event);
      }
    },
    [min, max, onValidChange, sigFigs, enforceLimits],
  );

  const onChangeDirect = useCallback(
    (value: number, event: MouseEvent) => {
      const newState = parse(value, min, max, sigFigs);
      setState(newState);
      if (!enforceLimits || PassableNumericStatuses.includes(newState.status)) {
        onValidChange(newState.numeric, event);
      }
    },
    [min, max, onValidChange, sigFigs, enforceLimits],
  );

  const onChangeHeadless = useCallback(
    (value: number) => {
      const newState = parse(value, min, max, sigFigs);
      setState(newState);
    },
    [min, max, sigFigs],
  );

  const onStepUp = useCallback(
    (event: MouseEvent) => {
      const newState = parse(strip(state.numeric + stepSize), min, max, sigFigs);
      setState(newState);
      if (!enforceLimits || PassableNumericStatuses.includes(newState.status)) {
        onValidChange(newState.numeric, event);
      }
    },
    [min, max, onValidChange, state.numeric, stepSize, sigFigs, enforceLimits],
  );

  const onStepDown = useCallback(
    (event: MouseEvent) => {
      const newState = parse(strip(state.numeric - stepSize), min, max, sigFigs);
      setState(newState);
      if (!enforceLimits || PassableNumericStatuses.includes(newState.status)) {
        onValidChange(newState.numeric, event);
      }
    },
    [min, max, onValidChange, state.numeric, stepSize, sigFigs, enforceLimits],
  );

  const onBlur = useCallback(
    (event: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>) => {
      const strVersion = state.numeric.toFixed(sigFigs);
      setState({
        numeric: state.numeric,
        status: getStatus(state.numeric, min, max),
        textValue: strVersion,
      });
      onValidChange(state.numeric, event);
    },
    [min, max, state.numeric, onValidChange, sigFigs],
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

const getStatus = (v: number, min: number, max: number) => {
  if (v < max && v > min) {
    return NumericStatus.Within;
  } else if (v > max) {
    return NumericStatus.Above;
  } else if (v === max) {
    return NumericStatus.UpperBound;
  } else if (v === min) {
    return NumericStatus.LowerBound;
  } else if (v < min) {
    return NumericStatus.Below;
  } else {
    return NumericStatus.Invalid;
  }
};

const parse = (v: number | string, min: number, max: number, sigFigs: number) => {
  if (typeof v === "number") {
    return {
      numeric: v,
      status: getStatus(v, min, max),
      textValue: v.toFixed(sigFigs),
    };
  } else if (typeof v === "string") {
    const parsed = Number(v);
    if (v === "-") {
      return { numeric: 0, status: getStatus(0, min, max), textValue: v };
    }
    if (isNumber(parsed) && !isNaN(parsed)) {
      return {
        numeric: parsed,
        status: getStatus(parsed, min, max),
        textValue: v,
      };
    }
  }
  // console.warn("failed with ", v, typeof v);
  return { numeric: 0, status: NumericStatus.Invalid, textValue: v };
};
