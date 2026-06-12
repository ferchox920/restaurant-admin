# 03 - API Contract Map

## Auth

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Auth | `/login` | Publico | `mutation` | `email`, `password` | `accessToken`, `user` | Guardar JWT en `localStorage`, hidratar sesion y luego consultar `me`. |
| `GET` | `/api/auth/me` | Auth | bootstrap de layout privado, recovery de sesion | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | header `Authorization` | `user` autenticado | Si responde `401`, limpiar sesion y redirigir a `/login`. |

## Users

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/users` | Users | `/users` | `ADMIN` | `query` | filtros si existen en backend | lista de usuarios | Pantalla administrativa exclusiva. |
| `POST` | `/api/users` | Users | `/users` alta | `ADMIN` | `mutation` | datos de usuario nuevo | usuario creado | Invalidar lista tras alta. |
| `GET` | `/api/users/:id` | Users | `/users/[id]` | `ADMIN` | `query` | `id` en ruta | detalle de usuario | Cargar antes de editar o ver estado. |
| `PATCH` | `/api/users/:id` | Users | `/users/[id]` edicion | `ADMIN` | `mutation` | campos editables del usuario | usuario actualizado | Refrescar detalle y lista. |
| `PATCH` | `/api/users/:id/deactivate` | Users | `/users/[id]` accion | `ADMIN` | `mutation` | sin payload o motivo si el backend lo exige a futuro | usuario desactivado | Mostrar cambio de estado sin borrar historial. |
| `PATCH` | `/api/users/:id/reactivate` | Users | `/users/[id]` accion | `ADMIN` | `mutation` | sin payload | usuario reactivado | Rehabilita operacion futura del usuario. |

## Categories

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/categories` | Categories | `/categories`, formularios de producto | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | filtros si existen | lista de categorias | Sirve para tablas y selectores. |
| `POST` | `/api/categories` | Categories | `/categories` alta | `ADMIN`, `MANAGER` | `mutation` | datos de categoria | categoria creada | Invalidar lista tras alta. |
| `GET` | `/api/categories/:id` | Categories | detalle o modal de categoria | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | `id` | detalle de categoria | Lectura operativa permitida a todos. |
| `PATCH` | `/api/categories/:id` | Categories | edicion de categoria | `ADMIN`, `MANAGER` | `mutation` | campos editables | categoria actualizada | Refrescar lista y detalle. |
| `PATCH` | `/api/categories/:id/deactivate` | Categories | accion en lista/detalle | `ADMIN`, `MANAGER` | `mutation` | sin payload | categoria desactivada | No implica borrado fisico. |
| `PATCH` | `/api/categories/:id/reactivate` | Categories | accion en lista/detalle | `ADMIN`, `MANAGER` | `mutation` | sin payload | categoria reactivada | Rehabilita uso futuro. |

## Sales Channels

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/sales-channels` | Sales Channels | `/sales-channels`, `/sales/new`, `/products/[id]/prices` | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | filtros si existen | lista de canales | Se usa tanto en catalogo como en ventas. |
| `POST` | `/api/sales-channels` | Sales Channels | `/sales-channels` alta | `ADMIN`, `MANAGER` | `mutation` | datos del canal | canal creado | Invalidar lista y selects dependientes. |
| `GET` | `/api/sales-channels/:id` | Sales Channels | detalle de canal | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | `id` | detalle del canal | Lectura disponible para todos los roles autenticados. |
| `PATCH` | `/api/sales-channels/:id` | Sales Channels | edicion de canal | `ADMIN`, `MANAGER` | `mutation` | campos editables | canal actualizado | Refrescar vistas relacionadas. |
| `PATCH` | `/api/sales-channels/:id/deactivate` | Sales Channels | accion en lista/detalle | `ADMIN`, `MANAGER` | `mutation` | sin payload | canal desactivado | No debe desaparecer el historico de ventas. |
| `PATCH` | `/api/sales-channels/:id/reactivate` | Sales Channels | accion en lista/detalle | `ADMIN`, `MANAGER` | `mutation` | sin payload | canal reactivado | Rehabilita uso futuro en ventas. |

## Products

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/products` | Products | `/products`, selectores operativos de ventas | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | filtros si existen | lista de productos | Base de catalogo y de seleccion de items. |
| `POST` | `/api/products` | Products | `/products` alta | `ADMIN`, `MANAGER` | `mutation` | `name`, `description?`, `sku?`, `categoryId?`, `unit`, `stockManagementType?` | producto creado | Invalidar lista y navegar al detalle si corresponde. |
| `GET` | `/api/products/:id` | Products | `/products/[id]` | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | `id` | detalle de producto | Lectura general permitida. |
| `PATCH` | `/api/products/:id` | Products | edicion de producto | `ADMIN`, `MANAGER` | `mutation` | campos editables | producto actualizado | Refrescar detalle y lista. |
| `PATCH` | `/api/products/:id/deactivate` | Products | accion en detalle/lista | `ADMIN`, `MANAGER` | `mutation` | sin payload | producto desactivado | Evita uso futuro, sin romper historia. |
| `PATCH` | `/api/products/:id/reactivate` | Products | accion en detalle/lista | `ADMIN`, `MANAGER` | `mutation` | sin payload | producto reactivado | Rehabilita operaciones futuras. |

## Product Costs

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/products/:id/costs` | Product Costs | `/products/[id]/costs` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `id` | historial de costos | Mostrar versiones ordenadas y no editables. |
| `GET` | `/api/products/:id/costs/current` | Product Costs | `/products/[id]/costs` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `id` | costo vigente | Sirve para encabezado o resumen del detalle. |
| `POST` | `/api/products/:id/costs` | Product Costs | `/products/[id]/costs` alta | `ADMIN`, `MANAGER` | `mutation` | `cost` | nueva version de costo | Invalidar costo vigente e historial. |

## Product Prices

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/products/:id/prices` | Product Prices | `/products/[id]/prices` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `id`, filtros opcionales | historial de precios | Puede filtrarse por canal si la UI lo necesita. |
| `GET` | `/api/products/:id/prices/current?channelId=<uuid>` | Product Prices | `/products/[id]/prices`, operaciones de venta | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | `id`, `channelId` | precio vigente del canal | El canal es obligatorio para resolver el precio actual. |
| `POST` | `/api/products/:id/prices` | Product Prices | `/products/[id]/prices` alta | `ADMIN`, `MANAGER` | `mutation` | `salesChannelId`, `price` | nueva version de precio | Invalidar historial y precio vigente del canal afectado. |

## Inventory

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/inventory` | Inventory | `/inventory` | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | filtros si existen | stock general | Cache corta por naturaleza operativa. |
| `GET` | `/api/inventory/products/:productId` | Inventory | `/inventory/[productId]` | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | `productId` | detalle de stock | Incluye datos de stock actual y estado. |
| `GET` | `/api/inventory/movements` | Inventory | vistas globales de movimientos | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | filtros si existen | lista de movimientos | `CASHIER` no accede a movimientos globales. |
| `GET` | `/api/inventory/products/:productId/movements` | Inventory | `/inventory/[productId]` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `productId` | movimientos del producto | Usar para trazabilidad puntual. |
| `POST` | `/api/inventory/products/:productId/stock-in` | Inventory | accion en `/inventory/[productId]` | `ADMIN`, `MANAGER` | `mutation` | `quantity`, `reason` | stock actualizado y movimiento | Invalidar stock general, detalle y movimientos. |
| `POST` | `/api/inventory/products/:productId/adjust` | Inventory | accion administrativa de ajuste | `ADMIN`, `MANAGER` | `mutation` | `newStock`, `reason` | stock actualizado y movimiento | Operacion sensible; requiere feedback claro. |
| `POST` | `/api/inventory/products/:productId/waste` | Inventory | accion de merma | `ADMIN`, `MANAGER` | `mutation` | `quantity`, `reason` | stock actualizado y movimiento `WASTE` | Reflejar descuento inmediatamente tras refresco. |
| `POST` | `/api/inventory/products/:productId/return-in` | Inventory | accion de reingreso | `ADMIN`, `MANAGER` | `mutation` | `quantity`, `reason` | stock actualizado y movimiento | Mantener trazabilidad del origen. |
| `PATCH` | `/api/inventory/products/:productId/minimum-stock` | Inventory | configuracion del producto | `ADMIN`, `MANAGER` | `mutation` | `minimumStock` | stock con minimo actualizado | Puede impactar badges o alertas de estado. |

## Sales

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/sales/tickets` | Sales | `/sales` | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | filtros si existen | lista de tickets | Vista operativa e historica. |
| `POST` | `/api/sales/tickets` | Sales | `/sales/new` | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | `salesChannelId`, `notes?` | ticket `DRAFT` creado | Navegar al detalle tras crear. |
| `GET` | `/api/sales/tickets/:ticketId` | Sales | `/sales/[ticketId]` | `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR` | `query` | `ticketId` | detalle de ticket | Base para lectura y acciones permitidas por estado. |
| `PATCH` | `/api/sales/tickets/:ticketId` | Sales | edicion de ticket draft | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | campos editables del ticket | ticket actualizado | Solo mientras el estado lo permita. |
| `POST` | `/api/sales/tickets/:ticketId/cancel` | Sales | accion sobre draft | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | sin imponer payload extra | ticket cancelado | Documentar como cancelacion de borrador. |
| `POST` | `/api/sales/tickets/:ticketId/items` | Sales | `/sales/[ticketId]` | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | `productId`, `quantity` | item agregado y ticket actualizado | Invalidar detalle del ticket. |
| `PATCH` | `/api/sales/tickets/:ticketId/items/:itemId` | Sales | `/sales/[ticketId]` | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | `quantity` | item actualizado | Mantener UI sincronizada con el total y snapshots. |
| `DELETE` | `/api/sales/tickets/:ticketId/items/:itemId` | Sales | `/sales/[ticketId]` | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | identificadores en ruta | ticket actualizado sin item | Confirmacion visual antes de quitar linea. |
| `POST` | `/api/sales/tickets/:ticketId/confirm` | Sales | `/sales/[ticketId]` | `ADMIN`, `MANAGER`, `CASHIER` | `mutation` | sin payload funcional relevante | ticket confirmado | Debe refrescar estado y posibles efectos sobre stock. |
| `POST` | `/api/sales/tickets/:ticketId/void` | Sales | `/sales/[ticketId]` | `ADMIN`, `MANAGER` | `mutation` | `reason` | ticket anulado | Exige motivo y no debe mostrarse a `CASHIER` ni `AUDITOR`. |

## Audit Logs

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/audit-logs` | Audit Logs | `/audit-logs` | `ADMIN`, `AUDITOR` | `query` | `userId`, `action`, `entityType`, `entityId`, `from`, `to`, `limit`, `offset` | lista de eventos de auditoria | Filtros sensibles; no auto-refrescar agresivamente al inicio. |
| `GET` | `/api/audit-logs/:id` | Audit Logs | `/audit-logs/[id]` | `ADMIN`, `AUDITOR` | `query` | `id` | detalle con `beforeData`, `afterData`, `metadata` | Disenar lectura y trazabilidad, no accion. |

## Reports

| Metodo | Ruta | Modulo frontend | Pantalla que lo consume | Roles esperados | Tipo | Datos principales enviados | Datos principales recibidos | Observaciones de UI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/api/reports/stock` | Reports | `/reports/stock` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | rango de fechas si aplica o filtros del backend | reporte de stock | Cache por combinacion de filtros. |
| `GET` | `/api/reports/sales-by-channel` | Reports | `/reports/sales-by-channel` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `from`, `to`, `salesChannelId?` | agregados de ventas por canal | Mostrar estados vacios con claridad. |
| `GET` | `/api/reports/sales-by-product` | Reports | `/reports/sales-by-product` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `from`, `to`, `salesChannelId?`, `productId?` | agregados de ventas por producto | Cache ligada a filtros. |
| `GET` | `/api/reports/sales-by-user` | Reports | `/reports/sales-by-user` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `from`, `to`, `salesChannelId?`, `userId?` | agregados de ventas por usuario | Distinguir filtro por usuario del auditoria `userId`. |
| `GET` | `/api/reports/inventory-movements` | Reports | `/reports/inventory-movements` | `ADMIN`, `MANAGER`, `AUDITOR` | `query` | `from`, `to`, `productId?`, `movementType?`, `referenceType?`, `createdById?`, `limit?`, `offset?` | movimientos agregados o listados | Consulta pesada; evitar refetch innecesario. |

## Errores globales esperados

- `400 BadRequest`: mostrar validaciones de formulario o mensaje de entrada invalida.
- `401 Unauthorized`: limpiar sesion, token y cache sensible; redirigir a `/login`.
- `403 Forbidden`: mostrar pantalla o estado explicito de acceso denegado.
- `404 NotFound`: informar recurso inexistente o fuera de contexto operativo.
- `409 Conflict`: mostrar mensaje funcional no generico, por ejemplo conflicto de stock o estado.
- `500 InternalServerError`: mostrar error seguro, opcion de reintento y no exponer detalles internos.

## Reglas de cache sugeridas para TanStack Query

- `auth/me`: cache corta y revalidacion controlada tras login, logout o recovery de sesion.
- catalogo (`categories`, `sales-channels`, `products`): cache moderada e invalidacion en mutaciones.
- inventario: cache corta por naturaleza operativa.
- tickets y ventas: cache corta con invalidacion puntual sobre ticket y listas afectadas.
- reportes: cache por combinacion de filtros; no compartir resultados entre filtros distintos.
- audit logs: cache corta o sin auto-refresh inicial; priorizar consultas manuales filtradas.
