export type Category = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
};
