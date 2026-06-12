import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

const DEFAULT_ERROR_MESSAGE =
  "Ocurrió un error inesperado. Intenta nuevamente.";
const UNAUTHORIZED_ERROR_MESSAGE =
  "Tu sesión no es válida o expiró. Inicia sesión nuevamente.";
const FORBIDDEN_ERROR_MESSAGE =
  "No tienes permisos para realizar esta acción.";

function getRawMessage(raw: unknown) {
  if (!raw || typeof raw !== "object" || !("message" in raw)) {
    return undefined;
  }

  const message = raw.message;

  if (typeof message === "string" || Array.isArray(message)) {
    return message;
  }

  return undefined;
}

function normalizeMessages(messages: string | string[] | undefined) {
  if (!messages) {
    return [];
  }

  return Array.isArray(messages) ? messages : [messages];
}

export function getApiErrorMessages(error: unknown) {
  if (!isApiError(error)) {
    return [DEFAULT_ERROR_MESSAGE];
  }

  const normalizedMessages = normalizeMessages(
    getRawMessage(error.raw) ?? error.message
  );

  if (normalizedMessages.length > 0) {
    return normalizedMessages;
  }

  if (error.statusCode === HTTP_STATUS.unauthorized) {
    return [UNAUTHORIZED_ERROR_MESSAGE];
  }

  if (error.statusCode === HTTP_STATUS.forbidden) {
    return [FORBIDDEN_ERROR_MESSAGE];
  }

  return [DEFAULT_ERROR_MESSAGE];
}

export function getApiErrorMessage(error: unknown) {
  return getApiErrorMessages(error)[0] ?? DEFAULT_ERROR_MESSAGE;
}

export const apiErrorMessages = {
  unauthorized: UNAUTHORIZED_ERROR_MESSAGE,
  forbidden: FORBIDDEN_ERROR_MESSAGE,
  unexpected: DEFAULT_ERROR_MESSAGE,
} as const;
