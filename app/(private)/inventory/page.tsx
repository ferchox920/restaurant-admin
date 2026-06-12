import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function InventoryPage() {
  return (
    <ModulePlaceholder
      title="Inventario"
      description="La lectura y operacion real de stock se implementaran en un sprint futuro. Esta pagina existe para validar layout y accesos visuales por rol."
      sprint="Sprint 4 o posterior"
      roles={["ADMIN", "MANAGER", "CASHIER"]}
      notes="Inventario permanece visible para operacion de venta y administracion, pero sin datos reales ni interaccion con API."
      status="Modulo en construccion"
    />
  );
}
