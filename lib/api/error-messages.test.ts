import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/api-error";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";

describe("getApiErrorMessages", () => {
  it("sanitizes technical prisma-like messages", () => {
    const error = new ApiError({
      statusCode: 500,
      message: "Invalid `prisma.user.findMany()` invocation",
    });

    expect(getApiErrorMessages(error)).toEqual([
      "Ocurrio un error inesperado. Intenta nuevamente.",
    ]);
  });

  it("returns friendly unauthorized messaging", () => {
    const error = new ApiError({
      statusCode: HTTP_STATUS.unauthorized,
      message: "",
    });

    expect(getApiErrorMessages(error)).toEqual([
      "Tu sesion no es valida o expiro. Inicia sesion nuevamente.",
    ]);
  });

  it("returns friendly messaging when a product has no current cost", () => {
    const error = new ApiError({
      statusCode: HTTP_STATUS.notFound,
      message:
        'Current cost for product with id "92541815-c57e-4685-ae9e-cbfd61f33e5c" was not found.',
    });

    expect(getApiErrorMessages(error)).toEqual([
      "El producto no es elegible para venta porque no tiene costo vigente.",
    ]);
  });

  it("returns friendly messaging when a product has no current price", () => {
    const error = new ApiError({
      statusCode: HTTP_STATUS.notFound,
      message:
        'Current price for product with id "92541815-c57e-4685-ae9e-cbfd61f33e5c" was not found.',
    });

    expect(getApiErrorMessages(error)).toEqual([
      "El producto no es elegible para venta porque no tiene precio final vigente.",
    ]);
  });

  it("returns connection messaging for network failures", () => {
    expect(getApiErrorMessages(new TypeError("Failed to fetch"))).toEqual([
      "No se pudo conectar con la API. Verifica tu red o el backend.",
    ]);
  });

  it("hides server details and uses the rate-limit message", () => {
    expect(
      getApiErrorMessages(
        new ApiError({ statusCode: HTTP_STATUS.internalServerError, message: "database detail" })
      )
    ).toEqual(["Ocurrio un error inesperado. Intenta nuevamente."]);
    expect(
      getApiErrorMessages(
        new ApiError({ statusCode: HTTP_STATUS.tooManyRequests, message: "throttled" })
      )
    ).toEqual(["Demasiadas solicitudes. Espera unos segundos e intenta nuevamente."]);
  });
});
