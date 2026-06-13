import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

const DEFAULT_ERROR_MESSAGE =
  "Ocurrio un error inesperado. Intenta nuevamente.";
const UNAUTHORIZED_ERROR_MESSAGE =
  "Tu sesion no es valida o expiro. Inicia sesion nuevamente.";
const FORBIDDEN_ERROR_MESSAGE =
  "No tienes permisos para realizar esta accion.";
const CONFLICT_ERROR_MESSAGE =
  "No se pudo completar la operacion porque existe un conflicto de negocio.";
const CONNECTION_ERROR_MESSAGE =
  "No se pudo conectar con la API. Verifica tu red o el backend.";
const INTERNAL_DEFAULT_API_MESSAGE = "Unexpected API error.";

function sanitizeMessage(message: string) {
  if (/current cost for product/i.test(message)) {
    return "El producto no es elegible para venta porque no tiene costo vigente.";
  }

  if (/current price for product/i.test(message)) {
    return "El producto no es elegible para venta porque no tiene precio final vigente.";
  }

  if (/prisma|constraint|stack|invalid `prisma/i.test(message)) {
    return undefined;
  }

  return message;
}

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

  return (Array.isArray(messages) ? messages : [messages]).flatMap((message) => {
    const sanitized = sanitizeMessage(message);
    return sanitized ? [sanitized] : [];
  });
}

export function getApiErrorMessages(error: unknown) {
  if (error instanceof TypeError) {
    return [CONNECTION_ERROR_MESSAGE];
  }

  if (!isApiError(error)) {
    return [DEFAULT_ERROR_MESSAGE];
  }

  const normalizedMessages = normalizeMessages(
    getRawMessage(error.raw) ?? error.message
  );

  const shouldPreferStatusFallback =
    normalizedMessages.length === 0 ||
    normalizedMessages.every((message) => message === INTERNAL_DEFAULT_API_MESSAGE);

  if (!shouldPreferStatusFallback && normalizedMessages.length > 0) {
    return normalizedMessages;
  }

  if (error.statusCode === HTTP_STATUS.unauthorized) {
    return [UNAUTHORIZED_ERROR_MESSAGE];
  }

  if (error.statusCode === HTTP_STATUS.forbidden) {
    return [FORBIDDEN_ERROR_MESSAGE];
  }

  if (error.statusCode === HTTP_STATUS.conflict) {
    return [CONFLICT_ERROR_MESSAGE];
  }

  return [DEFAULT_ERROR_MESSAGE];
}

export function getApiErrorMessage(error: unknown) {
  return getApiErrorMessages(error)[0] ?? DEFAULT_ERROR_MESSAGE;
}

export const apiErrorMessages = {
  unauthorized: UNAUTHORIZED_ERROR_MESSAGE,
  forbidden: FORBIDDEN_ERROR_MESSAGE,
  conflict: CONFLICT_ERROR_MESSAGE,
  connection: CONNECTION_ERROR_MESSAGE,
  unexpected: DEFAULT_ERROR_MESSAGE,
} as const;
