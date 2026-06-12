import type { ApiErrorPayload } from "@/types/common";

type ApiErrorOptions = ApiErrorPayload & {
  raw?: unknown;
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

  constructor({ statusCode, message, error, raw }: ApiErrorOptions) {
    super(normalizeMessage(message));
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
    this.raw = raw;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
