import { useState, useCallback, type ChangeEvent } from "react";
import { isNumber, isNaN } from "lodash";
import { strip } from "number-precision";

const VALID_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
  "-",
];

export const NUMERIC_STATUS = {
  BELOW: "BELOW",
  LOWER_BOUND: "LOWER",
  WITHIN: "WITHIN",
  UPPER_BOUND: "UPPER",
  ABOVE: "ABOVE",
  INVALID: "INVALID",
};

export const PASSABLE_NUMERIC_STATUSES = [
  NUMERIC_STATUS.LOWER_BOUND,
  NUMERIC_STATUS.WITHIN,
  NUMERIC_STATUS.UPPER_BOUND,
];

interface NumericProps {
  initial?: number;
  stepSize?: number;
  min?: number;
  max?: number;
  onValidChange?: (value: number) => void;
  sigFigs?: number;
}

interface NumericState {
  numeric: number;
  status: string;
  textValue: string;
}

export const useNumeric = ({
  initial = 0,
  stepSize = 1,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  sigFigs = 2,
  onValidChange = () => {},
}: NumericProps) => {
  const [state, setState] = useState<NumericState>(
    parse(initial, min, max, sigFigs),
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
          status: NUMERIC_STATUS.INVALID,
          textValue: event.target.value,
        }));
      } else if (PASSABLE_NUMERIC_STATUSES.includes(newState.status)) {
        setState(newState);
        onValidChange(newState.numeric);
      } else if (newState.status === NUMERIC_STATUS.BELOW) {
        setState(newState);
        onValidChange(min);
      } else if (newState.status === NUMERIC_STATUS.ABOVE) {
        setState(newState);
        onValidChange(max);
      }
    },
    [min, max, onValidChange, sigFigs],
  );

  const onChangeDirect = useCallback(
    (value: number) => {
      const newState = parse(value, min, max, sigFigs);
      setState(newState);
      if (PASSABLE_NUMERIC_STATUSES.includes(newState.status)) {
        onValidChange(newState.numeric);
      }
    },
    [min, max, onValidChange, sigFigs],
  );

  const onStepUp = useCallback(() => {
    const newState = parse(strip(state.numeric + stepSize), min, max, sigFigs);
    setState(newState);
    if (PASSABLE_NUMERIC_STATUSES.includes(newState.status)) {
      onValidChange(newState.numeric);
    }
  }, [min, max, onValidChange, state.numeric, stepSize, sigFigs]);

  const onStepDown = useCallback(() => {
    const newState = parse(strip(state.numeric - stepSize), min, max, sigFigs);
    setState(newState);
    if (PASSABLE_NUMERIC_STATUSES.includes(newState.status)) {
      onValidChange(newState.numeric);
    }
  }, [min, max, onValidChange, state.numeric, stepSize, sigFigs]);

  const onBlur = useCallback(() => {
    const strVersion = state.numeric.toFixed(sigFigs);
    setState({
      numeric: state.numeric,
      status: getStatus(state.numeric, min, max),
      textValue: strVersion,
    });
    onValidChange(state.numeric);
  }, [min, max, state.numeric, onValidChange, sigFigs]);

  return {
    textValue: state.textValue,
    status: state.status,
    onChange,
    onChangeDirect,
    onBlur,
    onStepUp,
    onStepDown,
  };
};

const getStatus = (v: number, min: number, max: number) => {
  if (v < max && v > min) {
    return NUMERIC_STATUS.WITHIN;
  } else if (v > max) {
    return NUMERIC_STATUS.ABOVE;
  } else if (v === max) {
    return NUMERIC_STATUS.UPPER_BOUND;
  } else if (v === min) {
    return NUMERIC_STATUS.LOWER_BOUND;
  } else if (v < min) {
    return NUMERIC_STATUS.BELOW;
  } else {
    return NUMERIC_STATUS.INVALID;
  }
};

const parse = (
  v: number | string,
  min: number,
  max: number,
  sigFigs: number,
) => {
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
  return { numeric: 0, status: NUMERIC_STATUS.INVALID, textValue: v };
};
