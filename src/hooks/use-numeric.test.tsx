// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChangeEvent, FocusEvent } from "react";
import { useNumeric } from "./use-numeric";

/** Minimal ChangeEvent stand-in: useNumeric only reads target.value + nativeEvent.data. */
function changeEvent(value: string): ChangeEvent<HTMLInputElement> {
  return {
    target: { value },
    nativeEvent: { data: value.slice(-1) },
  } as unknown as ChangeEvent<HTMLInputElement>;
}

const blurEvent = {} as FocusEvent<HTMLInputElement>;

describe("useNumeric dirty/blur behavior", () => {
  it("starts clean and does not emit on blur without an edit", () => {
    const onValidChange = vi.fn();
    const { result } = renderHook(() => useNumeric({ initial: 5, onValidChange }));

    expect(result.current.dirty).toBe(false);

    act(() => result.current.onBlur(blurEvent));

    // Blur without typing must NOT emit — otherwise it would clobber an
    // external value change (e.g. a moving playhead) with the stale value
    // captured at focus time.
    expect(onValidChange).not.toHaveBeenCalled();
    expect(result.current.dirty).toBe(false);
  });

  it("becomes dirty on edit and emits the typed value on blur", () => {
    const onValidChange = vi.fn();
    const { result } = renderHook(() => useNumeric({ initial: 5, onValidChange }));

    act(() => result.current.onChange(changeEvent("7")));
    expect(result.current.dirty).toBe(true);
    expect(result.current.textValue).toBe("7");

    act(() => result.current.onBlur(blurEvent));
    expect(onValidChange).toHaveBeenLastCalledWith(7, blurEvent);
    // Dirty resets after commit so the next focus starts clean.
    expect(result.current.dirty).toBe(false);
  });

  it("ignores invalid characters without becoming dirty", () => {
    const onValidChange = vi.fn();
    const { result } = renderHook(() => useNumeric({ initial: 5, onValidChange }));

    act(() => result.current.onChange(changeEvent("a")));

    expect(result.current.dirty).toBe(false);
    expect(onValidChange).not.toHaveBeenCalled();
  });
});
