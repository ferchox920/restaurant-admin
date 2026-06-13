"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (_, userId) => {
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.options(),
      });
    },
  });
}
