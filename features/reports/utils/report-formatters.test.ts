import { describe, expect, it } from "vitest";
import {
  buildReportSearchParams,
  formatNullableUserName,
  formatReportDateRange,
  formatReportStockManagementType,
  getReportEmptyMessage,
  getStockReportStatus,
  toReportDateRange,
} from "@/features/reports/utils/report-formatters";

describe("report formatters", () => {
  it("builds ISO date boundaries for report ranges", () => {
    const range = toReportDateRange({ from: "2026-06-12", to: "2026-06-13" });

    expect(range.from).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(range.to).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(range.from as string).getTime()).toBeLessThan(
      new Date(range.to as string).getTime()
    );
  });

  it("formats date range labels and empty state copy", () => {
    expect(formatReportDateRange({})).toBe("Sin rango aplicado");
    expect(formatReportDateRange({ from: "2026-06-12" })).toBe(
      "Desde 2026-06-12"
    );
    expect(formatReportDateRange({ to: "2026-06-13" })).toBe(
      "Hasta 2026-06-13"
    );
    expect(
      formatReportDateRange({ from: "2026-06-12", to: "2026-06-13" })
    ).toBe("2026-06-12 - 2026-06-13");
    expect(getReportEmptyMessage("inventory-movements")).toContain(
      "movimientos de inventario"
    );
  });

  it("maps report stock statuses and stock management labels", () => {
    expect(getStockReportStatus("AVAILABLE")).toEqual({
      label: "Disponible",
      tone: "active",
    });
    expect(getStockReportStatus("LOW_STOCK")).toEqual({
      label: "Stock bajo",
      tone: "reserved",
    });
    expect(formatReportStockManagementType("FINISHED_PRODUCT")).toBe(
      "Inventariable"
    );
  });

  it("builds search params and nullable user names defensively", () => {
    expect(
      buildReportSearchParams({
        productId: "prod-1",
        from: undefined,
        to: undefined,
      })
    ).toBe("?productId=prod-1");
    expect(
      formatNullableUserName("Ada Lovelace", "ada@example.com")
    ).toBe("Ada Lovelace");
    expect(formatNullableUserName(null, "ada@example.com")).toBe(
      "ada@example.com"
    );
    expect(formatNullableUserName(null, null)).toBe("Usuario desconocido");
  });
});
