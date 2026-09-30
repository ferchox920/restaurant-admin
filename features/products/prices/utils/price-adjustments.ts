import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";

export type PriceAdjustmentChannel = Pick<
  SalesChannel,
  "id" | "name" | "subTaxes"
>;

function roundToCents(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateChannelPrice(
  basePrice: string | number,
  channel: PriceAdjustmentChannel
) {
  const numericBasePrice =
    typeof basePrice === "number" ? basePrice : Number(basePrice);

  if (!Number.isFinite(numericBasePrice)) {
    return "0";
  }

  const totalTaxPercentage = (channel.subTaxes ?? []).reduce(
    (total, subTax) => total + subTax.percentage,
    0
  );

  return String(
    roundToCents(numericBasePrice * (1 + totalTaxPercentage / 100))
  );
}
