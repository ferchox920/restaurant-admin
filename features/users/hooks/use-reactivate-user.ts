"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactivateUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateUser,
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
