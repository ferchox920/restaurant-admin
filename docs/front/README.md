# Front Documentation

## Proposito

Esta carpeta contiene la documentacion funcional y tecnica del frontend
administrativo de restaurante. Sprint 0 definio el alcance funcional, Sprint 1
dejo creada la base tecnica inicial en Next.js, Sprint 2 implemento auth,
sesion y cliente API, Sprint 3 agrego layout administrativo y Sprint 4 dejo el
catalogo funcional. Sprint 5 agrego costos historicos y precios por canal
desde UI. Sprint 6 agrego inventario de producto finalizado desde UI. Sprint 7
agrego tickets y ventas desde UI. Sprint 8 agrego reportes operativos desde UI.

La documentacion frontend no reemplaza la especificacion del backend. La API
`restaurant-admin-api` es la fuente de verdad funcional, de autorizacion y de
reglas operativas del MVP.

## Stack definido

- `Next.js`
- `TypeScript`
- `App Router`
- `Tailwind CSS`
- `shadcn/ui`
- `TanStack Query`
- `React Hook Form`
- `Zod`

## Fuente de verdad

El frontend administrativo se construye sobre el contrato publico del backend
MVP. Eso implica:

- la API define permisos reales por rol;
- la API valida autenticacion y autorizacion;
- la API resuelve costos, precios, stock, snapshots y trazabilidad historica;
- la UI solo representa y opera capacidades ya disponibles en backend.

Si existe discrepancia entre esta documentacion y la API, prevalece la API.

## Documentos

- [00-frontend-functional-scope.md](00-frontend-functional-scope.md)
- [01-routes-and-permissions.md](01-routes-and-permissions.md)
- [02-ui-flows.md](02-ui-flows.md)
- [03-api-contract-map.md](03-api-contract-map.md)
- [04-frontend-stack-decision.md](04-frontend-stack-decision.md)
- [05-frontend-sprint-0-summary.md](05-frontend-sprint-0-summary.md)
- [06-front-sprint-1-technical-foundation.md](06-front-sprint-1-technical-foundation.md)
- [07-front-sprint-2-auth-session.md](07-front-sprint-2-auth-session.md)
- [08-front-sprint-3-layout-navigation.md](08-front-sprint-3-layout-navigation.md)
- [09-front-sprint-4-catalog.md](09-front-sprint-4-catalog.md)
- [10-front-sprint-5-costs-prices.md](10-front-sprint-5-costs-prices.md)
- [11-front-sprint-6-inventory.md](11-front-sprint-6-inventory.md)
- [12-front-sprint-7-sales-tickets.md](12-front-sprint-7-sales-tickets.md)
- [13-front-sprint-8-operational-reports.md](13-front-sprint-8-operational-reports.md)
- [14-front-sprint-9-users-audit.md](14-front-sprint-9-users-audit.md)
- [15-front-sprint-10-mvp-readiness.md](15-front-sprint-10-mvp-readiness.md)
- [16-frontend-test-plan.md](16-frontend-test-plan.md)
- [17-frontend-demo-flow.md](17-frontend-demo-flow.md)
- [18-frontend-deploy-readiness.md](18-frontend-deploy-readiness.md)
- [19-frontend-known-limitations.md](19-frontend-known-limitations.md)

Con `09-front-sprint-4-catalog.md`, el Front Sprint 4 queda documentado para
catalogo funcional, detalle basico de producto, permisos visuales y estados de
feedback del modulo.
Con `10-front-sprint-5-costs-prices.md`, el Front Sprint 5 queda documentado
para costos historicos, precios por canal, resumen en detalle de producto,
permisos y reglas de precision decimal.
Con `11-front-sprint-6-inventory.md`, el Front Sprint 6 queda documentado para
inventario funcional, detalle por producto, historial, operaciones manuales y
resumen en producto.
Con `12-front-sprint-7-sales-tickets.md`, el Front Sprint 7 queda documentado
para tickets, ventas, snapshots historicos, acciones criticas e integracion con
inventario.
Con `13-front-sprint-8-operational-reports.md`, el Front Sprint 8 queda
documentado para reportes operativos, filtros reales, paginacion server-side y
politica de agregaciones de backend.
Con `14-front-sprint-9-users-audit.md`, el Front Sprint 9 queda documentado
para gestion de usuarios, auditoria general, selector seguro por permisos,
detalle seguro de audit log y sanitizacion defensiva de datos auditados.
Con `15-front-sprint-10-mvp-readiness.md`, el Front Sprint 10 deja documentada
la politica de cierre del MVP, criterios de calidad transversales, accesibilidad
basica, seguridad frontend aceptada y checklist de deploy readiness.
Con `16-frontend-test-plan.md`, el cierre deja documentada la suite minima real,
su alcance y sus limites conscientes.
Con `17-frontend-demo-flow.md`, el cierre deja documentado el flujo manual de
demo para `ADMIN`, `CASHIER` y `AUDITOR`.
Con `18-frontend-deploy-readiness.md`, el cierre deja documentada la estrategia
inicial de deploy sobre `Vercel`, sus requisitos y su checklist post-deploy.
Con `19-frontend-known-limitations.md`, el cierre deja explicitos los riesgos
aceptados y los limites conocidos del MVP frontend.

## Alcance del frontend MVP

El frontend MVP administrativo debe cubrir:

- login interno;
- dashboard administrativo;
- layout protegido por sesion;
- catalogo administrativo;
- costos historicos por producto;
- precios historicos por producto y canal;
- inventario de producto finalizado;
- tickets y ventas;
- reportes operativos;
- auditoria;
- gestion de usuarios.

## Fuera de alcance general

Queda fuera de este frontend MVP:

- frontend publico para clientes;
- landing page comercial;
- pagos;
- caja;
- facturacion fiscal;
- impresion termica;
- recetas;
- insumos;
- proveedores;
- compras;
- multi-sucursal;
- exportacion Excel/PDF;
- dashboard grafico avanzado;
- integraciones automaticas con marketplaces;
- notificaciones en tiempo real;
- modo offline;
- PWA;
- app mobile;
- recuperacion de contrasena;
- 2FA;
- i18n completa.

## Criterio de evolucion

Sprint 0 preparo documentacion funcional. Sprint 1 agrego setup tecnico base.
Sprint 2 agrego autenticacion real, sesion, cliente API y proteccion inicial de
rutas privadas. Sprint 3 agrego AppShell privado, navegacion por rol,
placeholders, guard visual por ruta y feedback reutilizable. Sprint 4 agrego
catalogo funcional para categorias, canales, productos y detalle basico de
producto. Sprint 5 agrego costos historicos y precios historicos por canal
desde UI. Sprint 6 agrego inventario de producto finalizado. Sprint 7 agrego
ventas y tickets operativos. Sprint 8 agrego reportes operativos. Sprint 9
agrego usuarios y auditoria desde UI. Sprint 10 cerro el MVP frontend con
consistencia UX, accesibilidad basica, suite minima de tests, flujo demo
documentado y deploy readiness inicial. La carpeta sigue siendo la fuente de
referencia documental del frontend.
