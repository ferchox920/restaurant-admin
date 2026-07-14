import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

function getErrorStatusCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return undefined;
}

export function shouldRetryQuery(failureCount: number, error: unknown) {
  const nonRetryableStatuses = new Set<number>([
    HTTP_STATUS.unauthorized,
    HTTP_STATUS.forbidden,
    HTTP_STATUS.notFound,
    HTTP_STATUS.badRequest,
    HTTP_STATUS.conflict,
    HTTP_STATUS.tooManyRequests,
  ]);

  const statusCode = getErrorStatusCode(error);

  if (statusCode && nonRetryableStatuses.has(statusCode)) {
    return false;
  }

  return failureCount < 2;
}

export function isNotFoundError(error: unknown) {
  return (
    (isApiError(error) || getErrorStatusCode(error) !== undefined) &&
    getErrorStatusCode(error) === HTTP_STATUS.notFound
  );
}
