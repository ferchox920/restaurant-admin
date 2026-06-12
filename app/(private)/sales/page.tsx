import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function SalesPage() {
  return (
    <ModulePlaceholder
      title="Ventas"
      description="El flujo operativo de tickets y ventas todavia no se implementa en frontend. Sprint 3 solo agrega el placeholder privado dentro del shell administrativo."
      sprint="Sprint 4 o posterior"
      roles={["ADMIN", "MANAGER", "CASHIER", "AUDITOR"]}
      notes="Esta ruta prepara el ingreso al futuro flujo de ventas y respeta la lectura visual para AUDITOR definida en este sprint."
      status="Modulo en construccion"
    />
  );
}
