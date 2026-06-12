import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function ReportsSalesByProductPage() {
  return (
    <ModulePlaceholder
      title="Reporte de ventas por producto"
      description="Este placeholder anticipa el futuro reporte comparativo por producto y deja preparada la subruta privada correspondiente."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "MANAGER", "AUDITOR"]}
      notes="La ruta existe solo para validacion visual y no genera metricas ni mocks operativos."
    />
  );
}
