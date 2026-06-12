"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductTable } from "@/features/products/components/product-table";
import { useCreateProduct } from "@/features/products/hooks/use-create-product";
import { useDeactivateProduct } from "@/features/products/hooks/use-deactivate-product";
import { useProducts } from "@/features/products/hooks/use-products";
import { useReactivateProduct } from "@/features/products/hooks/use-reactivate-product";
import { useUpdateProduct } from "@/features/products/hooks/use-update-product";
import type { Product } from "@/features/products/types/product.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

type ProductFilterValue = "all" | "active" | "inactive";

const filterToActiveMap: Record<ProductFilterValue, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export function ProductsPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [filter, setFilter] = useState<ProductFilterValue>("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  const deferredSearch = useDeferredValue(search.trim());

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    active: filterToActiveMap[filter],
    categoryId,
    search: deferredSearch || undefined,
  });
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deactivateProductMutation = useDeactivateProduct();
  const reactivateProductMutation = useReactivateProduct();

  const categoryNamesById = useMemo(
    () =>
      Object.fromEntries(
        (categoriesQuery.data ?? []).map((category) => [category.id, category.name])
      ),
    [categoriesQuery.data]
  );

  const products = useMemo(() => {
    let source = productsQuery.data ?? [];

    if (filter !== "all") {
      source = source.filter((product) =>
        filter === "active" ? product.active : !product.active
      );
    }

    if (categoryId) {
      source = source.filter((product) => product.categoryId === categoryId);
    }

    if (deferredSearch) {
      const normalized = deferredSearch.toLowerCase();
      source = source.filter((product) => {
        const haystack = [product.name, product.sku ?? ""].join(" ").toLowerCase();
        return haystack.includes(normalized);
      });
    }

    return source;
  }, [categoryId, deferredSearch, filter, productsQuery.data]);

  const queryMessages = productsQuery.error
    ? getApiErrorMessages(productsQuery.error)
    : [];
  const isForbiddenQuery =
    productsQuery.error &&
    isApiError(productsQuery.error) &&
    productsQuery.error.statusCode === HTTP_STATUS.forbidden;

  async function handleCreateProduct(values: {
    name: string;
    description?: string;
    sku?: string;
    categoryId?: string;
    unit: Product["unit"];
    stockManagementType: Product["stockManagementType"];
  }) {
    await createProductMutation.mutateAsync(values);
    setIsCreateOpen(false);
  }

  async function handleUpdateProduct(values: {
    name: string;
    description?: string;
    sku?: string;
    categoryId?: string;
    unit: Product["unit"];
    stockManagementType: Product["stockManagementType"];
  }) {
    if (!editingProduct) {
      return;
    }

    await updateProductMutation.mutateAsync({
      productId: editingProduct.id,
      data: values,
    });
    setEditingProduct(null);
  }

  async function handleDeactivateProduct(product: Product) {
    setPendingProductId(product.id);
    setPendingAction("deactivate");

    try {
      await deactivateProductMutation.mutateAsync(product.id);
    } finally {
      setPendingProductId(null);
      setPendingAction(null);
    }
  }

  async function handleReactivateProduct(product: Product) {
    setPendingProductId(product.id);
    setPendingAction("reactivate");

    try {
      await reactivateProductMutation.mutateAsync(product.id);
    } finally {
      setPendingProductId(null);
      setPendingAction(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogo"
        title="Productos"
        description="Administra productos, su categoria operativa y su tipo de gestion sin crear stock, costos ni precios en Sprint 4."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nuevo producto
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-5">
          <ProductFilters
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categories={categoriesQuery.data ?? []}
          />

          {productsQuery.isLoading ? (
            <LoadingState
              title="Cargando productos"
              message="Estamos consultando el catalogo de productos."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {productsQuery.error ? (
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

          {!productsQuery.isLoading &&
          !productsQuery.error &&
          products.length === 0 ? (
            <EmptyState
              title="Sin productos"
              message="Todavia no hay productos para mostrar con los filtros seleccionados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!productsQuery.isLoading &&
          !productsQuery.error &&
          products.length > 0 ? (
            <ProductTable
              products={products}
              canMutate={canMutate}
              categoryNamesById={categoryNamesById}
              onEdit={setEditingProduct}
              onDeactivate={handleDeactivateProduct}
              onReactivate={handleReactivateProduct}
              pendingProductId={pendingProductId}
              pendingAction={pendingAction}
            />
          ) : null}
        </CardContent>
      </Card>

      <ProductForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nuevo producto"
        description="Crea un producto basico del catalogo. Esta accion no crea stock, costo ni precio."
        submitLabel="Crear producto"
        categories={categoriesQuery.data ?? []}
        isPending={createProductMutation.isPending}
        error={createProductMutation.error}
        onSubmit={handleCreateProduct}
      />

      <ProductForm
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
        title="Editar producto"
        description="Actualiza los datos visibles del producto sin afectar inventario, costos ni precios."
        submitLabel="Guardar cambios"
        categories={categoriesQuery.data ?? []}
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name,
                description: editingProduct.description ?? undefined,
                sku: editingProduct.sku ?? undefined,
                categoryId: editingProduct.categoryId ?? undefined,
                unit: editingProduct.unit,
                stockManagementType: editingProduct.stockManagementType,
              }
            : undefined
        }
        isPending={updateProductMutation.isPending}
        error={updateProductMutation.error}
        onSubmit={handleUpdateProduct}
      />
    </section>
  );
}
