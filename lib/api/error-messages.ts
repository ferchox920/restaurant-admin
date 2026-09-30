import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

const DEFAULT_ERROR_MESSAGE =
  "Ocurrio un error inesperado. Intenta nuevamente.";
const UNAUTHORIZED_ERROR_MESSAGE =
  "Tu sesion no es valida o expiro. Inicia sesion nuevamente.";
const FORBIDDEN_ERROR_MESSAGE = "No tienes permisos para realizar esta accion.";
const CONFLICT_ERROR_MESSAGE =
  "No se pudo completar la operacion porque existe un conflicto de negocio.";
const CONNECTION_ERROR_MESSAGE =
  "No se pudo conectar con la API. Verifica tu red o el backend.";
const INTERNAL_DEFAULT_API_MESSAGE = "Unexpected API error.";
const TOO_MANY_REQUESTS_ERROR_MESSAGE =
  "Demasiadas solicitudes. Espera unos segundos e intenta nuevamente.";
const NOT_FOUND_ERROR_MESSAGE = "El recurso solicitado no existe.";

function sanitizeMessage(message: string) {
  if (/table.*not found|mesa.*no encontrada/i.test(message)) {
    return "Mesa no encontrada.";
  }

  if (/inactive table|table.*inactive|mesa.*inactiva/i.test(message)) {
    return "La mesa esta inactiva.";
  }

  if (/occupied table|table.*occupied|mesa.*ocupada/i.test(message)) {
    return "La mesa esta ocupada.";
  }

  if (/order.*not found|orden.*no encontrada/i.test(message)) {
    return "Orden no encontrada.";
  }

  if (/already cancelled|orden.*cancelada/i.test(message)) {
    return "La orden ya esta cancelada.";
  }

  if (/already closed|orden.*cerrada/i.test(message)) {
    return "La orden ya esta cerrada.";
  }

  if (/empty order|without items|sin items|sin consumos/i.test(message)) {
    return "La orden no tiene consumos para cerrar.";
  }

  if (/insufficient stock|stock insuficiente/i.test(message)) {
    return "Stock insuficiente. La orden sigue abierta y no se modificaron los consumos.";
  }

  if (/paymentMethod|payment method|metodo.*pago/i.test(message)) {
    return "Falta el metodo de cierre requerido.";
  }

  if (/paymentBankId|payment bank|banco/i.test(message)) {
    return "La transferencia requiere un banco valido y CASH no debe enviar banco.";
  }

  if (/not sellable|producto.*no vendible/i.test(message)) {
    return "El producto no es vendible.";
  }

  if (/inactive product|producto.*inactivo/i.test(message)) {
    return "El producto esta inactivo.";
  }

  if (/recipe_based|RECIPE_BASED/i.test(message)) {
    return "Los productos RECIPE_BASED no se pueden vender directamente.";
  }

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

  return (Array.isArray(messages) ? messages : [messages]).flatMap(
    (message) => {
      const sanitized = sanitizeMessage(message);
      return sanitized ? [sanitized] : [];
    }
  );
}

export function getApiErrorMessages(error: unknown) {
  if (error instanceof TypeError) {
    return [
      CONNECTION_ERROR_MESSAGE +
        " El resultado de una mutacion puede ser incierto. Consulta el estado o reintenta sin cambiar los datos; conservamos la misma clave para cerrar, confirmar o anular.",
    ];
  }

  if (!isApiError(error)) {
    return [DEFAULT_ERROR_MESSAGE];
  }

  if (error.statusCode === HTTP_STATUS.tooManyRequests) {
    return [TOO_MANY_REQUESTS_ERROR_MESSAGE];
  }

  if (error.statusCode === HTTP_STATUS.internalServerError) {
    return [DEFAULT_ERROR_MESSAGE];
  }

  const code =
    error.raw && typeof error.raw === "object" && "code" in error.raw
      ? error.raw.code
      : undefined;
  if (code === "STALE_VERSION")
    return [
      "Otra sesion modifico este recurso. Los datos se actualizaron; revisa los consumos y vuelve a confirmar tu decision.",
    ];
  if (
    code === "IDEMPOTENCY_RECOVERY_REQUIRED" ||
    code === "IDEMPOTENCY_IN_PROGRESS"
  )
    return [
      "Operacion pendiente de reconciliacion. Conservamos la clave; consulta el estado y solicita revision antes de iniciar otra operacion.",
    ];
  const normalizedMessages = normalizeMessages(
    getRawMessage(error.raw) ?? error.message
  );

  const shouldPreferStatusFallback =
    normalizedMessages.length === 0 ||
    normalizedMessages.every(
      (message) => message === INTERNAL_DEFAULT_API_MESSAGE
    );

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

  if (error.statusCode === HTTP_STATUS.notFound) {
    return [NOT_FOUND_ERROR_MESSAGE];
  }

  return [DEFAULT_ERROR_MESSAGE];
}
