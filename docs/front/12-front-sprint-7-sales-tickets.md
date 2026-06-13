# 12 - Front Sprint 7 Sales Tickets

## Objetivo

Implementar el flujo completo de tickets y ventas desde UI.

Sprint 7 deja ventas y tickets funcionales desde UI sobre el contrato
provisional documentado en `docs/front`. No se encontro Swagger, OpenAPI ni
DTOs backend verificables en este workspace, por lo que la API real sigue siendo
la fuente de verdad final y cualquier desvio futuro debera ajustarse en la capa
`features/sales`.

## Rutas

- `/sales`
- `/sales/new`
- `/sales/[ticketId]`

## Endpoints consumidos

- `GET /api/sales/tickets`
- `POST /api/sales/tickets`
- `GET /api/sales/tickets/:ticketId`
- `PATCH /api/sales/tickets/:ticketId`
- `POST /api/sales/tickets/:ticketId/cancel`
- `POST /api/sales/tickets/:ticketId/items`
- `PATCH /api/sales/tickets/:ticketId/items/:itemId`
- `DELETE /api/sales/tickets/:ticketId/items/:itemId`
- `POST /api/sales/tickets/:ticketId/confirm`
- `POST /api/sales/tickets/:ticketId/void`

## Funcionalidades implementadas

- listado de tickets;
- filtros por estado, canal, creador y rango de fechas;
- creacion de `DRAFT`;
- seleccion de canal;
- edicion de notas y canal en borrador;
- agregar productos;
- modificar cantidades;
- eliminar items;
- cancelar `DRAFT`;
- confirmar venta;
- visualizacion de snapshots;
- `void` con motivo obligatorio;
- invalidacion de inventario en confirm y void.

## Estados del ticket

### DRAFT

- Es un borrador.
- No descuenta stock.
- Permite agregar, modificar y retirar items.
- Permite actualizar los campos admitidos.
- Puede cancelarse.
- Puede confirmarse cuando cumple las condiciones backend.

### CONFIRMED

- Representa una venta confirmada.
- No puede editarse.
- Descuenta stock mediante `SALE_OUT`.
- Conserva snapshots de cada linea.
- Puede anularse unicamente por roles autorizados.

### CANCELLED

- Es un borrador cancelado.
- No descuenta stock.
- No puede editarse.
- No equivale a una venta anulada.

### VOIDED

- Fue una venta confirmada y posteriormente anulada.
- Conserva los movimientos `SALE_OUT`.
- Genera movimientos `VOID_REVERSAL`.
- No puede editarse.

## Diferencia entre cancelar y anular

### Cancelar

- aplica a `DRAFT`;
- no revierte stock porque nunca lo desconto;
- representa cierre operativo de un borrador sin venta confirmada.

### Void / anular

- aplica a `CONFIRMED`;
- exige motivo;
- revierte stock mediante movimientos automaticos;
- no elimina ni reescribe los movimientos originales de venta.

## Snapshots

La UI debe mostrar los snapshots historicos del ticket:

- `productNameSnapshot`;
- `productSkuSnapshot`;
- `productUnitSnapshot`;
- `unitPriceSnapshot`;
- `unitCostSnapshot` si el rol puede verlo.

Reglas:

- no reemplazar snapshots por datos actuales del producto;
- no recalcular tickets historicos con precios actuales;
- no recalcular tickets historicos con costos actuales;
- el nombre actual del producto puede diferir del snapshot;
- en el ticket siempre manda el snapshot.

## Totales

- El backend es la fuente de verdad para `subtotal` y `total`.
- El frontend usa los totales devueltos por la API y no calcula totales
  definitivos client-side.
- No calcular margen en este sprint.

## Roles

### ADMIN y MANAGER

- crean y editan `DRAFT`;
- cancelan `DRAFT`;
- confirman;
- ejecutan `void`;
- consultan todos los estados.

### CASHIER

- crea y edita `DRAFT`;
- cancela `DRAFT`;
- confirma;
- no ejecuta `void`.

### AUDITOR

- solo lectura;
- no ve acciones de mutacion.

## Rutas

- `/sales`
- `/sales/new`
- `/sales/[ticketId]`

## Politica de UI

- La UI debe distinguir acciones permitidas por estado y por rol.
- Las reglas visuales no sustituyen la autorizacion del backend.
- El detalle debe mostrar historial consistente aunque producto, canal, precio o
  costo actuales hayan cambiado.
- `NON_STOCKED` puede formar parte de una venta sin movimientos de stock.
- `RECIPE_BASED` queda fuera del MVP operativo mientras backend no lo habilite.
- No incluir pagos ni caja en Sprint 7.

## Reglas respetadas

- `DRAFT` no descuenta stock;
- `CONFIRMED` genera `SALE_OUT`;
- `VOIDED` genera `VOID_REVERSAL`;
- `CANCELLED` no revierte stock;
- snapshots historicos;
- backend controla totales;
- backend controla stock;
- no editar estados terminales;
- no eliminar tickets;
- no crear movimientos manuales de venta.

## No implementado

- pagos;
- caja;
- facturacion fiscal;
- reembolsos;
- anulaciones parciales;
- devoluciones parciales;
- impresion;
- reportes reales;
- auditoria UI;
- usuarios UI;
- `/settings`.

## Validacion manual sugerida

Si hay backend y credenciales disponibles:

1. Crear un `DRAFT`.
2. Agregar un producto.
3. Agregar el mismo producto otra vez y observar consolidacion.
4. Modificar cantidad.
5. Eliminar item.
6. Cancelar un `DRAFT`.
7. Crear otro `DRAFT`.
8. Confirmar con stock suficiente.
9. Verificar estado `CONFIRMED`.
10. Verificar stock descontado.
11. Verificar movimiento `SALE_OUT`.
12. Intentar confirmar sin stock.
13. Ejecutar void con `ADMIN` o `MANAGER`.
14. Verificar estado `VOIDED`.
15. Verificar stock restituido.
16. Verificar movimiento `VOID_REVERSAL`.
17. Verificar que `CASHIER` no vea void.
18. Verificar lectura con `AUDITOR`.
19. Verificar que snapshots no cambien aunque cambie el producto actual.

Si no hay backend o credenciales:

- documentar la limitacion sin bloquear el cierre del sprint.
