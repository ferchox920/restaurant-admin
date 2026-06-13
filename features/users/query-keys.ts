export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: () => [...usersQueryKeys.lists()] as const,
  details: () => [...usersQueryKeys.all, "detail"] as const,
  detail: (userId: string) => [...usersQueryKeys.details(), userId] as const,
  options: () => [...usersQueryKeys.all, "options"] as const,
};
