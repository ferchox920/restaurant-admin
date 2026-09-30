# Matriz de consumidores HTTP

Fuente: OpenAPI ejecutado del backend e25b7e1 y controladores/DTO de ese clon. El JSON adyacente conserva parámetros, cuerpos, respuestas y campos de todos los schemas. Esta matriz estática no sustituye las pruebas full-stack.

| Consumidor                                         | Método | Ruta                                          | Roles efectivos                  | OpenAPI  |
| -------------------------------------------------- | ------ | --------------------------------------------- | -------------------------------- | -------- |
| features/audit/api/audit-logs.api.ts               | GET    | /api/audit-logs                               | ADMIN, AUDITOR                   | presente |
| features/audit/api/audit-logs.api.ts               | GET    | /api/audit-logs/{param}                       | ADMIN, AUDITOR                   | presente |
| features/auth/api/auth.api.ts                      | POST   | /api/auth/login                               | public                           | presente |
| features/auth/api/auth.api.ts                      | GET    | /api/auth/me                                  | JWT / ver guard                  | presente |
| features/auth/api/auth.api.ts                      | POST   | /api/auth/logout                              | JWT / ver guard                  | presente |
| features/categories/api/categories.api.ts          | GET    | /api/categories                               | ADMIN, MANAGER, AUDITOR, CASHIER | presente |
| features/categories/api/categories.api.ts          | POST   | /api/categories                               | ADMIN, MANAGER                   | presente |
| features/categories/api/categories.api.ts          | PATCH  | /api/categories/{param}                       | ADMIN, MANAGER                   | presente |
| features/categories/api/categories.api.ts          | PATCH  | /api/categories/{param}/deactivate            | ADMIN, MANAGER                   | presente |
| features/categories/api/categories.api.ts          | PATCH  | /api/categories/{param}/reactivate            | ADMIN, MANAGER                   | presente |
| features/inventory/api/inventory.api.ts            | GET    | /api/inventory                                | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/inventory/api/inventory.api.ts            | GET    | /api/inventory/products/{param}               | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/inventory/api/inventory.api.ts            | GET    | /api/inventory/products/{param}/movements     | ADMIN, MANAGER, AUDITOR          | presente |
| features/inventory/api/inventory.api.ts            | POST   | /api/inventory/products/{param}/stock-in      | ADMIN, MANAGER                   | presente |
| features/inventory/api/inventory.api.ts            | POST   | /api/inventory/products/{param}/adjust        | ADMIN, MANAGER                   | presente |
| features/inventory/api/inventory.api.ts            | POST   | /api/inventory/products/{param}/waste         | ADMIN, MANAGER                   | presente |
| features/inventory/api/inventory.api.ts            | POST   | /api/inventory/products/{param}/return-in     | ADMIN, MANAGER                   | presente |
| features/inventory/api/inventory.api.ts            | PATCH  | /api/inventory/products/{param}/minimum-stock | ADMIN, MANAGER                   | presente |
| features/payment-banks/api/payment-banks.api.ts    | GET    | /api/payment-banks                            | ADMIN, MANAGER, AUDITOR, CASHIER | presente |
| features/payment-banks/api/payment-banks.api.ts    | POST   | /api/payment-banks                            | ADMIN, MANAGER                   | presente |
| features/payment-banks/api/payment-banks.api.ts    | PATCH  | /api/payment-banks/{param}                    | ADMIN, MANAGER                   | presente |
| features/payment-banks/api/payment-banks.api.ts    | PATCH  | /api/payment-banks/{param}/deactivate         | ADMIN, MANAGER                   | presente |
| features/payment-banks/api/payment-banks.api.ts    | PATCH  | /api/payment-banks/{param}/reactivate         | ADMIN, MANAGER                   | presente |
| features/pos/api/pos-catalog.api.ts                | GET    | /api/pos/catalog                              | ADMIN, MANAGER, CASHIER          | presente |
| features/products/api/products.api.ts              | GET    | /api/products                                 | ADMIN, MANAGER, AUDITOR, CASHIER | presente |
| features/products/api/products.api.ts              | GET    | /api/products/{param}                         | ADMIN, MANAGER, AUDITOR, CASHIER | presente |
| features/products/api/products.api.ts              | POST   | /api/products                                 | ADMIN, MANAGER                   | presente |
| features/products/api/products.api.ts              | PATCH  | /api/products/{param}                         | ADMIN, MANAGER                   | presente |
| features/products/api/products.api.ts              | PATCH  | /api/products/{param}/deactivate              | ADMIN, MANAGER                   | presente |
| features/products/api/products.api.ts              | PATCH  | /api/products/{param}/reactivate              | ADMIN, MANAGER                   | presente |
| features/products/costs/api/product-costs.api.ts   | GET    | /api/products/{param}/costs                   | ADMIN, MANAGER, AUDITOR          | presente |
| features/products/costs/api/product-costs.api.ts   | GET    | /api/products/{param}/costs/current           | ADMIN, MANAGER, AUDITOR          | presente |
| features/products/costs/api/product-costs.api.ts   | POST   | /api/products/{param}/costs                   | ADMIN, MANAGER                   | presente |
| features/products/prices/api/product-prices.api.ts | GET    | /api/products/{param}/prices                  | ADMIN, MANAGER, AUDITOR          | presente |
| features/products/prices/api/product-prices.api.ts | GET    | /api/products/{param}/prices/current          | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/products/prices/api/product-prices.api.ts | POST   | /api/products/{param}/prices                  | ADMIN, MANAGER                   | presente |
| features/reports/api/reports.api.ts                | GET    | /api/reports/stock                            | ADMIN, MANAGER, AUDITOR          | presente |
| features/reports/api/reports.api.ts                | GET    | /api/reports/sales-by-channel                 | ADMIN, MANAGER, AUDITOR          | presente |
| features/reports/api/reports.api.ts                | GET    | /api/reports/sales-by-product                 | ADMIN, MANAGER, AUDITOR          | presente |
| features/reports/api/reports.api.ts                | GET    | /api/reports/sales-by-user                    | ADMIN, MANAGER, AUDITOR          | presente |
| features/reports/api/reports.api.ts                | GET    | /api/reports/inventory-movements              | ADMIN, MANAGER, AUDITOR          | presente |
| features/sales/api/sale-ticket-items.api.ts        | POST   | /api/sales/tickets/{param}/items              | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sale-ticket-items.api.ts        | PATCH  | /api/sales/tickets/{param}/items/{param}      | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sale-ticket-items.api.ts        | DELETE | /api/sales/tickets/{param}/items/{param}      | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sales.api.ts                    | GET    | /api/sales/tickets                            | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/sales/api/sales.api.ts                    | GET    | /api/sales/tickets/{param}                    | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/sales/api/sales.api.ts                    | POST   | /api/sales/tickets                            | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sales.api.ts                    | PATCH  | /api/sales/tickets/{param}                    | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sales.api.ts                    | POST   | /api/sales/tickets/{param}/cancel             | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sales.api.ts                    | POST   | /api/sales/tickets/{param}/confirm            | ADMIN, MANAGER, CASHIER          | presente |
| features/sales/api/sales.api.ts                    | POST   | /api/sales/tickets/{param}/void               | ADMIN, MANAGER                   | presente |
| features/sales-channels/api/sales-channels.api.ts  | GET    | /api/sales-channels                           | ADMIN, MANAGER, AUDITOR, CASHIER | presente |
| features/sales-channels/api/sales-channels.api.ts  | POST   | /api/sales-channels                           | ADMIN, MANAGER                   | presente |
| features/sales-channels/api/sales-channels.api.ts  | PATCH  | /api/sales-channels/{param}                   | ADMIN, MANAGER                   | presente |
| features/sales-channels/api/sales-channels.api.ts  | PATCH  | /api/sales-channels/{param}/deactivate        | ADMIN, MANAGER                   | presente |
| features/sales-channels/api/sales-channels.api.ts  | PATCH  | /api/sales-channels/{param}/reactivate        | ADMIN, MANAGER                   | presente |
| features/table-orders/api/table-orders.api.ts      | POST   | /api/tables/{param}/orders/open               | ADMIN, MANAGER, CASHIER          | presente |
| features/table-orders/api/table-orders.api.ts      | GET    | /api/tables/{param}/orders/current            | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/table-orders/api/table-orders.api.ts      | GET    | /api/table-orders                             | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/table-orders/api/table-orders.api.ts      | GET    | /api/table-orders/{param}                     | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/table-orders/api/table-orders.api.ts      | POST   | /api/table-orders/{param}/items               | ADMIN, MANAGER, CASHIER          | presente |
| features/table-orders/api/table-orders.api.ts      | PATCH  | /api/table-orders/{param}/items/{param}       | ADMIN, MANAGER, CASHIER          | presente |
| features/table-orders/api/table-orders.api.ts      | DELETE | /api/table-orders/{param}/items/{param}       | ADMIN, MANAGER, CASHIER          | presente |
| features/table-orders/api/table-orders.api.ts      | POST   | /api/table-orders/{param}/cancel              | ADMIN, MANAGER, CASHIER          | presente |
| features/table-orders/api/table-orders.api.ts      | POST   | /api/table-orders/{param}/close               | ADMIN, MANAGER, CASHIER          | presente |
| features/tables/api/tables.api.ts                  | GET    | /api/tables                                   | ADMIN, MANAGER, CASHIER, AUDITOR | presente |
| features/tables/api/tables.api.ts                  | POST   | /api/tables                                   | ADMIN, MANAGER                   | presente |
| features/tables/api/tables.api.ts                  | PATCH  | /api/tables/{param}                           | ADMIN, MANAGER                   | presente |
| features/tables/api/tables.api.ts                  | PATCH  | /api/tables/{param}/deactivate                | ADMIN, MANAGER                   | presente |
| features/tables/api/tables.api.ts                  | PATCH  | /api/tables/{param}/reactivate                | ADMIN, MANAGER                   | presente |
| features/users/api/users.api.ts                    | GET    | /api/users                                    | ADMIN                            | presente |
| features/users/api/users.api.ts                    | GET    | /api/users/{param}                            | ADMIN                            | presente |
| features/users/api/users.api.ts                    | POST   | /api/users                                    | ADMIN                            | presente |
| features/users/api/users.api.ts                    | PATCH  | /api/users/{param}                            | ADMIN                            | presente |
| features/users/api/users.api.ts                    | PATCH  | /api/users/{param}/deactivate                 | ADMIN                            | presente |
| features/users/api/users.api.ts                    | PATCH  | /api/users/{param}/reactivate                 | ADMIN                            | presente |

Ver frontend-integration.md para dinero, versiones, paginación, errores, SSE y brechas semánticas.
