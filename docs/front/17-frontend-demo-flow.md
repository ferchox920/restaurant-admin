# Front Sprint 10.10 - Frontend Demo Flow

## Preparacion

Antes de la demo:

- levantar backend del MVP con auth y rutas `/api` disponibles;
- levantar frontend con `npm run dev` o build de entorno;
- definir `NEXT_PUBLIC_API_URL`;
- usar usuarios seed con placeholders de credenciales;
- contar con catalogo demo, stock demo y al menos una venta confirmable.

Variables esperadas:

- `NEXT_PUBLIC_API_URL=https://api.example.com`
- `NEXT_PUBLIC_APP_NAME=Restaurant Admin`

No incluir credenciales reales en repo, docs ni capturas.

## Flujo ADMIN

1. Ruta: `/login`
   Accion: iniciar sesion como `ADMIN`.
   Resultado esperado: acceso a `/dashboard`.
   Posibles errores: `401`, backend no alcanzable, `NEXT_PUBLIC_API_URL` invalida.
2. Ruta: `/dashboard`
   Accion: revisar modulos visibles.
   Resultado esperado: acceso a catalogo, inventario, ventas, reportes, users y auditoria.
3. Ruta: `/categories`
   Accion: crear categoria demo.
   Resultado esperado: nueva fila visible y feedback de exito.
4. Ruta: `/sales-channels`
   Accion: crear canal demo.
   Resultado esperado: canal visible y operativo.
5. Ruta: `/products`
   Accion: crear producto demo.
   Resultado esperado: producto visible en listado.
6. Ruta: `/products/[id]/costs`
   Accion: crear costo vigente.
   Resultado esperado: nuevo costo en historial y resumen vigente.
7. Ruta: `/products/[id]/prices`
   Accion: crear precio vigente por canal.
   Resultado esperado: precio visible para el canal elegido.
8. Ruta: `/inventory/[productId]`
   Accion: cargar stock inicial.
   Resultado esperado: stock actual y movimiento reflejados.
9. Ruta: `/sales/new`
   Accion: crear ticket `DRAFT`.
   Resultado esperado: redireccion a detalle del ticket.
10. Ruta: `/sales/[ticketId]`
    Accion: agregar producto al ticket.
    Resultado esperado: item visible con subtotal correcto.
11. Ruta: `/sales/[ticketId]`
    Accion: confirmar venta.
    Resultado esperado: estado `CONFIRMED` y mensaje de exito.
12. Ruta: `/inventory/[productId]`
    Accion: revisar stock post venta.
    Resultado esperado: stock descontado y movimiento `SALE_OUT`.
13. Ruta: `/reports/*`
    Accion: consultar un reporte operativo.
    Resultado esperado: datos reales o empty state consistente.
14. Ruta: `/audit-logs`
    Accion: revisar auditoria.
    Resultado esperado: eventos visibles sin datos sensibles expuestos.
15. Ruta: `/users`
    Accion: crear usuario demo.
    Resultado esperado: usuario visible y rol asignado.
16. Ruta: `/sales/[ticketId]`
    Accion: anular venta confirmada.
    Resultado esperado: estado `VOIDED`.
17. Ruta: `/inventory/[productId]`
    Accion: revisar reversion.
    Resultado esperado: movimiento `VOID_REVERSAL` y stock restituido.

## Flujo CASHIER

1. Ruta: `/login`
   Accion: iniciar sesion como `CASHIER`.
   Resultado esperado: acceso al panel con menu limitado.
2. Ruta: `/dashboard`
   Accion: revisar navegacion.
   Resultado esperado: sin acceso a reportes restringidos, users ni audit logs.
3. Ruta: `/sales/new`
   Accion: crear ticket.
   Resultado esperado: ticket `DRAFT` editable.
4. Ruta: `/sales/[ticketId]`
   Accion: confirmar venta.
   Resultado esperado: venta confirmada.
5. Ruta: `/sales/[ticketId]`
   Accion: revisar acciones criticas.
   Resultado esperado: ausencia de accion `void`.
6. Ruta: modulo restringido
   Accion: abrir URL restringida manualmente.
   Resultado esperado: redireccion o `forbidden` consistente.

## Flujo AUDITOR

1. Ruta: `/login`
   Accion: iniciar sesion como `AUDITOR`.
   Resultado esperado: acceso de solo lectura.
2. Ruta: `/sales`
   Accion: consultar tickets.
   Resultado esperado: detalle historico visible sin mutaciones.
3. Ruta: `/reports`
   Accion: consultar reportes.
   Resultado esperado: acceso permitido.
4. Ruta: `/audit-logs`
   Accion: consultar auditoria.
   Resultado esperado: logs y detalle visibles.
5. Ruta: modulo con mutaciones
   Accion: revisar pagina o detalle.
   Resultado esperado: ausencia de botones de mutacion.

## Cierre esperado

La demo queda aprobada si:

- login, navegacion y logout funcionan;
- los roles muestran capacidades coherentes;
- ventas afectan inventario segun estado;
- reportes y auditoria leen datos reales;
- no se exponen secretos, tokens ni credenciales reales.
