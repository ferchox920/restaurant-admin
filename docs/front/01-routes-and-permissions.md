# 01 - Routes and Permissions

## Matriz de rutas

| Ruta | Pantalla | Modulo | ADMIN | MANAGER | CASHIER | AUDITOR | Tipo de acceso | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/login` | Login | Auth | Si | Si | Si | Si | `PUBLIC` | Ruta publica de autenticacion. |
| `/dashboard` | Dashboard | Dashboard | Si | Si | Si | Si | `PRIVATE` | Entrada principal luego de login. El contenido visible depende del rol. |
| `/categories` | Lista de categorias | Categorias | Si | Si | Si lectura | Si lectura | `OPERATIONAL` | Backend permite consulta a todos y mutacion a `ADMIN`/`MANAGER`. |
| `/sales-channels` | Lista de canales | Sales Channels | Si | Si | Si lectura | Si lectura | `OPERATIONAL` | Backend permite consulta a todos y mutacion a `ADMIN`/`MANAGER`. |
| `/products` | Lista de productos | Productos | Si | Si | Si lectura | Si lectura | `OPERATIONAL` | Backend permite consulta a todos y mutacion a `ADMIN`/`MANAGER`. |
| `/products/[id]` | Detalle de producto | Productos | Si | Si | Si lectura | Si lectura | `READ` | El detalle puede exponer acciones editables solo para `ADMIN`/`MANAGER`. |
| `/products/[id]/costs` | Historial de costos | Costos historicos | Si | Si | No | Si lectura | `OPERATIONAL` | Crear costo solo `ADMIN`/`MANAGER`. Lectura para `ADMIN`/`MANAGER`/`AUDITOR`. |
| `/products/[id]/prices` | Historial de precios por canal | Precios por canal | Si | Si | No | Si lectura | `OPERATIONAL` | Crear precio solo `ADMIN`/`MANAGER`. Lectura historica para `ADMIN`/`MANAGER`/`AUDITOR`. |
| `/inventory` | Stock general | Inventario | Si | Si | Si lectura | Si lectura | `OPERATIONAL` | Consulta general disponible para todos los roles. |
| `/inventory/[productId]` | Detalle de inventario por producto | Inventario | Si | Si | Si lectura parcial | Si lectura | `OPERATIONAL` | Stock por producto visible para todos; movimientos y mutaciones restringidos. |
| `/sales` | Lista de tickets/ventas | Tickets/Ventas | Si | Si | Si | Si lectura | `OPERATIONAL` | Lectura disponible para todos. Acciones dependen del estado del ticket y del rol. |
| `/sales/new` | Nuevo ticket | Tickets/Ventas | Si | Si | Si | No | `MUTATE` | Crear ticket disponible para `ADMIN`/`MANAGER`/`CASHIER`. |
| `/sales/[ticketId]` | Detalle de ticket/venta | Tickets/Ventas | Si | Si | Si operacion draft | Si lectura | `OPERATIONAL` | `CASHIER` puede editar, cancelar draft y confirmar; no puede hacer `void` de confirmadas. |
| `/reports` | Hub de reportes | Reportes | Si | Si | No | Si | `READ` | Acceso solo `ADMIN`/`MANAGER`/`AUDITOR`. |
| `/reports/stock` | Reporte de stock | Reportes | Si | Si | No | Si | `READ` | Basado en `GET /api/reports/stock`. |
| `/reports/sales-by-channel` | Reporte de ventas por canal | Reportes | Si | Si | No | Si | `READ` | Basado en `GET /api/reports/sales-by-channel`. |
| `/reports/sales-by-product` | Reporte de ventas por producto | Reportes | Si | Si | No | Si | `READ` | Basado en `GET /api/reports/sales-by-product`. |
| `/reports/sales-by-user` | Reporte de ventas por usuario | Reportes | Si | Si | No | Si | `READ` | Basado en `GET /api/reports/sales-by-user`. |
| `/reports/inventory-movements` | Reporte de movimientos de inventario | Reportes | Si | Si | No | Si | `READ` | Basado en `GET /api/reports/inventory-movements`. |
| `/audit-logs` | Lista de auditoria | Auditoria | Si | No | No | Si | `AUDITOR_READ` | Backend solo permite `ADMIN` y `AUDITOR`. |
| `/audit-logs/[id]` | Detalle de log de auditoria | Auditoria | Si | No | No | Si | `AUDITOR_READ` | Backend solo permite `ADMIN` y `AUDITOR`. |
| `/users` | Lista de usuarios | Usuarios | Si | No | No | No | `ADMIN_ONLY` | Gestion de usuarios reservada a `ADMIN`. |
| `/users/[id]` | Detalle de usuario | Usuarios | Si | No | No | No | `ADMIN_ONLY` | Ver y editar usuario reservado a `ADMIN`. |
| `/settings` | Ajustes futuros | Settings | Si | Si | No | No | `PRIVATE` | Placeholder documental. No promete funcionalidad MVP ni endpoint backend actual. |

## Reglas de navegacion

- El menu oculta rutas no permitidas por rol.
- El guard visual del frontend no reemplaza la autorizacion real del backend.
- Si la API responde `401`, el frontend debe limpiar sesion y redirigir a `/login`.
- Si la API responde `403`, el frontend debe mostrar una pagina o mensaje explicito de acceso denegado.
- Si un usuario autenticado intenta entrar manualmente a una ruta no permitida, la politica documental es mostrar `403` y no redirigir silenciosamente.

## Menu lateral por rol

### ADMIN

- Dashboard.
- Categorias.
- Canales de venta.
- Productos.
- Inventario.
- Ventas.
- Reportes.
- Auditoria.
- Usuarios.
- Settings placeholder.

### MANAGER

- Dashboard.
- Categorias.
- Canales de venta.
- Productos.
- Inventario.
- Ventas.
- Reportes.
- Settings placeholder.

### CASHIER

- Dashboard.
- Ventas.
- Inventario en lectura general.
- Catalogo operativo en lectura.

### AUDITOR

- Dashboard.
- Reportes.
- Auditoria.
- Ventas en lectura.
- Inventario en lectura.
- Catalogo en lectura.

## Criterios de interpretacion

- Las rutas documentadas deben reflejar permisos reales del backend actual y no supuestos futuros.
- En vistas operativas, la UI debe distinguir entre lectura y mutacion segun rol.
- En ventas, debe diferenciarse la operacion sobre tickets `DRAFT` de la anulacion de ventas confirmadas.
- `CASHIER` puede operar tickets en borrador y confirmar ventas, pero no ejecutar `void`.
- `MANAGER` no accede a auditoria general mientras el backend no lo habilite.
- `/settings` se conserva solo como placeholder futuro, fuera del alcance funcional del MVP.
