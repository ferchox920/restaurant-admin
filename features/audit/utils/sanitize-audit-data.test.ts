import { describe, expect, it } from "vitest";
import { sanitizeAuditData } from "@/features/audit/utils/sanitize-audit-data";

describe("sanitizeAuditData", () => {
  it("redacts sensitive keys recursively", () => {
    const sanitized = sanitizeAuditData({
      password: "secret",
      nested: {
        accessToken: "token",
        safe: "ok",
      },
    });

    expect(sanitized).toEqual({
      password: "[REDACTED]",
      nested: {
        accessToken: "[REDACTED]",
        safe: "ok",
      },
    });
  });

  it("marks circular references safely", () => {
    const source: Record<string, unknown> = { id: "1" };
    source.self = source;

    const sanitized = sanitizeAuditData(source);

    expect(sanitized).toEqual({
      id: "1",
      self: "[CIRCULAR]",
    });
  });
});
