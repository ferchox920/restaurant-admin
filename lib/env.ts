const defaultApiUrl = "http://localhost:3000";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const apiUrl = configuredApiUrl || defaultApiUrl;
export const appName =
  process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Restaurant Admin";
