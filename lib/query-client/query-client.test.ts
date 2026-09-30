import { expect, it, vi } from "vitest";
import { QueryObserver } from "@tanstack/react-query";
import { getQueryClient } from "./query-client";
import { ApiError } from "@/lib/api/api-error";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";

it("refetches authoritative state after STALE_VERSION and never retries a mutation", async () => {
  const client = getQueryClient();
  const key = tableOrdersQueryKeys.detail("order");
  client.setQueryData(key, { version: "2" });
  const query = vi.fn(async () => ({ version: "9007199254740993" }));
  const observer = new QueryObserver(client, {
    queryKey: key,
    queryFn: query,
    staleTime: Infinity,
  });
  const unsubscribe = observer.subscribe(() => undefined);
  const send = vi.fn(async () => {
    throw new ApiError({
      statusCode: 409,
      message: "stale",
      raw: {
        code: "STALE_VERSION",
        entityType: "TableOrder",
        entityId: "order",
        currentVersion: "9007199254740993",
      },
    });
  });
  try {
    const mutation = client
      .getMutationCache()
      .build(client, { mutationFn: send });
    await expect(mutation.execute(undefined)).rejects.toThrow();
    await vi.waitFor(() =>
      expect(client.getQueryData(key)).toEqual({ version: "9007199254740993" })
    );
    expect(send).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledOnce();
  } finally {
    unsubscribe();
    client.clear();
  }
});
