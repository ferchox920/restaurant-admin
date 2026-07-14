# Front Sprint 11 - Mesas y salon

## Objetivo

Implementar la capa frontend de mesas, salon y ordenes de consumo sobre el
backend validado. La UI permite administrar mesas, operar ordenes abiertas,
cargar consumos progresivos, cancelar ordenes y cerrarlas con el dato minimo de
metodo de pago requerido por la API.

## Rutas

- `/tables`: administracion de mesas.
- `/floor`: vista operativa de salon.
- `/table-orders`: listado e historial de ordenes.
- `/table-orders/[id]`: detalle operativo y lectura historica.

## Endpoints consumidos

### Mesas

- `GET /api/tables?active=true&area=Salon&search=M01`
- `POST /api/tables`
- `GET /api/tables/:id`
- `PATCH /api/tables/:id`
- `PATCH /api/tables/:id/deactivate`
- `PATCH /api/tables/:id/reactivate`

### Ordenes de mesa

- `POST /api/tables/:tableId/orders/open`
- `GET /api/tables/:tableId/orders/current`
- `GET /api/table-orders`
- `GET /api/table-orders/:id`
- `POST /api/table-orders/:id/items`
- `PATCH /api/table-orders/:id/items/:itemId`
- `DELETE /api/table-orders/:id/items/:itemId`
- `POST /api/table-orders/:id/cancel`
- `POST /api/table-orders/:id/close`

## Roles

- `ADMIN`: administra mesas, opera ordenes y consulta historico.
- `MANAGER`: administra mesas, opera ordenes y consulta historico.
- `CASHIER`: opera ordenes y consulta salon/historico, sin administrar mesas.
- `AUDITOR`: consulta salon y ordenes en solo lectura.

## Reglas respetadas

- Una orden `OPEN` no descuenta stock.
- El cierre confirma la venta en backend.
- El cierre descuenta stock y genera el movimiento operativo correspondiente.
- La cancelacion no descuenta stock.
- La mesa se libera al cancelar o cerrar una orden.
- Los snapshots de producto, precio, costo y subtotal vienen del backend.
- El frontend no envia precios, costos, snapshots, estados ni timestamps.
- El stock insuficiente no cierra la orden; el detalle queda en `OPEN`.
- `TRANSFER` requiere `paymentBankId`.
- `CASH` limpia y no envia `paymentBankId`.
- `RECIPE_BASED` queda excluido de la seleccion de consumos.

## Cache

- Mesas: listas y detalle.
- Orden actual por mesa.
- Listado de ordenes.
- Detalle de orden.
- Al cerrar orden se invalidan tambien tickets de venta, inventario y reportes.

## Limitaciones

- Sin pagos completos.
- Sin caja.
- Sin facturacion fiscal.
- Sin impresion.
- Sin reembolsos.
- Sin propinas.
- Sin division de cuenta.
- Sin reservas.
- Sin cambio de mesa.
- Sin realtime ni polling automatico.

## Validacion manual

Flujo esperado con backend y credenciales:

1. Login como `ADMIN`.
2. Crear mesa `M01` en `/tables`.
3. Ver `M01` disponible en `/floor`.
4. Abrir orden con un canal activo.
5. Ver `M01` ocupada.
6. Agregar producto `FINISHED_PRODUCT` o `NON_STOCKED`.
7. Confirmar que stock no cambia durante la orden abierta.
8. Modificar cantidad.
9. Quitar y volver a agregar consumo.
10. Cancelar orden y verificar mesa disponible.
11. Abrir nueva orden.
12. Agregar consumo.
13. Cerrar con `CASH`.
14. Ver orden `CLOSED`.
15. Ver ticket confirmado.
16. Ver stock descontado y movimiento `SALE_OUT`.
17. Probar stock insuficiente y verificar que la orden queda `OPEN`.
18. Login como `CASHIER` y operar orden sin administrar mesas.
19. Confirmar que `CASHIER` no accede a `/tables`.
20. Login como `AUDITOR` y verificar lectura sin mutaciones.

Si no hay backend o credenciales disponibles, la validacion queda limitada a
build, lint, tests y revision estatica de rutas/permisos.
