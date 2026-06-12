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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Actualizado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const categoryName =
            product.category?.name ??
            (product.categoryId ? categoryNamesById[product.categoryId] : undefined);

          return (
            <TableRow
              key={product.id}
              className={!product.active ? "bg-muted/30 text-muted-foreground" : ""}
            >
              <TableCell className="font-medium text-foreground">
                <Link
                  href={`/products/${product.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.description || "Sin descripcion"}
                </p>
              </TableCell>
              <TableCell>{product.sku || "-"}</TableCell>
              <TableCell>{formatCategoryName(categoryName ? { name: categoryName } : null)}</TableCell>
              <TableCell>{formatProductUnit(product.unit)}</TableCell>
              <TableCell>
                <ProductStatusBadges product={product} />
              </TableCell>
              <TableCell>{formatDateTime(product.updatedAt)}</TableCell>
              <TableCell>
                <ProductActions
                  product={product}
                  canMutate={canMutate}
                  onEdit={onEdit}
                  onDeactivate={onDeactivate}
                  onReactivate={onReactivate}
                  isDeactivatePending={
                    pendingProductId === product.id && pendingAction === "deactivate"
                  }
                  isReactivatePending={
                    pendingProductId === product.id && pendingAction === "reactivate"
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
