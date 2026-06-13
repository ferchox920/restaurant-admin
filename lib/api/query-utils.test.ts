import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isNotFoundError, shouldRetryQuery } from "@/lib/api/query-utils";

describe("query utils", () => {
  it("does not retry unauthorized, forbidden or not found errors", () => {
    expect(
      shouldRetryQuery(
        0,
        new ApiError({ statusCode: HTTP_STATUS.unauthorized, message: "401" })
      )
    ).toBe(false);
    expect(
      shouldRetryQuery(
        0,
        new ApiError({ statusCode: HTTP_STATUS.forbidden, message: "403" })
      )
    ).toBe(false);
    expect(
      shouldRetryQuery(
        0,
        new ApiError({ statusCode: HTTP_STATUS.notFound, message: "404" })
      )
    ).toBe(false);
  });

  it("retries generic failures up to the configured limit", () => {
    expect(shouldRetryQuery(0, new Error("network"))).toBe(true);
    expect(shouldRetryQuery(1, new Error("network"))).toBe(true);
    expect(shouldRetryQuery(2, new Error("network"))).toBe(false);
  });

  it("detects not found API errors", () => {
    expect(
      isNotFoundError(
        new ApiError({ statusCode: HTTP_STATUS.notFound, message: "missing" })
      )
    ).toBe(true);
    expect(isNotFoundError(new Error("other"))).toBe(false);
  });

  it("detects structurally equivalent not found errors", () => {
    expect(
      isNotFoundError({
        name: "ApiError",
        statusCode: HTTP_STATUS.notFound,
        message: "missing",
      })
    ).toBe(true);
  });
});
