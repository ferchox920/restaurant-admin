import { apiClient } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/api/build-query-string";
import type {
  CreatePaymentBankInput,
  PaymentBank,
  UpdatePaymentBankInput,
} from "@/features/payment-banks/types/payment-bank.types";
import type { PaginationParams } from "@/types/common";
import { fetchAllPages, withDefaultPagination } from "@/lib/api/pagination";

export type PaymentBanksFilters = PaginationParams & {
  active?: boolean;
};

export function getPaymentBanks(filters?: PaymentBanksFilters, signal?: AbortSignal) {
  const pagination = withDefaultPagination(filters);
  const queryString = buildQueryString({
    active: filters?.active,
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return apiClient.get<PaymentBank[]>(`/api/payment-banks${queryString}`, signal);
}

export function getAllPaymentBanks(
  filters?: Omit<PaymentBanksFilters, "limit" | "offset">,
  signal?: AbortSignal
) {
  return fetchAllPages(
    (pagination) => getPaymentBanks({ ...filters, ...pagination }, signal),
    signal
  );
}

export function createPaymentBank(payload: CreatePaymentBankInput) {
  return apiClient.post<PaymentBank>("/api/payment-banks", payload);
}

export function updatePaymentBank(
  paymentBankId: string,
  payload: UpdatePaymentBankInput
) {
  return apiClient.patch<PaymentBank>(
    `/api/payment-banks/${paymentBankId}`,
    payload
  );
}

export function deactivatePaymentBank(paymentBankId: string) {
  return apiClient.patch<PaymentBank>(
    `/api/payment-banks/${paymentBankId}/deactivate`
  );
}

export function reactivatePaymentBank(paymentBankId: string) {
  return apiClient.patch<PaymentBank>(
    `/api/payment-banks/${paymentBankId}/reactivate`
  );
}
