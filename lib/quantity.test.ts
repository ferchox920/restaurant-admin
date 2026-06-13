import { describe, expect, it } from "vitest";
import {
  isQuantityInputValid,
  normalizeQuantityInput,
  toApiQuantityNumber,
} from "@/lib/quantity";

describe("quantity helpers", () => {
  it("normalizes decimal separators", () => {
    expect(normalizeQuantityInput(" 10,25 ")).toBe("10.25");
  });

  it("rejects thousands separators for MVP inputs", () => {
    expect(isQuantityInputValid("1.000")).toBe(false);
    expect(isQuantityInputValid("1,000")).toBe(false);
  });

  it("parses valid decimal quantities", () => {
    expect(toApiQuantityNumber("10.25")).toBe(10.25);
  });
});
