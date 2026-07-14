import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isNotFoundError, shouldRetryQuery } from "@/lib/api/query-utils";

describe("query utils", () => {
  it("does not retry client, conflict or rate-limit errors", () => {
    for (const statusCode of [
      HTTP_STATUS.badRequest,
      HTTP_STATUS.unauthorized,
      HTTP_STATUS.forbidden,
      HTTP_STATUS.notFound,
      HTTP_STATUS.conflict,
      HTTP_STATUS.tooManyRequests,
    ]) {
      expect(
        shouldRetryQuery(0, new ApiError({ statusCode, message: String(statusCode) }))
      ).toBe(false);
    }
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
