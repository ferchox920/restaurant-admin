import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductActions } from "@/features/products/components/product-actions";
import { ProductStatusBadges } from "@/features/products/components/product-status-badges";
import type { Product } from "@/features/products/types/product.types";
import {
  formatCategoryName,
  formatDateTime,
  formatProductUnit,
} from "@/lib/formatters";

type ProductTableProps = {
  products: Product[];
  canMutate: boolean;
  categoryNamesById: Record<string, string>;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => Promise<void> | void;
  onReactivate: (product: Product) => Promise<void> | void;
  pendingProductId?: string | null;
  pendingAction?: "deactivate" | "reactivate" | null;
};

export function ProductTable({
  products,
  canMutate,
  categoryNamesById,
  onEdit,
  onDeactivate,
  onReactivate,
  pendingProductId,
  pendingAction,
}: ProductTableProps) {
  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden xl:table-cell">Actualizado</TableHead>
          {canMutate ? (
            <TableHead className="text-right">Acciones</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const categoryName =
            product.category?.name ??
            (product.categoryId
              ? categoryNamesById[product.categoryId]
              : undefined);

          return (
            <TableRow
              key={product.id}
              className={
                !product.active ? "bg-muted/30 text-muted-foreground" : ""
              }
            >
              <TableCell className="max-w-72 whitespace-normal">
                <Link
                  href={`/products/${product.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {product.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {product.sku ? (
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                      {product.sku}
                    </span>
                  ) : null}
                  {product.description ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {product.description}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                {formatCategoryName(
                  categoryName ? { name: categoryName } : null
                )}
              </TableCell>
              <TableCell>{formatProductUnit(product.unit)}</TableCell>
              <TableCell>
                <ProductStatusBadges product={product} />
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {formatDateTime(product.updatedAt)}
              </TableCell>
              {canMutate ? (
                <TableCell>
                  <ProductActions
                    product={product}
                    canMutate={canMutate}
                    showViewLink={false}
                    onEdit={onEdit}
                    onDeactivate={onDeactivate}
                    onReactivate={onReactivate}
                    isDeactivatePending={
                      pendingProductId === product.id &&
                      pendingAction === "deactivate"
                    }
                    isReactivatePending={
                      pendingProductId === product.id &&
                      pendingAction === "reactivate"
                    }
                  />
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
