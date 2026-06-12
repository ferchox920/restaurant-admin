import { ProductPricesPage } from "@/features/products/prices/components/product-prices-page";

type ProductPricesRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPricesRoutePage({
  params,
}: ProductPricesRoutePageProps) {
  const { id } = await params;

  return <ProductPricesPage productId={id} />;
}
