export type PaymentBank = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentBankInput = {
  name: string;
  description?: string;
};

export type UpdatePaymentBankInput = {
  name?: string;
  description?: string;
};
