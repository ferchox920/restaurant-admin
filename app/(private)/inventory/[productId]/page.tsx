import { ProductInventoryPage } from "@/features/inventory/components/product-inventory-page";

type ProductInventoryRoutePageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductInventoryRoutePage({
  params,
}: ProductInventoryRoutePageProps) {
  const { productId } = await params;

  return <ProductInventoryPage productId={productId} />;
}
