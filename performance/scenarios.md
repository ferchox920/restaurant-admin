# Escenarios de rendimiento

Ejecutar sobre un build de produccion y una API con datos sinteticos, nunca con
datos personales de produccion.

## Volumenes

- Pequeno: 100 productos, 10 mesas, 1.000 ventas y 5.000 movimientos.
- Medio: 500 productos, 50 mesas, 25.000 ventas y 100.000 movimientos.
- Alto: 2.000 productos, 50 mesas, 100.000 ventas y 500.000 movimientos.

## Flujos

1. Login y apertura de `/floor`.
2. Apertura de mesa, busqueda de producto, agregado y cambio de cantidad.
3. Apertura de ticket editable y de ticket confirmado en modo lectura.
4. Busqueda paginada de productos y reporte de stock.
5. Dos terminales modificando la misma orden para comprobar 409 y SSE.
6. Navegacion repetida durante 30 minutos para observar memoria y conexiones.

Registrar Web Vitals, solicitudes, bytes, heap, tiempo de API y `Server-Timing`.
Los eventos del navegador `restaurant:web-vital` y `restaurant:api-metric`
permiten conectarlos con el colector elegido sin acoplar la aplicacion a un
proveedor concreto.
