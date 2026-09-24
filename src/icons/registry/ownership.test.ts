import { describe, expect, it } from "vitest";
import { tablerIconRegistry } from "./tabler.generated";
import { semioIconRegistry } from "./semio.generated";
import { solarIconRegistry } from "./solar";
import { roleIconRegistry } from "./roles";

describe("built-in icon ownership", () => {
  it("assigns each key to one source, independent of merge order", () => {
    const keys = [
      tablerIconRegistry,
      semioIconRegistry,
      solarIconRegistry,
      roleIconRegistry,
    ].flatMap((registry) => Object.keys(registry));
    expect(keys.filter((key, index) => keys.indexOf(key) !== index)).toEqual([]);
  });
});
