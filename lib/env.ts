const defaultApiUrl = "http://localhost:3000";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const sessionMode =
  process.env.NEXT_PUBLIC_SESSION_MODE?.trim().toLowerCase() === "cookie"
    ? "cookie"
    : "bearer";

export const apiUrl =
  sessionMode === "cookie" ? "/backend" : configuredApiUrl || defaultApiUrl;
export const appName =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Restaurant Admin";
export const realtimeEnabled =
  process.env.NEXT_PUBLIC_REALTIME_ENABLED?.trim().toLowerCase() === "true";
export const stockReportPaginationEnabled =
  process.env.NEXT_PUBLIC_STOCK_REPORT_PAGINATION?.trim().toLowerCase() ===
  "true";
export const posCatalogEnabled =
  process.env.NEXT_PUBLIC_POS_CATALOG_ENABLED?.trim().toLowerCase() === "true";
