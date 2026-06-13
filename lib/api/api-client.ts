import { apiUrl } from "@/lib/env";
import { getAccessToken } from "@/lib/auth/token-storage";
import { ApiError } from "@/lib/api/api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import type { ApiErrorPayload } from "@/types/common";

function buildUrl(path: string) {
  const normalizedBaseUrl = apiUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function parseResponse(response: Response) {
  if (response.status === HTTP_STATUS.noContent) {
    return null;
  }

  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

type RequestOptions = {
  notFoundAsNull?: boolean;
};

function shouldReturnNullOnNotFound(path: string, options?: RequestOptions) {
  return (
    options?.notFoundAsNull ||
    /\/api\/products\/[^/]+\/costs\/current(?:\?|$)/.test(path) ||
    /\/api\/products\/[^/]+\/prices\/current(?:\?|$)/.test(path)
  );
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: RequestOptions
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const payload = await parseResponse(response);

  if (
    !response.ok &&
    response.status === HTTP_STATUS.notFound &&
    shouldReturnNullOnNotFound(path, options)
  ) {
    return null as T;
  }

  if (!response.ok) {
    const errorPayload =
      typeof payload === "object" && payload !== null
        ? (payload as ApiErrorPayload)
        : undefined;

    throw new ApiError({
      statusCode: response.status,
      message:
        errorPayload?.message ||
        response.statusText ||
        "Unexpected API error.",
      error: errorPayload?.error,
      raw: payload,
    });
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path, { method: "GET" });
  },
  getOrNullOnNotFound<T>(path: string) {
    return request<T | null>(path, { method: "GET" }, { notFoundAsNull: true });
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  delete<T>(path: string) {
    return request<T>(path, { method: "DELETE" });
  },
};
