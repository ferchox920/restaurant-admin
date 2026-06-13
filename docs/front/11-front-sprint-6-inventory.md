# 11 - Front Sprint 6 Inventory

## Objetivo

Implementar consulta y operacion de inventario de productos finalizados.

## Modelo funcional

El modulo distingue dos conceptos:

- `ProductStock`: proyeccion del stock actual para lectura rapida.
- `InventoryMovement`: historial auditable que explica como cambio el stock.

El frontend no debe presentar ambos conceptos como si fueran lo mismo.

## Operaciones manuales

### Stock In

- suma cantidad al stock actual;
- crea movimiento `STOCK_IN`.

### Manual Adjustment

- fija el stock a un nuevo valor absoluto;
- no debe describirse como “sumar ajuste”;
- crea movimiento `MANUAL_ADJUSTMENT`.

### Waste

- resta stock;
- requiere cantidad valida;
- no puede dejar stock negativo;
- crea movimiento `WASTE`.

### Return In

- suma stock devuelto;
- crea movimiento `RETURN_IN`.

### Minimum Stock

- actualiza el umbral minimo;
- no cambia stock;
- no crea movimiento.

## Movimientos no manuales

No crear acciones UI para:

- `SALE_OUT`
- `VOID_REVERSAL`

Estos movimientos los genera el backend a partir del flujo de ventas.

## Tipos de producto

### FINISHED_PRODUCT

- inventariable;
- puede operar stock.

### NON_STOCKED

- no inventariable;
- mostrar estado `No controlado`.

### RECIPE_BASED

- reservado para una fase futura;
- mostrar estado `No disponible en el MVP`.

## Contrato real

### Lecturas

- `GET /api/inventory`
  devuelve `InventoryStockResponseDto[]`;
  soporta `active`, `stockStatus` y `search`;
  no tiene paginacion.
- `GET /api/inventory/products/:productId`
  devuelve `InventoryStockResponseDto`;
  si no existe `ProductStock`, responde stock `0`.
- `GET /api/inventory/movements`
  devuelve `InventoryMovementResponseDto[]`;
  soporta `productId`, `movementType`, `from` y `to`;
  no tiene paginacion.
- `GET /api/inventory/products/:productId/movements`
  devuelve `InventoryMovementResponseDto[]`;
  soporta `movementType`, `from` y `to`.

### Cantidades

- las respuestas de inventario llegan como string decimal;
- los formularios del frontend deben preservar texto decimal;
- la conversion a `number` ocurre solo en la frontera API;
- no realizar calculos definitivos de stock en frontend.

### Payloads

- `POST /stock-in`: `quantity`, `reason`
- `POST /adjust`: `newStock`, `reason`
- `POST /waste`: `quantity`, `reason`
- `POST /return-in`: `quantity`, `reason`
- `PATCH /minimum-stock`: `minimumStock`

### Campos reales

#### Stock

- `productId`
- `productName`
- `productSku`
- `unit`
- `stockManagementType`
- `currentStock`
- `minimumStock`
- `stockStatus`
- `updatedAt`

#### Movimiento

- `id`
- `productId`
- `productName`
- `movementType`
- `quantity`
- `previousStock`
- `newStock`
- `reason`
- `referenceType`
- `referenceId`
- `createdById`
- `createdAt`

## Roles

### ADMIN y MANAGER

- consultan stock;
- consultan movimientos;
- operan inventario;
- actualizan minimo.

### CASHIER

- consulta stock;
- no consulta movimientos;
- no ve acciones de mutacion.

### AUDITOR

- consulta stock;
- consulta movimientos;
- no ve acciones de mutacion.

## Rutas

- `/inventory`
- `/inventory/[productId]`
- resumen en `/products/[id]`

## Funcionalidades implementadas

- stock actual;
- stock minimo;
- estados visuales;
- stock-in;
- ajuste manual;
- merma;
- reingreso;
- actualizacion de minimo;
- historial de movimientos;
- resumen en producto.

## Politica historica

- los movimientos no se editan;
- los movimientos no se eliminan;
- `SALE_OUT` y `VOID_REVERSAL` se representan como movimientos automaticos;
- `referenceId` se muestra de forma discreta;
- no se crean enlaces a tickets desde inventario en Sprint 6.

## Endpoints consumidos

- `GET /api/inventory`
- `GET /api/inventory/products/:productId`
- `GET /api/inventory/movements`
- `GET /api/inventory/products/:productId/movements`
- `POST /api/inventory/products/:productId/stock-in`
- `POST /api/inventory/products/:productId/adjust`
- `POST /api/inventory/products/:productId/waste`
- `POST /api/inventory/products/:productId/return-in`
- `PATCH /api/inventory/products/:productId/minimum-stock`

## Reglas respetadas

- solo `FINISHED_PRODUCT` opera inventario;
- no se permite stock negativo;
- ajuste manual fija valor absoluto;
- `minimumStock` no cambia stock actual;
- `ProductStock` representa estado actual;
- `InventoryMovement` representa historial;
- `SALE_OUT` y `VOID_REVERSAL` no se crean manualmente;
- `CASHIER` consulta stock sin movimientos restringidos;
- `AUDITOR` consulta stock y movimientos sin operaciones.

## Limitaciones actuales

- el historial no pagina porque el endpoint actual no pagina;
- no se simula total server-side;
- `createdById` se muestra tal cual, sin resolver nombre;
- no hay enlace a tickets desde `referenceId`.

## Criterios de aceptacion

- listado de stock funcional;
- busqueda y filtros;
- detalle por producto;
- historial de movimientos;
- permisos correctos;
- productos no inventariables bloqueados;
- stock insuficiente representable como conflicto de negocio;
- build y lint pasando.

## Validacion manual sugerida

Si hay backend y credenciales disponibles:

1. Consultar inventario general.
2. Abrir un producto sin `ProductStock` materializado.
3. Registrar `stock-in`.
4. Registrar una merma valida.
5. Intentar una merma mayor al stock.
6. Registrar un ajuste manual.
7. Registrar un reingreso.
8. Actualizar stock minimo.
9. Verificar historial de movimientos.
10. Verificar que `CASHIER` no vea operaciones.
11. Verificar que `CASHIER` no cargue movimientos restringidos.
12. Verificar lectura con `AUDITOR`.
13. Verificar producto `NON_STOCKED`.
14. Verificar producto `RECIPE_BASED`.

Si no hay backend o credenciales, documentar la limitacion sin bloquear cierre.
