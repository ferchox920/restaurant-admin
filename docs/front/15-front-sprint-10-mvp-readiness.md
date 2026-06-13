# Front Sprint 10 - MVP Readiness

## Objetivo

Cerrar el frontend administrativo como MVP demostrable, consistente y preparado
para despliegue sin agregar nuevos modulos de negocio.

## Definicion de MVP frontend terminado

El MVP frontend se considera cerrado cuando un usuario autorizado puede:

1. iniciar sesion;
2. recuperar sesion;
3. cerrar sesion;
4. navegar segun rol;
5. administrar catalogo;
6. crear costos y precios historicos;
7. operar inventario;
8. crear y confirmar ventas;
9. anular ventas confirmadas;
10. consultar reportes;
11. gestionar usuarios;
12. consultar auditoria;
13. completar el flujo demo sin depender de Swagger.

## Politica de calidad

Cada modulo debe ofrecer:

- loading state;
- error state;
- empty state;
- forbidden state cuando aplica;
- not found cuando aplica;
- feedback de mutacion;
- formularios validados;
- acciones criticas confirmadas;
- navegacion consistente;
- permisos visuales correctos.

## Accesibilidad basica

El cierre MVP exige como minimo:

- labels asociados a inputs;
- navegacion por teclado;
- foco visible;
- botones con texto o `aria-label`;
- dialogos con titulo y descripcion;
- tablas con encabezados;
- contraste razonable;
- mensajes de error comprensibles;
- no depender solo del color para comunicar estado.

## Responsive basico

La interfaz debe mantenerse funcional en:

- desktop;
- tablet;
- mobile.

No se exige una UI mobile especializada para punto de venta, pero ninguna vista
administrativa debe romper layout o perder acciones principales.

## Seguridad frontend

Reglas aceptadas para este MVP:

- no guardar passwords;
- no imprimir tokens;
- no exponer secretos;
- no confiar solo en permisos visuales;
- limpiar sesion en `401`;
- mantener sesion en `403`;
- sanitizar auditoria;
- no exponer variables privadas mediante `NEXT_PUBLIC_*`.

Decision de MVP:

- el `accessToken` permanece en `localStorage` como compromiso consciente del
  MVP actual;
- esta decision queda documentada como riesgo aceptado y no como hardening
  definitivo.

## Fuera de alcance

Siguen fuera de alcance:

- pagos;
- caja;
- facturacion fiscal;
- recetas;
- insumos;
- proveedores;
- compras;
- multi-sucursal;
- exportaciones Excel/PDF;
- dashboard grafico avanzado;
- realtime;
- PWA;
- aplicacion movil;
- `/settings`;
- nuevos modulos de negocio.

## Criterios de aceptacion

El sprint se considera cerrado cuando:

- `npm run build` pasa;
- `npm run lint` pasa;
- `npm run test` pasa;
- no hay secretos en el frontend;
- la documentacion esta actualizada;
- el flujo demo esta documentado;
- la deploy readiness esta documentada;
- no se agregaron modulos nuevos.

## Suite minima automatizada

La base de cierre incluye una suite automatizada pequena y focalizada sobre:

- auth y sesion;
- permisos por rol y guards;
- query params y retry policy;
- formatters y schemas criticos;
- sanitizacion de auditoria;
- componentes criticos de permiso y estados.

La suite no reemplaza validacion integrada manual ni una estrategia E2E futura.

## Flujo demo recomendado

1. Iniciar sesion con un usuario autorizado.
2. Validar recuperacion de sesion tras recarga.
3. Navegar segun rol.
4. Crear o editar catalogo.
5. Crear una nueva version de costo.
6. Crear una nueva version de precio por canal.
7. Operar inventario de un producto final.
8. Crear un borrador de venta.
9. Agregar items y confirmar venta.
10. Anular una venta confirmada con rol habilitado.
11. Consultar reportes.
12. Gestionar usuarios.
13. Consultar auditoria.

## Deploy readiness

Checklist minimo antes de desplegar:

- definir `NEXT_PUBLIC_API_URL` del entorno destino;
- verificar que no existan secretos en `.env` publicos;
- validar build de produccion;
- validar lint;
- ejecutar smoke tests;
- confirmar que backend y frontend usan el mismo contrato de API;
- revisar roles de demo disponibles;
- documentar URL de acceso y credenciales de entorno no productivo fuera del repo.

## Documentos complementarios

- `16-frontend-test-plan.md`
- `17-frontend-demo-flow.md`
- `18-frontend-deploy-readiness.md`
- `19-frontend-known-limitations.md`
