export type ProductPriceBase = {
  id: string;
  productId: string;
  salesChannelId: string;
  salesChannelName: string | null;
  price: string;
  validFrom: string;
  validTo: string | null;
  createdById: string | null;
  createdAt: string;
  isCurrent: boolean;
};

export type CurrentProductPrice = ProductPriceBase;

export type ProductPriceHistoryItem = ProductPriceBase;

export type CreateProductPriceInput = {
  salesChannelId: string;
  price: string;
};

export type CreateProductPriceRequest = {
  salesChannelId: string;
  price: number;
};
