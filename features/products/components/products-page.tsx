"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Boxes, CircleCheck, CircleOff, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAllCategories as useCategories } from "@/features/categories/hooks/use-all-categories";
import { ProductFilters } from "@/features/products/components/product-filters";
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
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

type ProductFilterValue = "all" | "active" | "inactive";

const ProductForm = dynamic(
  () =>
    import("@/features/products/components/product-form").then(
      (module) => module.ProductForm
    )
);

export function ProductsPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [filter, setFilter] = useState<ProductFilterValue>("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [offset, setOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  const deferredSearch = useDebouncedValue(search.trim(), 300);

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    active: filter === "all" ? undefined : filter === "active",
    categoryId,
    search: deferredSearch || undefined,
    limit: DEFAULT_PAGE_LIMIT,
    offset,
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

  const products = productsQuery.data ?? [];
  const productCounts = useMemo(() => {
    const items = productsQuery.data ?? [];
    const active = items.filter((product) => product.active).length;

    return {
      total: items.length,
      active,
      inactive: items.length - active,
    };
  }, [productsQuery.data]);

  const queryMessages = productsQuery.error
    ? getApiErrorMessages(productsQuery.error)
    : [];
  const isForbiddenQuery =
    productsQuery.error &&
    isApiError(productsQuery.error) &&
    productsQuery.error.statusCode === HTTP_STATUS.forbidden;
  const hasActiveFilters =
    filter !== "all" || Boolean(categoryId || deferredSearch);

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
        description="Organiza los productos, sus categorías, unidades de venta y modalidad de stock."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nuevo producto
            </Button>
          ) : null
        }
      />

      {!productsQuery.isLoading && !productsQuery.error ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Boxes aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{productCounts.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-semibold">
                  {productCounts.active}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-muted p-2 text-muted-foreground">
                <CircleOff aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-semibold">
                  {productCounts.inactive}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-5">
          <ProductFilters
            filter={filter}
            onFilterChange={(value) => { setFilter(value); setOffset(0); }}
            search={search}
            onSearchChange={(value) => { setSearch(value); setOffset(0); }}
            categoryId={categoryId}
            onCategoryChange={(value) => { setCategoryId(value); setOffset(0); }}
            categories={categoriesQuery.data ?? []}
            counts={productCounts}
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

          {categoriesQuery.error ? (
            <ErrorMessage
              title="No se pudieron cargar las categorías"
              messages={getApiErrorMessages(categoriesQuery.error)}
            />
          ) : null}

          {!productsQuery.isLoading && !productsQuery.error ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {products.length}{" "}
              {products.length === 1
                ? "producto encontrado"
                : "productos encontrados"}
            </p>
          ) : null}

          {!productsQuery.isLoading &&
          !productsQuery.error &&
          products.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "Sin coincidencias" : "Sin productos"}
              message={
                hasActiveFilters
                  ? "No encontramos productos con los filtros seleccionados."
                  : "Crea el primer producto para comenzar a organizar el catálogo."
              }
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
          {!productsQuery.error ? (
            <PaginationControls offset={offset} limit={DEFAULT_PAGE_LIMIT} itemCount={products.length} onOffsetChange={setOffset} disabled={productsQuery.isFetching} />
          ) : null}
        </CardContent>
      </Card>

      {isCreateOpen ? <ProductForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nuevo producto"
        description="Registra un producto del catalogo. Luego podras gestionar sus costos, precios e inventario cuando corresponda."
        submitLabel="Crear producto"
        categories={categoriesQuery.data ?? []}
        isPending={createProductMutation.isPending}
        error={createProductMutation.error}
        onSubmit={handleCreateProduct}
      /> : null}

      {editingProduct ? <ProductForm
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
        title="Editar producto"
        description="Actualiza la informacion comercial y operativa del producto."
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
      /> : null}
    </section>
  );
}
