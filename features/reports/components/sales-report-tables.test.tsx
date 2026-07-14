import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SalesByChannelReportTable } from "@/features/reports/components/sales-by-channel-report-table";
import { SalesByProductReportTable } from "@/features/reports/components/sales-by-product-report-table";
import { SalesByUserReportTable } from "@/features/reports/components/sales-by-user-report-table";

describe("sales report tables", () => {
  it("renders decimal strings and channel metrics without reordering", () => {
    render(<SalesByChannelReportTable items={[
      { salesChannelId: "second", salesChannelName: "Segundo", salesChannelCode: "S", ticketsCount: 2, itemsCount: 3, quantitySold: "1.250", grossSales: "1234.567", historicalCost: "1000.111", grossProfit: "234.456", averageTicket: "617.2835" },
      { salesChannelId: "first", salesChannelName: "Primero", salesChannelCode: "P", ticketsCount: 1, itemsCount: 1, quantitySold: "0.500", grossSales: "10.25", historicalCost: "5.10", grossProfit: "5.15", averageTicket: "10.25" },
    ]} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByText("Segundo")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Primero")).toBeInTheDocument();
    expect(screen.getByText("1.250")).toBeInTheDocument();
    expect(screen.getByText(/1\.234,567/)).toBeInTheDocument();
  });

  it("keeps product snapshots and supports a null SKU", () => {
    render(<SalesByProductReportTable items={[{
      productId: "product-id",
      productNameSnapshot: "Nombre historico",
      productSkuSnapshot: null,
      productUnitSnapshot: "KG",
      quantitySold: "0.375",
      grossSales: "99.90",
      historicalCost: "40.10",
      grossProfit: "59.80",
      ticketsCount: 2,
    }]} />);

    expect(screen.getByText("Nombre historico")).toBeInTheDocument();
    expect(screen.getByText("0.375")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/product-id");
  });

  it("renders unknown users and itemsCount when identity fields are null", () => {
    render(<SalesByUserReportTable items={[{
      userId: null,
      userEmail: null,
      userFullName: null,
      ticketsCount: 2,
      itemsCount: 7,
      quantitySold: "3.500",
      grossSales: "200.00",
      historicalCost: "120.00",
      grossProfit: "80.00",
    }]} />);

    expect(screen.getByText("Usuario desconocido")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3.500")).toBeInTheDocument();
  });
});
