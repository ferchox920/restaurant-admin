"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUsers } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";
import type { PaginationParams } from "@/types/common";

export function useUsers(
  paginationOrEnabled?: PaginationParams | boolean,
  enabled = true
) {
  const pagination =
    typeof paginationOrEnabled === "boolean" ? undefined : paginationOrEnabled;
  const isEnabled =
    typeof paginationOrEnabled === "boolean" ? paginationOrEnabled : enabled;
  return useQuery({
    queryKey: usersQueryKeys.list(pagination),
    queryFn: ({ signal }) => getUsers(pagination, signal),
    placeholderData: keepPreviousData,
    enabled: isEnabled,
  });
}
