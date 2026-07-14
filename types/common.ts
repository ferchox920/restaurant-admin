export type ApiErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type PaginationParams = {
  limit?: number;
  offset?: number;
};
