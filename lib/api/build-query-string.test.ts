import { describe, expect, it } from "vitest";
import { buildQueryString } from "@/lib/api/build-query-string";

describe("buildQueryString", () => {
  it("omits empty values and serializes valid params", () => {
    expect(
      buildQueryString({
        search: "pizza",
        active: true,
        limit: 50,
        empty: "",
        missing: undefined,
        nullable: null,
      })
    ).toBe("?search=pizza&active=true&limit=50");
  });

  it("returns an empty string when no params survive normalization", () => {
    expect(
      buildQueryString({
        search: "",
        active: undefined,
        nullable: null,
      })
    ).toBe("");
  });
});
