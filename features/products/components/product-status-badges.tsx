import { StatusBadge } from "@/components/common/status-badge";
import {
  getProductCatalogHint,
  type Product,
} from "@/features/products/types/product.types";

type ProductStatusBadgesProps = {
  product: Pick<Product, "active" | "stockManagementType">;
};

export function ProductStatusBadges({ product }: ProductStatusBadgesProps) {
  const hint = getProductCatalogHint(
    product.stockManagementType,
    product.active
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={product.active ? "active" : "inactive"} />
      <StatusBadge status={hint.status} label={hint.label} />
    </div>
  );
}
