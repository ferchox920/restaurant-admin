export const commissionTypes = ["NONE", "PERCENTAGE", "FIXED"] as const;

export type CommissionType = (typeof commissionTypes)[number];

export type SalesChannelSubTax = {
  id: string;
  name: string;
  percentage: number;
};

export type SalesChannelSubTaxInput = {
  name: string;
  percentage: number;
};

export type SalesChannel = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  commissionType: CommissionType;
  commissionValue: number;
  subTaxes: SalesChannelSubTax[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSalesChannelInput = {
  name: string;
  code: string;
  description?: string;
  commissionType: CommissionType;
  commissionValue: number;
  subTaxes?: SalesChannelSubTaxInput[];
};

export type UpdateSalesChannelInput = {
  name?: string;
  code?: string;
  description?: string;
  commissionType?: CommissionType;
  commissionValue?: number;
  subTaxes?: SalesChannelSubTaxInput[];
};
