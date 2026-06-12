# 02 - UI Flows

## Flujo 1 - Login y recuperacion de sesion

**Objetivo**  
Permitir autenticacion interna, restaurar sesion tras recarga y cerrar sesion de forma segura.

**Usuario/rol principal**  
Todos los roles: `ADMIN`, `MANAGER`, `CASHIER`, `AUDITOR`.

**Ruta inicial**  
`/login`

**Pasos**

1. El usuario ingresa `email` y `password`.
2. El frontend envia credenciales a `POST /api/auth/login`.
3. Si el login es exitoso, guarda `accessToken` en `localStorage`.
4. El frontend consulta `GET /api/auth/me` para obtener el usuario autenticado.
5. Se hidrata el estado de sesion y se redirige a `/dashboard`.
6. Al recargar la app, el frontend lee el token de `localStorage`.
7. Si existe token, vuelve a consultar `GET /api/auth/me`.
8. Si el usuario ejecuta logout, se limpia token, sesion y cache sensible.
9. Si cualquier consulta autenticada responde `401`, se invalida sesion y se redirige a `/login`.

**Endpoints involucrados**

- `POST /api/auth/login`
- `GET /api/auth/me`

**Estados esperados**

- `idle`: formulario listo para ingreso.
- `submitting`: credenciales enviandose.
- `authenticated`: token persistido y usuario cargado.
- `restoring-session`: validacion de token al cargar o recargar.
- `logged-out`: sesion limpiada.
- `unauthorized`: token invalido o vencido.

**Errores esperados**

- `400`: credenciales mal formadas.
- `401`: email/password invalidos o token expirado.
- `500`: error inesperado del backend.

**Criterio de exito**

El usuario inicia sesion, llega a `/dashboard`, conserva sesion al recargar mientras el token sea valido y vuelve a `/login` si el backend responde `401`.

## Flujo 2 - Crear producto de catalogo

**Objetivo**  
Permitir alta de un producto administrativo y su posterior consulta en lista y detalle.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`.

**Ruta inicial**  
`/products`

**Pasos**

1. El usuario entra a la lista de productos.
2. El frontend consulta categorias para poblar el selector.
3. El usuario abre formulario de nuevo producto.
4. Completa `name`, `description?`, `sku?`, `categoryId?`, `unit`, `stockManagementType?`.
5. El frontend envia `POST /api/products`.
6. Si la creacion es exitosa, invalida lista y vuelve a consultar productos.
7. El producto nuevo aparece en la tabla.
8. El usuario entra al detalle y el frontend consulta `GET /api/products/:id`.

**Endpoints involucrados**

- `GET /api/categories`
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`

**Estados esperados**

- lista cargando;
- formulario listo;
- formulario enviando;
- creacion exitosa;
- lista invalidada y refrescada;
- detalle cargado.

**Errores esperados**

- `400`: payload invalido o campos obligatorios faltantes.
- `401`: sesion invalida.
- `403`: rol sin permiso de creacion.
- `404`: categoria o producto no encontrado.
- `409`: conflicto de negocio como SKU duplicado si el backend lo define.
- `500`: error inesperado.

**Criterio de exito**

El producto se crea, aparece en la lista y su detalle refleja los datos enviados sin requerir edicion manual posterior.

## Flujo 3 - Crear costo historico

**Objetivo**  
Registrar una nueva version de costo vigente para un producto sin modificar costos historicos previos.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`.

**Ruta inicial**  
`/products/[id]/costs`

**Pasos**

1. El usuario entra al detalle del producto.
2. El frontend consulta costo vigente.
3. El frontend consulta historial de costos.
4. El usuario abre formulario de nuevo costo.
5. Ingresa `cost`.
6. El frontend envia `POST /api/products/:id/costs`.
7. Se invalida el costo vigente y el historial.
8. La UI vuelve a consultar costo vigente e historial actualizado.
9. La interfaz deja explicito que el costo previo no fue editado sino versionado.

**Endpoints involucrados**

- `GET /api/products/:id/costs/current`
- `GET /api/products/:id/costs`
- `POST /api/products/:id/costs`

**Estados esperados**

- costo vigente cargando;
- historial cargando;
- formulario enviando;
- version nueva creada;
- historial refrescado.

**Errores esperados**

- `400`: costo invalido o menor a cero.
- `401`: sesion invalida.
- `403`: rol sin permiso.
- `404`: producto inexistente.
- `500`: error inesperado.

**Criterio de exito**

La UI muestra un nuevo costo vigente y el historial actualizado, manteniendo intacta la trazabilidad de versiones anteriores.

## Flujo 4 - Crear precio por canal

**Objetivo**  
Registrar un nuevo precio historico para un producto en un canal de venta determinado.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`.

**Ruta inicial**  
`/products/[id]/prices`

**Pasos**

1. El usuario entra al detalle de precios del producto.
2. El frontend consulta canales de venta disponibles.
3. El frontend consulta historial de precios del producto.
4. El usuario selecciona `salesChannelId`.
5. Ingresa `price`.
6. El frontend envia `POST /api/products/:id/prices`.
7. Se invalida historial y consulta de precio vigente para el canal afectado.
8. La UI vuelve a consultar `GET /api/products/:id/prices/current?channelId=<uuid>`.
9. La UI deja explicito que se crea una nueva version y no se edita la historia.

**Endpoints involucrados**

- `GET /api/sales-channels`
- `GET /api/products/:id/prices`
- `GET /api/products/:id/prices/current?channelId=<uuid>`
- `POST /api/products/:id/prices`

**Estados esperados**

- canales cargando;
- historial cargando;
- formulario enviando;
- precio vigente actualizado;
- historial refrescado.

**Errores esperados**

- `400`: precio invalido o canal faltante.
- `401`: sesion invalida.
- `403`: rol sin permiso.
- `404`: producto o canal inexistente.
- `500`: error inesperado.

**Criterio de exito**

La UI muestra el nuevo precio vigente para el canal seleccionado y conserva el historial completo de versiones previas.

## Flujo 5 - Cargar stock

**Objetivo**  
Registrar un ingreso operativo de stock y reflejarlo en stock actual y movimientos.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`.

**Ruta inicial**  
`/inventory`

**Pasos**

1. El usuario entra al inventario general.
2. El frontend consulta stock de productos.
3. El usuario selecciona un producto.
4. El frontend consulta el detalle de inventario del producto.
5. El usuario abre accion `stock-in`.
6. Ingresa `quantity` y `reason`.
7. El frontend envia `POST /api/inventory/products/:productId/stock-in`.
8. Se invalida el stock general, el detalle del producto y la lista de movimientos.
9. La UI muestra stock actualizado y el movimiento nuevo.

**Endpoints involucrados**

- `GET /api/inventory`
- `GET /api/inventory/products/:productId`
- `POST /api/inventory/products/:productId/stock-in`
- `GET /api/inventory/products/:productId/movements`

**Estados esperados**

- listado cargando;
- detalle cargando;
- formulario enviando;
- stock actualizado;
- movimiento visible.

**Errores esperados**

- `400`: cantidad o motivo invalidos.
- `401`: sesion invalida.
- `403`: rol sin permiso de mutacion.
- `404`: producto no encontrado.
- `500`: error inesperado.

**Criterio de exito**

El stock se incrementa y la UI refleja tanto el nuevo saldo como el movimiento operativo generado.

## Flujo 6 - Registrar merma

**Objetivo**  
Registrar una merma de inventario con trazabilidad operativa.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`.

**Ruta inicial**  
`/inventory/[productId]`

**Pasos**

1. El usuario entra al detalle de inventario del producto.
2. El frontend muestra stock actual.
3. El usuario abre accion `waste`.
4. Ingresa `quantity` y `reason`.
5. El frontend envia `POST /api/inventory/products/:productId/waste`.
6. Se invalida el detalle del stock y los movimientos del producto.
7. La UI muestra el stock descontado.
8. La lista de movimientos incorpora un registro `WASTE`.

**Endpoints involucrados**

- `POST /api/inventory/products/:productId/waste`
- `GET /api/inventory/products/:productId`
- `GET /api/inventory/products/:productId/movements`

**Estados esperados**

- detalle listo;
- formulario enviando;
- stock refrescado;
- movimiento `WASTE` visible.

**Errores esperados**

- `400`: cantidad o motivo invalidos.
- `401`: sesion invalida.
- `403`: rol sin permiso.
- `404`: producto inexistente.
- `409`: conflicto de negocio si la operacion no puede aplicarse.
- `500`: error inesperado.

**Criterio de exito**

La merma queda registrada, el stock disminuye y la UI expone el movimiento `WASTE` correspondiente.

## Flujo 7 - Crear y confirmar venta

**Objetivo**  
Permitir crear un ticket `DRAFT`, cargar items y confirmarlo como venta operativa.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`, `CASHIER`.

**Ruta inicial**  
`/sales/new`

**Pasos**

1. El usuario inicia un nuevo ticket.
2. El frontend envia `POST /api/sales/tickets` con `salesChannelId` y `notes?`.
3. La UI navega al detalle del ticket `DRAFT`.
4. El usuario agrega productos con `productId` y `quantity`.
5. El frontend envia `POST /api/sales/tickets/:ticketId/items`.
6. Si hace falta, ajusta cantidades con `PATCH /api/sales/tickets/:ticketId/items/:itemId`.
7. La UI refresca el ticket y muestra items cargados.
8. El usuario confirma el ticket.
9. El frontend envia `POST /api/sales/tickets/:ticketId/confirm`.
10. La UI vuelve a consultar `GET /api/sales/tickets/:ticketId`.
11. La UI muestra estado `CONFIRMED`.
12. Si el producto maneja stock, puede consultarse `GET /api/inventory/products/:productId` para reflejar el descuento.

**Endpoints involucrados**

- `POST /api/sales/tickets`
- `POST /api/sales/tickets/:ticketId/items`
- `PATCH /api/sales/tickets/:ticketId/items/:itemId`
- `POST /api/sales/tickets/:ticketId/confirm`
- `GET /api/sales/tickets/:ticketId`
- `GET /api/inventory/products/:productId`

**Estados esperados**

- ticket `DRAFT` creado;
- items agregados;
- ticket actualizable mientras siga en borrador;
- confirmacion enviandose;
- ticket `CONFIRMED`;
- stock descontado;
- movimiento `SALE_OUT` visible en inventario o reportes.

**Errores esperados**

- `400`: canal faltante, item invalido o cantidad invalida.
- `401`: sesion invalida.
- `403`: rol sin permiso.
- `404`: ticket, producto o canal inexistente.
- `409`: conflicto de negocio, por ejemplo stock insuficiente o estado invalido.
- `500`: error inesperado.

**Criterio de exito**

El ticket pasa de `DRAFT` a `CONFIRMED`, conserva sus items y queda reflejado el descuento de stock donde corresponda.

## Flujo 8 - Anular venta confirmada

**Objetivo**  
Permitir anular una venta ya confirmada con trazabilidad y reversion de stock.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`.

**Ruta inicial**  
`/sales/[ticketId]`

**Pasos**

1. El usuario abre un ticket en estado `CONFIRMED`.
2. La UI habilita accion `void` solo para roles permitidos.
3. El usuario ingresa `reason`.
4. El frontend envia `POST /api/sales/tickets/:ticketId/void`.
5. Se invalida el detalle del ticket.
6. La UI vuelve a consultar el ticket.
7. El ticket se muestra en estado `VOIDED`.
8. El stock del producto se considera revertido.
9. La UI o las pantallas relacionadas deben poder reflejar un movimiento `VOID_REVERSAL`.

**Endpoints involucrados**

- `GET /api/sales/tickets/:ticketId`
- `POST /api/sales/tickets/:ticketId/void`
- `GET /api/inventory/products/:productId`
- `GET /api/inventory/products/:productId/movements`

**Estados esperados**

- ticket `CONFIRMED`;
- modal o formulario de anulacion;
- anulacion enviada;
- ticket `VOIDED`;
- stock revertido;
- movimiento `VOID_REVERSAL` visible.

**Errores esperados**

- `400`: motivo invalido.
- `401`: sesion invalida.
- `403`: rol no autorizado.
- `404`: ticket inexistente.
- `409`: ticket no anulable por estado o restriccion operativa.
- `500`: error inesperado.

**Criterio de exito**

La venta queda anulada con motivo registrado, el ticket cambia a `VOIDED` y la reversion de stock puede auditarse visualmente.

## Flujo 9 - Consultar reportes

**Objetivo**  
Permitir consulta operativa de reportes filtrables del MVP.

**Usuario/rol principal**  
`ADMIN`, `MANAGER`, `AUDITOR`.

**Ruta inicial**  
`/reports`

**Pasos**

1. El usuario entra al hub de reportes.
2. La UI ofrece filtros por rango de fechas.
3. Segun el reporte, la UI puede ofrecer filtros adicionales como `salesChannelId`, `productId` o `userId`.
4. El usuario ejecuta consulta de ventas por canal.
5. El usuario ejecuta consulta de ventas por producto.
6. El usuario ejecuta consulta de ventas por usuario.
7. El usuario ejecuta consulta de movimientos de inventario.
8. La UI renderiza tablas, totales o agregados segun la respuesta.

**Endpoints involucrados**

- `GET /api/reports/sales-by-channel`
- `GET /api/reports/sales-by-product`
- `GET /api/reports/sales-by-user`
- `GET /api/reports/inventory-movements`

**Estados esperados**

- filtros listos;
- consulta cargando;
- resultados cargados;
- estado vacio si no hay datos;
- error recuperable con reintento.

**Errores esperados**

- `400`: rango de fechas o filtros invalidos.
- `401`: sesion invalida.
- `403`: rol sin permiso.
- `500`: error inesperado.

**Criterio de exito**

El usuario consulta reportes con filtros y obtiene resultados consistentes sin salir del modulo.

## Flujo 10 - Consultar auditoria

**Objetivo**  
Permitir revisar trazabilidad operativa y detalle de eventos auditados.

**Usuario/rol principal**  
`ADMIN`, `AUDITOR`.

**Ruta inicial**  
`/audit-logs`

**Pasos**

1. El usuario entra a la lista de auditoria.
2. La UI ofrece filtros por `userId`, `action`, `entityType`, `entityId`, `from`, `to`, `limit`, `offset`.
3. El frontend consulta `GET /api/audit-logs`.
4. El usuario revisa la lista resultante.
5. Abre un log especifico.
6. El frontend consulta `GET /api/audit-logs/:id`.
7. La UI muestra detalle del evento con `beforeData`, `afterData` y `metadata`.

**Endpoints involucrados**

- `GET /api/audit-logs`
- `GET /api/audit-logs/:id`

**Estados esperados**

- filtros listos;
- tabla cargando;
- resultados disponibles;
- detalle cargando;
- detalle listo.

**Errores esperados**

- `400`: filtros invalidos.
- `401`: sesion invalida.
- `403`: rol no autorizado.
- `404`: log inexistente.
- `500`: error inesperado.

**Criterio de exito**

El usuario puede filtrar eventos, abrir un registro concreto y entender que cambio, quien lo hizo y cuando ocurrio.
