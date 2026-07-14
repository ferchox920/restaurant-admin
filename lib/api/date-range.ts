export function toIsoDateBoundary(value: string, boundary: "start" | "end") {
  if (!value) return undefined;
  const suffix = boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z";
  return new Date(`${value}${suffix}`).toISOString();
}

export function isValidDateRange(from?: string, to?: string) {
  return !from || !to || new Date(to).getTime() >= new Date(from).getTime();
}

export const INVALID_DATE_RANGE_MESSAGE =
  "La fecha hasta no puede ser anterior a la fecha desde.";
