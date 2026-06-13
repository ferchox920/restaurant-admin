# Front Sprint 10.12 - Frontend Known Limitations

## Riesgos aceptados del MVP

- el `accessToken` permanece en `localStorage`;
- no existe suite E2E completa;
- la seguridad real depende del backend como fuente de verdad;
- los permisos visuales no reemplazan autorizacion real;
- el frontend depende de CORS y disponibilidad publica del backend;
- la validacion manual sigue siendo necesaria antes de deploy.

## Limitaciones funcionales conocidas

- no hay recuperacion de contrasena;
- no hay cambio de contrasena;
- no hay `2FA`;
- no existe `/settings`;
- no hay exportacion Excel o PDF;
- no hay realtime ni modo offline;
- no hay experiencia mobile especializada de punto de venta.

## Limitaciones tecnicas conocidas

- la suite automatizada es pequena y no cubre todo el arbol de componentes;
- no se mockea un backend completo para flujos integrados;
- la observabilidad de produccion no esta documentada como parte del MVP;
- la estrategia de deploy readiness es inicial, no una politica de plataforma definitiva.

## Que sigue fuera del MVP

- validacion integrada con backend en entorno deployado;
- endurecimiento posterior de sesion y auth;
- automatizacion E2E;
- mejoras de observabilidad y operacion;
- modulos nuevos de negocio.
