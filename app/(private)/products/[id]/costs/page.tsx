import { ProductCostsPage } from "@/features/products/costs/components/product-costs-page";

type ProductCostsRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductCostsRoutePage({
  params,
}: ProductCostsRoutePageProps) {
  const { id } = await params;

  return <ProductCostsPage productId={id} />;
}
