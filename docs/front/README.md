# Front Documentation

## Proposito

Esta carpeta contiene la documentacion funcional y tecnica del frontend
administrativo de restaurante. Sprint 0 definio el alcance funcional, Sprint 1
dejo creada la base tecnica inicial en Next.js, Sprint 2 implemento auth,
sesion y cliente API, y Sprint 3 agrego layout administrativo, navegacion por
rol, placeholders privados y estados visuales reutilizables.

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

El frontend administrativo se construira sobre el contrato publico ya expuesto
por el backend MVP. Eso implica:

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

Con `07-front-sprint-2-auth-session.md`, el Front Sprint 2 queda documentado a
nivel tecnico y funcional para el alcance de autenticacion y sesion.
Con `08-front-sprint-3-layout-navigation.md`, el Front Sprint 3 queda
documentado para layout administrativo, navegacion por rol, placeholders y
feedback visual basico.
Con `09-front-sprint-4-catalog.md`, el Front Sprint 4 queda documentado para
catalogo funcional, detalle basico de producto, permisos visuales y estados de
feedback del modulo.

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
producto. La carpeta sigue siendo la fuente de referencia documental del
frontend.

El Sprint 0 no incluyo:

- inicializacion de proyecto Next.js;
- instalacion de dependencias;
- componentes UI;
- pantallas reales;
- consumo de API;
- logica de negocio frontend.
