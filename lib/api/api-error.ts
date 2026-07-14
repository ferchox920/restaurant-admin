import type { ApiErrorPayload } from "@/types/common";

type ApiErrorOptions = ApiErrorPayload & {
  raw?: unknown;
  retryAfter?: number;
};

function normalizeMessage(message?: string | string[]) {
  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message || "Unexpected API error.";
}

export class ApiError extends Error {
  statusCode?: number;
  error?: string;
  raw?: unknown;
  retryAfter?: number;

  constructor({ statusCode, message, error, raw, retryAfter }: ApiErrorOptions) {
    super(normalizeMessage(message));
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
    this.raw = raw;
    this.retryAfter = retryAfter;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
