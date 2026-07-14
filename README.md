# Restaurant Admin Frontend

Frontend administrativo del MVP del restaurante construido sobre `Next.js`.

## Stack

- `Next.js`
- `TypeScript`
- `App Router`
- `Tailwind CSS`
- `shadcn/ui`
- `TanStack Query`
- `React Hook Form`
- `Zod`

## Instalacion

```bash
npm install
```

## Variables de entorno

Variables publicas iniciales:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`

Ejemplo de `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Restaurant Admin
```

Politica actual:

- no se guardan secretos en el frontend;
- no deben agregarse tokens, credenciales ni `DATABASE_URL`;
- no deben agregarse `JWT_SECRET` ni secretos equivalentes;
- `NEXT_PUBLIC_API_URL` usa fallback a `http://localhost:3000`;
- `NEXT_PUBLIC_APP_NAME` usa fallback a `Restaurant Admin`.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:run
```

La aplicacion de desarrollo corre por defecto en
[http://localhost:3000](http://localhost:3000).

## Estado actual

- Sprint 1 dejo lista la base tecnica del frontend.
- Sprint 2 dejo autenticacion real, sesion, cliente API y proteccion de rutas
  privadas.
- Sprint 3 dejo listo el layout administrativo, la navegacion por rol y los
  placeholders privados de modulos.
- Sprint 4 dejo catalogo funcional para categorias, canales de venta,
  productos y detalle basico de producto.
- Sprint 5 dejo costos historicos y precios por canal funcionales desde UI.
- Sprint 6 dejo inventario funcional de producto finalizado desde UI.
- Sprint 7 dejo tickets y ventas funcionales desde UI.
- Sprint 8 dejo reportes operativos funcionales desde UI.
- Sprint 9 dejo usuarios y auditoria funcionales desde UI.
- Sprint 10 cerro consistencia UX, accesibilidad basica, tests minimos y
  readiness documental para deploy.
- Sprint 11 agrego capa de mesas y salon para operar ordenes de consumo.
- `shadcn/ui` y TanStack Query ya estan integrados a nivel global.

## Capa de mesas y salon

Sprint 11 implementa:

- `/tables`;
- `/floor`;
- `/table-orders`;
- `/table-orders/[id]`;
- administracion de mesas para `ADMIN` y `MANAGER`;
- vista operativa de salon para `ADMIN`, `MANAGER`, `CASHIER` y `AUDITOR`;
- apertura de orden en mesa disponible;
- consumos progresivos sin descuento de stock hasta cierre;
- modificacion y quita de consumos;
- cancelacion de orden abierta sin afectar stock;
- cierre de orden con `CASH` o `TRANSFER`;
- invalidacion de mesas, ordenes, tickets, inventario y reportes cuando aplica.

No implementa pagos completos, caja, facturacion fiscal, impresion, propinas,
division de cuenta, reservas, cambio de mesa ni realtime.

## Front Sprint 10 - Cierre MVP

Sprint 10 dejo cerrado el MVP frontend con:

- normalizacion transversal de UX y estados de feedback;
- accesibilidad basica y navegacion por teclado;
- suite minima automatizada con `Vitest` y RTL para logica critica;
- flujo demo manual documentado;
- deploy readiness inicial orientada a `Vercel`;
- limitaciones conocidas y riesgos aceptados documentados.

## Front Sprint 9 - Usuarios y auditoria

Sprint 9 implemento:

- `/users`;
- `/users/[id]`;
- `/audit-logs`;
- `/audit-logs/[id]`;
- listado real de usuarios;
- alta de usuarios;
- detalle y actualizacion de datos basicos;
- desactivacion y reactivacion;
- listado real de audit logs;
- filtros reales con URL search params;
- paginacion por `limit` y `offset` sin `total` inventado;
- visualizacion segura de `beforeData`, `afterData` y `metadata`;
- diff visual representacional cuando la forma de datos lo permite;
- selector de usuarios limitado a `ADMIN`;
- permisos visuales por rol para `ADMIN` y `AUDITOR` segun contrato backend;
- estados de loading, empty, forbidden, 404, 409 y error de conexion.

### Endpoints consumidos

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/deactivate`
- `PATCH /api/users/:id/reactivate`
- `GET /api/audit-logs`
- `GET /api/audit-logs/:id`

### Roles

- `ADMIN` gestiona usuarios y lee auditoria.
- `AUDITOR` solo lee auditoria.
- `MANAGER` y `CASHIER` no acceden a users ni audit logs.

### Reglas respetadas

- `GET /api/users` no se usa fuera de `ADMIN`;
- `/users` aplica filtros locales porque backend no expone filtros reales;
- auditoria usa array simple, no envelope paginado;
- audit logs no incluyen `actor` embebido, solo `userId`;
- el frontend nunca muestra `passwordHash`;
- el frontend aplica sanitizacion defensiva adicional sobre claves sensibles;
- el detalle de auditoria no usa HTML inseguro ni permite edicion de JSON;
- no se agregan mutaciones de auditoria;
- reportes de `MANAGER` y `AUDITOR` mantienen UUID manual donde no hay permiso de lookup.

## Front Sprint 8 - Reportes operativos

Sprint 8 implemento:

- `/reports`;
- `/reports/stock`;
- `/reports/sales-by-channel`;
- `/reports/sales-by-product`;
- `/reports/sales-by-user`;
- `/reports/inventory-movements`;
- hub de reportes con alcance funcional;
- filtros reales por contrato backend;
- snapshots historicos en ventas por producto;
- atribucion por usuario confirmador en ventas por usuario;
- paginacion server-side real por `limit`, `offset` y `total` en movimientos;
- permisos visuales por rol para `ADMIN`, `MANAGER` y `AUDITOR`;
- estados de loading, empty, forbidden y error de conexion.

### Endpoints consumidos

- `GET /api/reports/stock`
- `GET /api/reports/sales-by-channel`
- `GET /api/reports/sales-by-product`
- `GET /api/reports/sales-by-user`
- `GET /api/reports/inventory-movements`

### Roles

- `ADMIN`, `MANAGER` y `AUDITOR` acceden a reportes.
- `CASHIER` queda fuera de `/reports` y subrutas.

### Reglas respetadas

- ventas usa `CONFIRMED` por defecto;
- el frontend no expone filtro `status` en reportes de ventas;
- la API sigue siendo la fuente de verdad para agregaciones, costos y margenes;
- los snapshots no se reemplazan por catalogo actual;
- montos y cantidades agregadas se preservan como `string`;
- movimientos usa envelope real de backend y no paginacion local simulada.

## Front Sprint 7 - Ventas y tickets

Sprint 7 implemento:

- `/sales`;
- `/sales/new`;
- `/sales/[ticketId]`;
- listado de tickets;
- filtros operativos;
- creacion de `DRAFT`;
- seleccion de canal;
- agregar productos;
- modificar cantidad;
- eliminar item;
- cancelacion de borrador;
- confirmacion de venta;
- snapshots historicos;
- void de ventas confirmadas;
- invalidacion de inventario en confirm y void;
- permisos visuales por rol para `ADMIN`, `MANAGER`, `AUDITOR` y `CASHIER`;
- estados de loading, empty, forbidden, conflicto y error de conexion.

### Endpoints consumidos

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

### Roles

- `ADMIN` y `MANAGER` tienen operacion completa.
- `CASHIER` crea y edita `DRAFT`, cancela y confirma, sin acceso a `void`.
- `AUDITOR` queda en solo lectura.

### Reglas respetadas

- `DRAFT` no descuenta stock;
- `CONFIRMED` genera `SALE_OUT`;
- `VOIDED` genera `VOID_REVERSAL`;
- `CANCELLED` no revierte stock;
- los snapshots historicos no se reemplazan por datos actuales;
- el backend controla stock y totales;
- no se editan estados terminales;
- no se crean movimientos manuales de venta.

## Front Sprint 6 - Inventario de producto finalizado

Sprint 6 implemento:

- `/inventory`;
- `/inventory/[productId]`;
- resumen operativo de inventario en `/products/[id]`;
- stock actual y stock minimo;
- estados visuales;
- stock-in;
- ajuste manual;
- merma;
- reingreso;
- actualizacion de stock minimo;
- historial de movimientos;
- permisos visuales por rol para `ADMIN`, `MANAGER`, `AUDITOR` y `CASHIER`;
- estados de loading, empty, forbidden, conflicto y error de conexion.

### Endpoints consumidos

- `GET /api/inventory`
- `GET /api/inventory/products/:productId`
- `GET /api/inventory/movements`
- `GET /api/inventory/products/:productId/movements`
- `POST /api/inventory/products/:productId/stock-in`
- `POST /api/inventory/products/:productId/adjust`
- `POST /api/inventory/products/:productId/waste`
- `POST /api/inventory/products/:productId/return-in`
- `PATCH /api/inventory/products/:productId/minimum-stock`

### Roles

- `ADMIN` y `MANAGER` consultan stock, movimientos y operan inventario.
- `AUDITOR` consulta stock y movimientos.
- `CASHIER` consulta stock sin operaciones ni movimientos restringidos.

### Reglas respetadas

- solo `FINISHED_PRODUCT` opera inventario;
- no se permite stock negativo;
- ajuste manual fija valor absoluto;
- `minimumStock` no cambia stock actual;
- movimientos no se editan ni se eliminan;
- `SALE_OUT` y `VOID_REVERSAL` no se crean manualmente;
- los decimales se preservan en lectura y formularios.

## Front Sprint 5 - Costos historicos y precios por canal

Sprint 5 implemento:

- resumen real en `/products/[id]`;
- costo vigente por producto;
- historial de costos;
- nueva version de costo;
- selector de canal;
- precio vigente por canal;
- historial de precios por canal;
- nueva version de precio;
- permisos visuales por rol para `ADMIN`, `MANAGER`, `AUDITOR` y `CASHIER`;
- estados de loading, empty, forbidden, conflicto y error de conexion.

### Rutas implementadas

- `/products/[id]`
- `/products/[id]/costs`
- `/products/[id]/prices`

### Endpoints consumidos

#### Costos

- `GET /api/products/:id/costs`
- `GET /api/products/:id/costs/current`
- `POST /api/products/:id/costs`

#### Precios

- `GET /api/products/:id/prices`
- `GET /api/products/:id/prices/current?channelId=...`
- `POST /api/products/:id/prices`

### Roles

- `ADMIN` y `MANAGER` consultan y crean nuevas versiones.
- `AUDITOR` consulta producto, costos, precios e historiales.
- `CASHIER` no accede a productos administrativos ni a costos/precios.

### Reglas respetadas

- no se edita la historia;
- no se borran versiones;
- no se envian `validFrom` ni `validTo`;
- los decimales se preservan en tipos y formularios;
- los tickets historicos no se recalculan;
- un producto puede no tener costo o precio vigente.

## No implementado todavia

- recuperacion de contrasena;
- cambio de contrasena;
- 2FA;
- pagos;
- caja;
- `/settings`.

## Documentacion

La documentacion funcional y tecnica del frontend vive en `docs/front`.

Documentos de cierre MVP:

- `docs/front/15-front-sprint-10-mvp-readiness.md`
- `docs/front/16-frontend-test-plan.md`
- `docs/front/17-frontend-demo-flow.md`
- `docs/front/18-frontend-deploy-readiness.md`
- `docs/front/19-frontend-known-limitations.md`
