# 00 - Frontend Functional Scope

## Objetivo del frontend

El frontend administrativo permitira operar visualmente el backend MVP del restaurante sin depender de Swagger para las tareas diarias. Su rol es exponer una interfaz interna consistente para autenticacion, navegacion por rol y operacion administrativa sobre los modulos ya implementados en la API.

El frontend no redefine reglas del negocio. Solo debe reflejar lo que el backend ya permite para cada rol y cada recurso.

## Usuarios objetivo

### ADMIN

- administra todo el sistema;
- gestiona usuarios;
- gestiona catalogo;
- gestiona inventario;
- gestiona ventas;
- consulta reportes;
- consulta auditoria.

### MANAGER

- gestiona la operacion diaria;
- administra catalogo;
- administra costos historicos y precios por canal porque la API actual lo permite;
- opera inventario;
- consulta reportes;
- crea, confirma y anula ventas confirmadas segun permisos actuales del backend;
- no gestiona usuarios;
- no accede a auditoria general en el backend actual.

### CASHIER

- crea tickets;
- agrega y modifica productos en tickets `DRAFT`;
- cancela tickets en borrador;
- confirma ventas;
- consulta informacion operativa limitada;
- puede ver catalogo operativo e inventario general de lectura;
- no accede a reportes generales;
- no accede a auditoria;
- no gestiona usuarios;
- no administra costos historicos;
- no puede hacer `void` de ventas confirmadas.

### AUDITOR

- consulta reportes;
- consulta auditoria;
- consulta ventas;
- consulta stock y movimientos de inventario;
- consulta datos operativos en modo lectura;
- no modifica datos.

## Modulos del frontend MVP

1. Auth/Login.
2. Dashboard.
3. Layout administrativo.
4. Categorias.
5. Canales de venta.
6. Productos.
7. Costos historicos.
8. Precios por canal.
9. Inventario.
10. Tickets/Ventas.
11. Reportes.
12. Auditoria.
13. Usuarios.

## Alcance funcional esperado

El frontend MVP debe permitir:

- iniciar sesion;
- navegar segun rol;
- administrar catalogo;
- administrar costos historicos;
- administrar precios por canal;
- operar inventario;
- crear tickets;
- confirmar ventas;
- anular ventas confirmadas;
- consultar reportes;
- consultar auditoria;
- gestionar usuarios.

## Fuera de alcance del frontend MVP

Queda explicitamente fuera:

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
- integracion automatica con PedidosYa/Uber Eats;
- notificaciones en tiempo real;
- modo offline;
- PWA;
- app mobile;
- recuperacion de contrasena;
- 2FA;
- i18n completa.

## Principios funcionales

- El frontend no reemplaza validaciones criticas del backend.
- La API decide permisos reales.
- La UI puede ocultar acciones por rol, pero no es fuente de autorizacion.
- No se deben recalcular ventas historicas con precios o costos vigentes.
- Los tickets deben mostrar snapshots historicos.
- Costo y precio no se editan destructivamente; se crean nuevas versiones.
- Confirmar una venta descuenta stock porque la API lo hace.
- Anular una venta confirmada revierte stock porque la API lo hace.
- Auditoria es solo lectura desde UI.

## Notas de consistencia con el backend actual

- `MANAGER` tiene capacidad efectiva para crear costos y precios historicos en la API actual.
- `CASHIER` puede cancelar tickets en borrador, pero no anular ventas ya confirmadas.
- `AUDITOR` puede consultar ventas, stock, movimientos, reportes y auditoria, pero no muta recursos.
- La gestion de usuarios queda reservada a `ADMIN`.
- La auditoria general queda reservada a `ADMIN` y `AUDITOR`.
