export const productPricesQueryKeys = {
  all: ["product-prices"] as const,
  historyLists: () => [...productPricesQueryKeys.all, "history"] as const,
  history: (productId: string, channelId?: string) =>
    [
      ...productPricesQueryKeys.historyLists(),
      productId,
      channelId ?? "all",
    ] as const,
  currentLists: () => [...productPricesQueryKeys.all, "current"] as const,
  current: (productId: string, channelId: string) =>
    [...productPricesQueryKeys.currentLists(), productId, channelId] as const,
};
