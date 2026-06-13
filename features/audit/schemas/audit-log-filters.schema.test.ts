import { describe, expect, it } from "vitest";
import { auditLogFiltersSchema } from "@/features/audit/schemas/audit-log-filters.schema";

describe("audit log filters schema", () => {
  it("accepts valid filters", () => {
    expect(
      auditLogFiltersSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        limit: 50,
        offset: 0,
      }).success
    ).toBe(true);
  });

  it("rejects invalid UUIDs, ranges and pagination values", () => {
    expect(
      auditLogFiltersSchema.safeParse({
        userId: "bad-uuid",
      }).success
    ).toBe(false);
    expect(
      auditLogFiltersSchema.safeParse({
        from: "2026-06-13T00:00:00.000Z",
        to: "2026-06-12T00:00:00.000Z",
      }).success
    ).toBe(false);
    expect(
      auditLogFiltersSchema.safeParse({
        limit: 0,
        offset: -1,
      }).success
    ).toBe(false);
  });
});
