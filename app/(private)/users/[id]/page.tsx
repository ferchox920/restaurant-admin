import { UserDetailPage } from "@/features/users/components/user-detail-page";

type UserDetailRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailRoutePage({
  params,
}: UserDetailRoutePageProps) {
  const { id } = await params;

  return <UserDetailPage userId={id} />;
}
