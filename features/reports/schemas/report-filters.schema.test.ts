import { describe, expect, it } from "vitest";
import {
  inventoryMovementReportFiltersSchema,
  salesReportFiltersSchema,
} from "@/features/reports/schemas/report-filters.schema";

describe("report filters schema", () => {
  it("accepts valid sales report filters", () => {
    const result = salesReportFiltersSchema.safeParse({
      from: "2026-06-12T00:00:00.000Z",
      to: "2026-06-13T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid UUIDs and inverted date ranges", () => {
    const invalidUser = salesReportFiltersSchema.safeParse({
      userId: "not-a-uuid",
    });
    const invertedRange = salesReportFiltersSchema.safeParse({
      from: "2026-06-13T00:00:00.000Z",
      to: "2026-06-12T00:00:00.000Z",
    });

    expect(invalidUser.success).toBe(false);
    expect(invertedRange.success).toBe(false);
  });

  it("rejects out of range pagination for inventory movements", () => {
    expect(
      inventoryMovementReportFiltersSchema.safeParse({
        limit: 0,
        offset: -1,
      }).success
    ).toBe(false);
    expect(
      inventoryMovementReportFiltersSchema.safeParse({
        limit: 101,
      }).success
    ).toBe(false);
  });
});
