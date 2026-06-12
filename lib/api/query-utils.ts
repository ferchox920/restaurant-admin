import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (
    isApiError(error) &&
    [
      HTTP_STATUS.unauthorized,
      HTTP_STATUS.forbidden,
      HTTP_STATUS.notFound,
    ].includes(error.statusCode)
  ) {
    return false;
  }

  return failureCount < 2;
}

export function isNotFoundError(error: unknown) {
  return isApiError(error) && error.statusCode === HTTP_STATUS.notFound;
}
