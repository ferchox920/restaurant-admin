const THOUSANDS_SEPARATOR_PATTERN = /^\d{1,3}([.,]\d{3})+([.,]\d+)?$/;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

export function normalizeQuantityInput(value: string) {
  return value.trim().replace(",", ".");
}

export function isQuantityInputValid(value: string) {
  const normalized = normalizeQuantityInput(value);

  if (!normalized) {
    return false;
  }

  if (THOUSANDS_SEPARATOR_PATTERN.test(value.trim())) {
    return false;
  }

  return DECIMAL_PATTERN.test(normalized);
}

export function toApiQuantityNumber(value: string) {
  const normalized = normalizeQuantityInput(value);

  if (!isQuantityInputValid(normalized)) {
    throw new Error("Cantidad invalida. Usa solo decimales simples sin miles.");
  }

  const parsed = Number(normalized);

  const decimalPlaces = normalized.split(".")[1]?.length ?? 0;
  if (decimalPlaces > 2 || parsed > 99999999.99) {
    throw new Error(
      "Cantidad fuera del contrato decimal(10,2). Usa como maximo dos decimales."
    );
  }
  if (!Number.isFinite(parsed)) {
    throw new Error("Cantidad invalida. No se pudo convertir el valor.");
  }

  return parsed;
}
