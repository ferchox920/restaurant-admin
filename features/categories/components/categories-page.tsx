"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useCreateCategory } from "@/features/categories/hooks/use-create-category";
import { useUpdateCategory } from "@/features/categories/hooks/use-update-category";
import { useDeactivateCategory } from "@/features/categories/hooks/use-deactivate-category";
import { useReactivateCategory } from "@/features/categories/hooks/use-reactivate-category";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryTable } from "@/features/categories/components/category-table";
import type { Category } from "@/features/categories/types/category.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";

type CategoryFilterValue = "all" | "active" | "inactive";

const filterToActiveMap: Record<CategoryFilterValue, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export function CategoriesPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [filter, setFilter] = useState<CategoryFilterValue>("all");
  const [offset, setOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(
    null
  );
  const [pendingAction, setPendingAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  const categoriesQuery = useCategories({
    active: filterToActiveMap[filter],
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  });
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deactivateCategoryMutation = useDeactivateCategory();
  const reactivateCategoryMutation = useReactivateCategory();

  const categories = categoriesQuery.data ?? [];

  const queryMessages = categoriesQuery.error
    ? getApiErrorMessages(categoriesQuery.error)
    : [];
  const isForbiddenQuery =
    categoriesQuery.error &&
    isApiError(categoriesQuery.error) &&
    categoriesQuery.error.statusCode === HTTP_STATUS.forbidden;

  async function handleCreateCategory(values: {
    name: string;
    description?: string;
  }) {
    await createCategoryMutation.mutateAsync(values);
    setIsCreateOpen(false);
  }

  async function handleUpdateCategory(values: {
    name?: string;
    description?: string;
  }) {
    if (!editingCategory) {
      return;
    }

    await updateCategoryMutation.mutateAsync({
      categoryId: editingCategory.id,
      data: values,
    });
    setEditingCategory(null);
  }

  async function handleDeactivateCategory(category: Category) {
    setPendingCategoryId(category.id);
    setPendingAction("deactivate");

    try {
      await deactivateCategoryMutation.mutateAsync(category.id);
    } finally {
      setPendingCategoryId(null);
      setPendingAction(null);
    }
  }

  async function handleReactivateCategory(category: Category) {
    setPendingCategoryId(category.id);
    setPendingAction("reactivate");

    try {
      await reactivateCategoryMutation.mutateAsync(category.id);
    } finally {
      setPendingCategoryId(null);
      setPendingAction(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogo"
        title="Categorias"
        description="Administra las categorias del catalogo desde la API del backend. Las acciones de mutacion quedan reservadas a perfiles administrativos."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nueva categoria
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => {
                setFilter("all");
                setOffset(0);
              }}
            >
              Todas
            </Button>
            <Button
              type="button"
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => {
                setFilter("active");
                setOffset(0);
              }}
            >
              Activas
            </Button>
            <Button
              type="button"
              variant={filter === "inactive" ? "default" : "outline"}
              onClick={() => {
                setFilter("inactive");
                setOffset(0);
              }}
            >
              Inactivas
            </Button>
          </div>

          {categoriesQuery.isLoading ? (
            <LoadingState
              title="Cargando categorias"
              message="Estamos consultando el catalogo disponible."
              className="w-full max-w-none shadow-none"
            />
          ) : null}
          {!categoriesQuery.error ? (
            <PaginationControls
              offset={offset}
              limit={DEFAULT_PAGE_LIMIT}
              itemCount={categories.length}
              onOffsetChange={setOffset}
              disabled={categoriesQuery.isFetching}
            />
          ) : null}

          {categoriesQuery.error ? (
            <ErrorMessage
              variant={isForbiddenQuery ? "forbidden" : "general"}
              title={
                isForbiddenQuery
                  ? "Acceso restringido"
                  : "No se pudo cargar el listado"
              }
              messages={queryMessages}
            />
          ) : null}

          {!categoriesQuery.isLoading &&
          !categoriesQuery.error &&
          categories.length === 0 ? (
            <EmptyState
              title="Sin categorias"
              message="Todavia no hay categorias para mostrar con el filtro seleccionado."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!categoriesQuery.isLoading &&
          !categoriesQuery.error &&
          categories.length > 0 ? (
            <CategoryTable
              categories={categories}
              canMutate={canMutate}
              onEdit={setEditingCategory}
              onDeactivate={handleDeactivateCategory}
              onReactivate={handleReactivateCategory}
              pendingCategoryId={pendingCategoryId}
              pendingAction={pendingAction}
            />
          ) : null}
        </CardContent>
      </Card>

      <CategoryForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nueva categoria"
        description="Crea una categoria basica del catalogo. No se enviaran campos extra al backend."
        submitLabel="Crear categoria"
        isPending={createCategoryMutation.isPending}
        error={createCategoryMutation.error}
        onSubmit={handleCreateCategory}
      />

      <CategoryForm
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCategory(null);
          }
        }}
        title="Editar categoria"
        description="Actualiza los datos operativos visibles de la categoria."
        submitLabel="Guardar cambios"
        initialValues={
          editingCategory
            ? {
                name: editingCategory.name,
                description: editingCategory.description ?? undefined,
              }
            : undefined
        }
        isPending={updateCategoryMutation.isPending}
        error={updateCategoryMutation.error}
        onSubmit={handleUpdateCategory}
      />
    </section>
  );
}
