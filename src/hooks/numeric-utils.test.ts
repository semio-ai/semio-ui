import { describe, it, expect } from "vitest";
import {
  NumericStatus,
  PassableNumericStatuses,
  getNumericStatus,
  parseNumericInput,
  isValidNumericChar,
  shouldTriggerOnChange,
  getFinalValueWithLimits,
  calculateSteppedValue,
  formatDisplayValue,
  validateNumericChange,
  validateOnBlur,
  revertToValue,
  NumericState,
  NumericConfig,
} from "./numeric-utils";

describe("getNumericStatus", () => {
  it("should return Within for values between min and max", () => {
    expect(getNumericStatus(5, 0, 10)).toBe(NumericStatus.Within);
    expect(getNumericStatus(0.5, 0, 1)).toBe(NumericStatus.Within);
    expect(getNumericStatus(-5, -10, 0)).toBe(NumericStatus.Within);
  });

  it("should return LowerBound for values equal to min", () => {
    expect(getNumericStatus(0, 0, 10)).toBe(NumericStatus.LowerBound);
    expect(getNumericStatus(-10, -10, 0)).toBe(NumericStatus.LowerBound);
  });

  it("should return UpperBound for values equal to max", () => {
    expect(getNumericStatus(10, 0, 10)).toBe(NumericStatus.UpperBound);
    expect(getNumericStatus(0, -10, 0)).toBe(NumericStatus.UpperBound);
  });

  it("should return Below for values less than min", () => {
    expect(getNumericStatus(-1, 0, 10)).toBe(NumericStatus.Below);
    expect(getNumericStatus(-15, -10, 0)).toBe(NumericStatus.Below);
  });

  it("should return Above for values greater than max", () => {
    expect(getNumericStatus(15, 0, 10)).toBe(NumericStatus.Above);
    expect(getNumericStatus(5, -10, 0)).toBe(NumericStatus.Above);
  });

  it("should handle edge case with same min and max", () => {
    expect(getNumericStatus(5, 5, 5)).toBe(NumericStatus.LowerBound);
    expect(getNumericStatus(4, 5, 5)).toBe(NumericStatus.Below);
    expect(getNumericStatus(6, 5, 5)).toBe(NumericStatus.Above);
  });
});

describe("parseNumericInput", () => {
  const min = 0;
  const max = 100;
  const sigFigs = 2;

  describe("with number input", () => {
    it("should parse valid numbers correctly", () => {
      const result = parseNumericInput(50, min, max, sigFigs);
      expect(result).toEqual({
        numeric: 50,
        status: NumericStatus.Within,
        textValue: "50.00",
      });
    });

    it("should handle decimal numbers", () => {
      const result = parseNumericInput(25.5, min, max, sigFigs);
      expect(result).toEqual({
        numeric: 25.5,
        status: NumericStatus.Within,
        textValue: "25.50",
      });
    });

    it("should handle boundary values", () => {
      const resultMin = parseNumericInput(0, min, max, sigFigs);
      expect(resultMin.status).toBe(NumericStatus.LowerBound);

      const resultMax = parseNumericInput(100, min, max, sigFigs);
      expect(resultMax.status).toBe(NumericStatus.UpperBound);
    });
  });

  describe("with string input", () => {
    it("should parse valid numeric strings", () => {
      const result = parseNumericInput("42.5", min, max, sigFigs);
      expect(result).toEqual({
        numeric: 42.5,
        status: NumericStatus.Within,
        textValue: "42.5",
      });
    });

    it("should handle empty string", () => {
      const result = parseNumericInput("", min, max, sigFigs);
      expect(result).toEqual({
        numeric: 0,
        status: NumericStatus.LowerBound,
        textValue: "",
      });
    });

    it("should handle minus sign only", () => {
      const result = parseNumericInput("-", -100, max, sigFigs);
      expect(result).toEqual({
        numeric: 0,
        status: NumericStatus.Within,
        textValue: "-",
      });
    });

    it("should handle negative numbers", () => {
      const result = parseNumericInput("-25", -100, max, sigFigs);
      expect(result).toEqual({
        numeric: -25,
        status: NumericStatus.Within,
        textValue: "-25",
      });
    });

    it("should handle invalid strings", () => {
      const result = parseNumericInput("abc", min, max, sigFigs);
      expect(result).toEqual({
        numeric: 0,
        status: NumericStatus.Invalid,
        textValue: "abc",
      });
    });

    it("should handle strings with multiple decimals", () => {
      const result = parseNumericInput("1.2.3", min, max, sigFigs);
      expect(result).toEqual({
        numeric: 0,
        status: NumericStatus.Invalid,
        textValue: "1.2.3",
      });
    });
  });
});

describe("isValidNumericChar", () => {
  it("should accept digits", () => {
    for (let i = 0; i <= 9; i++) {
      expect(isValidNumericChar(i.toString())).toBe(true);
    }
  });

  it("should accept decimal point", () => {
    expect(isValidNumericChar(".")).toBe(true);
  });

  it("should accept minus sign", () => {
    expect(isValidNumericChar("-")).toBe(true);
  });

  it("should reject letters", () => {
    expect(isValidNumericChar("a")).toBe(false);
    expect(isValidNumericChar("Z")).toBe(false);
  });

  it("should reject special characters", () => {
    expect(isValidNumericChar("+")).toBe(false);
    expect(isValidNumericChar("*")).toBe(false);
    expect(isValidNumericChar("/")).toBe(false);
    expect(isValidNumericChar(" ")).toBe(false);
  });
});

describe("shouldTriggerOnChange", () => {
  it("should trigger for all valid statuses when limits not enforced", () => {
    const validStatuses = [
      NumericStatus.Below,
      NumericStatus.LowerBound,
      NumericStatus.Within,
      NumericStatus.UpperBound,
      NumericStatus.Above,
    ];

    validStatuses.forEach((status) => {
      const state: NumericState = { numeric: 0, status, textValue: "0" };
      expect(shouldTriggerOnChange(state, false)).toBe(true);
    });
  });

  it("should not trigger for invalid status when limits not enforced", () => {
    const state: NumericState = { numeric: 0, status: NumericStatus.Invalid, textValue: "abc" };
    expect(shouldTriggerOnChange(state, false)).toBe(false);
  });

  it("should only trigger for passable statuses when limits enforced", () => {
    PassableNumericStatuses.forEach((status) => {
      const state: NumericState = { numeric: 0, status, textValue: "0" };
      expect(shouldTriggerOnChange(state, true)).toBe(true);
    });

    const nonPassableStatuses = [NumericStatus.Below, NumericStatus.Above, NumericStatus.Invalid];
    nonPassableStatuses.forEach((status) => {
      const state: NumericState = { numeric: 0, status, textValue: "0" };
      expect(shouldTriggerOnChange(state, true)).toBe(false);
    });
  });
});

describe("getFinalValueWithLimits", () => {
  const min = 0;
  const max = 100;

  it("should return original value when limits not enforced", () => {
    const belowState: NumericState = {
      numeric: -10,
      status: NumericStatus.Below,
      textValue: "-10",
    };
    const aboveState: NumericState = {
      numeric: 150,
      status: NumericStatus.Above,
      textValue: "150",
    };

    expect(getFinalValueWithLimits(belowState, min, max, false)).toBe(-10);
    expect(getFinalValueWithLimits(aboveState, min, max, false)).toBe(150);
  });

  it("should clamp to min when below and limits enforced", () => {
    const state: NumericState = { numeric: -10, status: NumericStatus.Below, textValue: "-10" };
    expect(getFinalValueWithLimits(state, min, max, true)).toBe(min);
  });

  it("should clamp to max when above and limits enforced", () => {
    const state: NumericState = { numeric: 150, status: NumericStatus.Above, textValue: "150" };
    expect(getFinalValueWithLimits(state, min, max, true)).toBe(max);
  });

  it("should return original value for valid statuses", () => {
    const validStatuses = [
      NumericStatus.LowerBound,
      NumericStatus.Within,
      NumericStatus.UpperBound,
    ];

    validStatuses.forEach((status) => {
      const state: NumericState = { numeric: 50, status, textValue: "50" };
      expect(getFinalValueWithLimits(state, min, max, true)).toBe(50);
    });
  });
});

describe("calculateSteppedValue", () => {
  const min = 0;
  const max = 100;
  const sigFigs = 2;

  it("should step up correctly", () => {
    const result = calculateSteppedValue(10, 5, "up", min, max, sigFigs);
    expect(result.numeric).toBe(15);
    expect(result.status).toBe(NumericStatus.Within);
  });

  it("should step down correctly", () => {
    const result = calculateSteppedValue(10, 3, "down", min, max, sigFigs);
    expect(result.numeric).toBe(7);
    expect(result.status).toBe(NumericStatus.Within);
  });

  it("should handle stepping beyond bounds", () => {
    const resultAbove = calculateSteppedValue(95, 10, "up", min, max, sigFigs);
    expect(resultAbove.numeric).toBe(105);
    expect(resultAbove.status).toBe(NumericStatus.Above);

    const resultBelow = calculateSteppedValue(5, 10, "down", min, max, sigFigs);
    expect(resultBelow.numeric).toBe(-5);
    expect(resultBelow.status).toBe(NumericStatus.Below);
  });

  it("should handle decimal step sizes", () => {
    const result = calculateSteppedValue(10.5, 0.25, "up", min, max, sigFigs);
    expect(result.numeric).toBe(10.75);
  });
});

describe("formatDisplayValue", () => {
  it("should format with correct significant figures", () => {
    expect(formatDisplayValue(10, 2)).toBe("10.00");
    expect(formatDisplayValue(10.5, 2)).toBe("10.50");
    expect(formatDisplayValue(10.567, 2)).toBe("10.57");
  });

  it("should handle different sig fig counts", () => {
    expect(formatDisplayValue(10.12345, 0)).toBe("10");
    expect(formatDisplayValue(10.12345, 1)).toBe("10.1");
    expect(formatDisplayValue(10.12345, 3)).toBe("10.123");
  });

  it("should handle negative numbers", () => {
    expect(formatDisplayValue(-10.5, 2)).toBe("-10.50");
  });
});

describe("validateNumericChange", () => {
  const config: NumericConfig = {
    bounds: { min: 0, max: 100 },
    sigFigs: 2,
    enforceLimits: true,
  };

  it("should handle valid input within bounds", () => {
    const result = validateNumericChange("75", config);

    expect(result.newState.numeric).toBe(75);
    expect(result.newState.status).toBe(NumericStatus.Within);
    expect(result.shouldCallOnChange).toBe(true);
    expect(result.valueToEmit).toBe(75);
  });

  it("should handle input above bounds with enforced limits", () => {
    const result = validateNumericChange("150", config);

    expect(result.newState.numeric).toBe(150);
    expect(result.newState.status).toBe(NumericStatus.Above);
    expect(result.shouldCallOnChange).toBe(false);
    expect(result.valueToEmit).toBeUndefined();
  });

  it("should handle input above bounds without enforced limits", () => {
    const configNoLimits = { ...config, enforceLimits: false };
    const result = validateNumericChange("150", configNoLimits);

    expect(result.shouldCallOnChange).toBe(true);
    expect(result.valueToEmit).toBe(150);
  });

  it("should handle invalid input", () => {
    const result = validateNumericChange("abc", config);

    expect(result.newState.status).toBe(NumericStatus.Invalid);
    expect(result.shouldCallOnChange).toBe(false);
    expect(result.valueToEmit).toBeUndefined();
  });

  it("should handle boundary values", () => {
    const resultMin = validateNumericChange("0", config);
    expect(resultMin.shouldCallOnChange).toBe(true);
    expect(resultMin.valueToEmit).toBe(0);

    const resultMax = validateNumericChange("100", config);
    expect(resultMax.shouldCallOnChange).toBe(true);
    expect(resultMax.valueToEmit).toBe(100);
  });
});

describe("revertToValue", () => {
  const config: NumericConfig = {
    bounds: { min: 0, max: 100 },
    sigFigs: 2,
    enforceLimits: true,
  };

  it("should create properly formatted state for valid values", () => {
    const result = revertToValue(42.5, config);

    expect(result.numeric).toBe(42.5);
    expect(result.status).toBe(NumericStatus.Within);
    expect(result.textValue).toBe("42.50");
  });

  it("should handle boundary values correctly", () => {
    const resultMin = revertToValue(0, config);
    expect(resultMin.status).toBe(NumericStatus.LowerBound);
    expect(resultMin.textValue).toBe("0.00");

    const resultMax = revertToValue(100, config);
    expect(resultMax.status).toBe(NumericStatus.UpperBound);
    expect(resultMax.textValue).toBe("100.00");
  });

  it("should handle out-of-bounds values", () => {
    const resultBelow = revertToValue(-10, config);
    expect(resultBelow.status).toBe(NumericStatus.Below);
    expect(resultBelow.textValue).toBe("-10.00");

    const resultAbove = revertToValue(150, config);
    expect(resultAbove.status).toBe(NumericStatus.Above);
    expect(resultAbove.textValue).toBe("150.00");
  });

  it("should respect sigFigs formatting", () => {
    const configDifferentSigFigs = { ...config, sigFigs: 1 };
    const result = revertToValue(42.567, configDifferentSigFigs);

    expect(result.textValue).toBe("42.6");
  });
});

describe("validateOnBlur", () => {
  const config: NumericConfig = {
    bounds: { min: 0, max: 100 },
    sigFigs: 2,
    enforceLimits: true,
  };

  it("should format valid values correctly", () => {
    const currentState: NumericState = {
      numeric: 42.5,
      status: NumericStatus.Within,
      textValue: "42.5",
    };

    const result = validateOnBlur(currentState, config);

    expect(result.finalState.numeric).toBe(42.5);
    expect(result.finalState.textValue).toBe("42.50");
    expect(result.valueToEmit).toBe(42.5);
  });

  it("should clamp values below minimum when limits enforced", () => {
    const currentState: NumericState = {
      numeric: -10,
      status: NumericStatus.Below,
      textValue: "-10",
    };

    const result = validateOnBlur(currentState, config);

    expect(result.finalState.numeric).toBe(0);
    expect(result.finalState.status).toBe(NumericStatus.LowerBound);
    expect(result.valueToEmit).toBe(0);
  });

  it("should clamp values above maximum when limits enforced", () => {
    const currentState: NumericState = {
      numeric: 150,
      status: NumericStatus.Above,
      textValue: "150",
    };

    const result = validateOnBlur(currentState, config);

    expect(result.finalState.numeric).toBe(100);
    expect(result.finalState.status).toBe(NumericStatus.UpperBound);
    expect(result.valueToEmit).toBe(100);
  });

  it("should not clamp values when limits not enforced", () => {
    const configNoLimits = { ...config, enforceLimits: false };
    const currentState: NumericState = {
      numeric: 150,
      status: NumericStatus.Above,
      textValue: "150",
    };

    const result = validateOnBlur(currentState, configNoLimits);

    expect(result.finalState.numeric).toBe(150);
    expect(result.valueToEmit).toBe(150);
  });
});
