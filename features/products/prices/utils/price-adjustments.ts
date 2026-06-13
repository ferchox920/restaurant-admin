import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";

export type PriceAdjustmentChannel = Pick<
  SalesChannel,
  "id" | "name" | "commissionType" | "commissionValue"
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

  if (channel.commissionType === "PERCENTAGE") {
    return String(
      roundToCents(numericBasePrice * (1 + channel.commissionValue / 100))
    );
  }

  if (channel.commissionType === "FIXED") {
    return String(roundToCents(numericBasePrice + channel.commissionValue));
  }

  return String(roundToCents(numericBasePrice));
}
