import { AuditLogDetailPage } from "@/features/audit/components/audit-log-detail-page";

type AuditLogDetailRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AuditLogDetailRoutePage({
  params,
}: AuditLogDetailRoutePageProps) {
  const { id } = await params;

  return <AuditLogDetailPage auditLogId={id} />;
}
