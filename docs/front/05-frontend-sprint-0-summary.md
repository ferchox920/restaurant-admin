# 05 - Frontend Sprint 0 Summary

## Resumen del Front Sprint 0

### Objetivo

Cerrar la documentacion funcional inicial del frontend administrativo del restaurante antes de iniciar el setup tecnico en Next.js.

### Documentos creados

- `README.md`
- `00-frontend-functional-scope.md`
- `01-routes-and-permissions.md`
- `02-ui-flows.md`
- `03-api-contract-map.md`
- `04-frontend-stack-decision.md`
- `05-frontend-sprint-0-summary.md`

### Decisiones funcionales tomadas

- El frontend administrativo operara el backend MVP sin depender de Swagger.
- La API backend es la fuente de verdad funcional y de autorizacion.
- Los permisos visibles en UI deben seguir los roles reales del backend.
- `ADMIN` gestiona usuarios y accede a todo el panel.
- `MANAGER` opera catalogo, costos, precios, inventario, ventas y reportes.
- `CASHIER` opera tickets y ventas, pero no accede a usuarios, auditoria ni `void`.
- `AUDITOR` consulta ventas, inventario, reportes y auditoria sin mutar datos.
- `/settings` queda solo como placeholder documental y no como modulo activo del MVP.

### Decisiones tecnicas tomadas

- El stack base sera `Next.js`, `TypeScript`, `App Router`, `Tailwind CSS`, `shadcn/ui`, `TanStack Query`, `React Hook Form` y `Zod`.
- El frontend consumira la API NestJS existente.
- El frontend no se conectara directo a PostgreSQL.
- La sesion inicial se manejara con JWT en `localStorage`.
- La sesion se recupera consultando `GET /api/auth/me`.
- Un `401` debe limpiar sesion y redirigir a `/login`.
- La mayoria de pantallas operativas del MVP seran `Client Components`.

### Stack elegido

- `Next.js`
- `TypeScript`
- `App Router`
- `Tailwind CSS`
- `shadcn/ui`
- `TanStack Query`
- `React Hook Form`
- `Zod`

### Alcance del frontend MVP

El MVP frontend debe cubrir:

- login interno;
- recuperacion y cierre de sesion;
- navegacion por rol;
- layout administrativo protegido;
- gestion de categorias;
- gestion de canales de venta;
- gestion de productos;
- costos historicos;
- precios por canal;
- inventario;
- tickets y ventas;
- reportes operativos;
- auditoria;
- gestion de usuarios para `ADMIN`.

### Fuera de alcance

Queda fuera del Front Sprint 0 y del MVP inicial:

- frontend publico;
- pagos;
- caja;
- facturacion fiscal;
- impresion;
- recetas;
- insumos;
- proveedores;
- compras;
- multi-sucursal;
- exportaciones;
- dashboard avanzado;
- realtime;
- PWA;
- mobile app.

## Definicion de MVP frontend terminado

El frontend MVP se considera terminado cuando un usuario puede:

1. iniciar sesion;
2. recuperar sesion al recargar;
3. cerrar sesion;
4. navegar segun su rol;
5. administrar categorias;
6. administrar canales;
7. administrar productos;
8. crear costos historicos;
9. crear precios por canal;
10. operar inventario;
11. crear tickets `DRAFT`;
12. agregar productos a tickets;
13. confirmar ventas;
14. ver descuento de stock;
15. anular ventas confirmadas;
16. ver reversion de stock;
17. consultar reportes;
18. consultar auditoria;
19. gestionar usuarios si es `ADMIN`;
20. hacer el flujo demo completo sin Swagger.

## Criterios globales por calidad

- El build pasa.
- Las variables de entorno estan documentadas.
- No hay secretos hardcodeados.
- La API URL viene de entorno.
- Las rutas protegidas funcionan.
- `401` se maneja correctamente.
- `403` se muestra claramente.
- Existen loading states visibles.
- Existen error states visibles.
- Existen empty states visibles.
- Los formularios validan datos.
- Las mutaciones refrescan datos.
- La navegacion por rol funciona.
- Existe responsive basico.
- `README.md` queda actualizado.

## Criterios de seguridad frontend

- No imprimir tokens en consola.
- No guardar contrasenas.
- No exponer `passwordHash`.
- No confiar en permisos solo por UI.
- El backend sigue siendo autoridad.
- Limpiar sesion ante `401`.
- No mostrar opciones peligrosas a roles no autorizados.

## Fuera de alcance general

- frontend publico;
- pagos;
- caja;
- facturacion fiscal;
- impresion;
- recetas;
- insumos;
- proveedores;
- compras;
- multi-sucursal;
- exportaciones;
- dashboard avanzado;
- realtime;
- PWA;
- mobile app.

## Proximos sprints frontend

- Front Sprint 1 - Setup Next.js base.
- Front Sprint 2 - Auth, sesion y cliente API.
- Front Sprint 3 - Layout administrativo y navegacion.
- Front Sprint 4 - Catalogo.
- Front Sprint 5 - Costos y precios.
- Front Sprint 6 - Inventario.
- Front Sprint 7 - Ventas y tickets.
- Front Sprint 8 - Reportes.
- Front Sprint 9 - Auditoria y usuarios.
- Front Sprint 10 - Pulido UX y deploy readiness.

## Cierre del Sprint 0

Front Sprint 0 cierra documentacion funcional del panel administrativo.

Queda confirmado que en este sprint:

- no se inicializo proyecto Next.js;
- no se instalaron dependencias;
- no se creo codigo de UI;
- no se modifico el backend.

El proximo sprint sera setup tecnico de Next.js.
