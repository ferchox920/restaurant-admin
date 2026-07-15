"use client";

import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/feedback/page-skeleton";

const StockReportPage = dynamic(
  () =>
    import("@/features/reports/components/stock-report-page").then(
      (module) => module.StockReportPage
    ),
  { loading: () => <PageSkeleton /> }
);

export function StockReportRoute() {
  return <StockReportPage />;
}
