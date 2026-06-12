export type ProductCostBase = {
  id: string;
  productId: string;
  cost: string;
  validFrom: string;
  validTo: string | null;
  createdById: string | null;
  createdAt: string;
  isCurrent: boolean;
};

export type CurrentProductCost = ProductCostBase;

export type ProductCostHistoryItem = ProductCostBase;

export type CreateProductCostInput = {
  cost: string;
};

export type CreateProductCostRequest = {
  cost: number;
};
