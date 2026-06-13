function sanitizeDecimalSeparator(value: string) {
  return value.replace(/,/g, ".");
}

export function normalizeDecimalInput(value: string) {
  const sanitized = sanitizeDecimalSeparator(value)
    .replace(/[^\d.]/g, "")
    .replace(/^\./, "0.")
    .replace(/\.{2,}/g, ".")
    .replace(/^(-?)(\d*)\.(.*)\.(.*)$/, "$1$2.$3$4");

  const [integerPart = "", decimalPart] = sanitized.split(".");
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";

  if (decimalPart === undefined) {
    return normalizedInteger;
  }

  return `${normalizedInteger}.${decimalPart}`;
}

export function toApiDecimalNumber(value: string) {
  const normalizedValue = normalizeDecimalInput(value.trim());
  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    throw new Error("Invalid decimal value.");
  }

  return numericValue;
}

export function formatMoney(value: string | number, currency = "$") {
  const normalizedValue =
    typeof value === "number"
      ? String(value)
      : normalizeDecimalInput(String(value).trim());

  if (!normalizedValue) {
    return `${currency} -`;
  }

  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    return `${currency} ${value}`;
  }

  const decimalPart = normalizedValue.split(".")[1] ?? "";
  const formatter = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimalPart.length,
    maximumFractionDigits: Math.max(decimalPart.length, 2),
  });

  return `${currency} ${formatter.format(numericValue)}`;
}
