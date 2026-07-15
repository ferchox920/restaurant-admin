export const QUERY_STALE_TIME = {
  operational: 15_000,
  administrative: 60_000,
  options: 5 * 60_000,
} as const;

export type QueryActivationOptions = {
  enabled?: boolean;
};
