import { describe, expect, it } from "vitest";
import {
  formatMoney,
  normalizeDecimalInput,
  toApiDecimalNumber,
} from "@/lib/money";

describe("money helpers", () => {
  it("normalizes decimal strings without losing decimal intent", () => {
    expect(normalizeDecimalInput("0012,50")).toBe("12.50");
    expect(normalizeDecimalInput(".75")).toBe("0.75");
  });

  it("converts normalized decimals to API numbers", () => {
    expect(toApiDecimalNumber("12,50")).toBe(12.5);
  });

  it("formats money preserving decimals when provided", () => {
    expect(formatMoney("12.5")).toBe("$ 12,5");
    expect(formatMoney("12.345")).toBe("$ 12,345");
  });
});
