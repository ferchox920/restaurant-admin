export const productCostsQueryKeys = {
  all: ["product-costs"] as const,
  historyLists: () => [...productCostsQueryKeys.all, "history"] as const,
  history: (productId: string) =>
    [...productCostsQueryKeys.historyLists(), productId] as const,
  currentLists: () => [...productCostsQueryKeys.all, "current"] as const,
  current: (productId: string) =>
    [...productCostsQueryKeys.currentLists(), productId] as const,
};
