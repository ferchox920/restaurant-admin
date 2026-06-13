# 13 - Front Sprint 8 Operational Reports

## Objetivo

Exponer desde UI los reportes operativos del backend sin recalcular
agregaciones criticas en el frontend.

## Estado final de rutas

- `/reports`: hub operativo con cinco accesos y notice de alcance.
- `/reports/stock`: stock actual con resumen visible, `NOT_TRACKED` y acceso a
  inventario solo si el rol lo permite.
- `/reports/sales-by-channel`: ventas confirmadas por canal con resumen visual
  sobre la respuesta visible.
- `/reports/sales-by-product`: snapshots historicos por producto sin sustituir
  labels por catalogo actual.
- `/reports/sales-by-user`: ventas confirmadas por usuario confirmador, con
  bucket `Sin usuario confirmador`.
- `/reports/inventory-movements`: movimientos paginados usando `limit`,
  `offset` y `total` reales del backend.

## Fuente de verdad

- La API calcula los reportes operativos.
- El frontend presenta, filtra y pagina usando solo parametros admitidos.
- El frontend no reconstruye reportes desde tickets descargados.
- El frontend no recalcula costos historicos.
- El frontend no sustituye snapshots por datos actuales.
- Los montos y cantidades agregados devueltos por la API son la fuente de
  verdad.

## Politica de ventas

- `CONFIRMED` representa ventas activas para reportes.
- `DRAFT` no cuenta como venta.
- `CANCELLED` no cuenta como venta.
- `VOIDED` no cuenta como venta activa por defecto.
- La UI no expone filtro `status` para reportes de ventas porque el backend no
  lo soporta hoy.
- Ventas por usuario se atribuyen al usuario que confirmo la venta
  (`confirmedById`), no necesariamente al creador.

## Endpoints y contratos reales

### Stock

Endpoint:

- `GET /api/reports/stock`

Response:

- array de `StockReportItem`

Campos:

- `productId`
- `productName`
- `productSku`
- `categoryId`
- `categoryName`
- `unit`
- `stockManagementType`
- `active`
- `currentStock`
- `minimumStock`
- `stockStatus`
- `updatedAt`

Filtros:

- `active`
- `categoryId`
- `stockStatus`
- `stockManagementType`
- `search`

Reglas:

- orden por nombre ascendente;
- `currentStock` y `minimumStock` se entregan como `string`;
- si no existe `ProductStock`, backend devuelve `"0"`;
- `NON_STOCKED` y `RECIPE_BASED` se representan con `stockStatus =
  NOT_TRACKED`.

### Ventas por canal

Endpoint:

- `GET /api/reports/sales-by-channel`

Response:

- array de `SalesByChannelReportItem`

Campos:

- `salesChannelId`
- `salesChannelName`
- `salesChannelCode`
- `ticketsCount`
- `itemsCount`
- `quantitySold`
- `grossSales`
- `historicalCost`
- `grossProfit`
- `averageTicket`

Filtros:

- `from`
- `to`
- `salesChannelId`

Reglas:

- usa solo tickets `CONFIRMED`;
- usa snapshots historicos;
- orden final por `ticketsCount` descendente;
- decimales agregados se entregan como `string`.

### Ventas por producto

Endpoint:

- `GET /api/reports/sales-by-product`

Response:

- array de `SalesByProductReportItem`

Campos:

- `productId`
- `productNameSnapshot`
- `productSkuSnapshot`
- `productUnitSnapshot`
- `quantitySold`
- `grossSales`
- `historicalCost`
- `grossProfit`
- `ticketsCount`

Filtros:

- `from`
- `to`
- `salesChannelId`
- `productId`

Reglas:

- usa solo tickets `CONFIRMED`;
- usa snapshots historicos de producto, SKU, unidad, precio y costo;
- conserva el snapshot mas reciente por `confirmedAt` para presentar el grupo;
- no devuelve `itemsCount`.

### Ventas por usuario

Endpoint:

- `GET /api/reports/sales-by-user`

Response:

- array de `SalesByUserReportItem`

Campos:

- `userId`
- `userEmail`
- `userFullName`
- `ticketsCount`
- `itemsCount`
- `quantitySold`
- `grossSales`
- `historicalCost`
- `grossProfit`

Filtros:

- `from`
- `to`
- `salesChannelId`
- `userId`

Reglas:

- usa solo tickets `CONFIRMED`;
- agrupa por usuario confirmador;
- puede existir bucket sin usuario confirmador, con campos `null`;
- la UI debe etiquetarlo como `Sin usuario confirmador`.

### Movimientos de inventario

Endpoint:

- `GET /api/reports/inventory-movements`

Response:

- envelope paginado:
  - `items`
  - `limit`
  - `offset`
  - `total`

Campos por item:

- `movementId`
- `productId`
- `productName`
- `productSku`
- `movementType`
- `quantity`
- `previousStock`
- `newStock`
- `reason`
- `referenceType`
- `referenceId`
- `createdById`
- `createdByEmail`
- `createdByName`
- `createdAt`

Filtros:

- `productId`
- `movementType`
- `referenceType`
- `createdById`
- `from`
- `to`
- `limit`
- `offset`

Reglas:

- orden por `createdAt` descendente;
- `limit` default backend `50`;
- `offset` default backend `0`;
- `limit` maximo backend `100`;
- `quantity`, `previousStock` y `newStock` se entregan como `string`.

## Fechas y precision

- El backend espera fechas como ISO datetime.
- La UI convierte `from` a inicio del dia local y `to` a fin del dia local,
  luego serializa a ISO.
- La UI no aplica transformaciones adicionales de timezone.
- La UI formatea montos y cantidades solo para lectura.
- La UI no convierte montos agregados a `number` para persistencia o calculo
  contable.
- En movimientos, el estado de filtros y paginacion se refleja en URL search
  params para permitir recarga y comparticion de vistas.
- Search params invalidos de `limit` y `offset` se normalizan a `50` y `0`.
- Fechas invalidas en URL bloquean el request hasta corregir el rango.

## Roles

- `ADMIN`: acceso completo.
- `MANAGER`: acceso completo.
- `AUDITOR`: lectura completa.
- `CASHIER`: sin acceso a reportes generales.

## Politica de UI implementada

- Ventas por usuario muestra atribucion por confirmador y no por creador.
- Ventas por usuario no consulta `/api/users/:id` ni hace N+1 por fila.
- Ventas por producto conserva texto snapshot aun cuando ofrece acceso
  secundario al producto actual.
- Movimientos no enlaza tickets porque `referenceId` no se trata todavia como
  `ticketId` garantizado por contrato.
- Los summary cards de ventas solo resumen la respuesta visible y no
  recalculan metricas contables.

## Fuera de alcance

- Excel.
- PDF.
- graficos avanzados.
- dashboard financiero.
- impuestos.
- caja.
- pagos.
- conciliacion.
- contabilidad.
- reportes fiscales.
- comparacion entre sucursales.

## Criterios de aceptacion

- hub de reportes funcional;
- cinco reportes implementados;
- filtros reales;
- paginacion real en movimientos;
- montos y cantidades preservados como `string`;
- snapshots respetados;
- permisos correctos;
- loading, error y empty states;
- URL search params en movimientos;
- `build` y `lint` pasando.
