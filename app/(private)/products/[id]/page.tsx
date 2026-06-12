import { ProductDetailPage } from "@/features/products/components/product-detail-page";

type ProductDetailRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailRoutePage({
  params,
}: ProductDetailRoutePageProps) {
  const { id } = await params;

  return <ProductDetailPage productId={id} />;
}
