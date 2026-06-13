import { AuditDataViewer } from "@/features/audit/components/audit-data-viewer";

export function AuditMetadataView({ value }: { value: unknown }) {
  return (
    <AuditDataViewer
      title="Metadata"
      value={value}
      emptyMessage="Sin metadata adicional"
    />
  );
}
