# RCMS Frontend - Estado por fases y plan de continuidad

Fecha de actualizacion: 2026-04-05

## 1. Contexto del proyecto
Este frontend implementa el Sistema de Gestion de Torneos de Robotica Universitarios sobre el backend RCMS documentado en `docs/api.md`.

Objetivo del frontend:
- Portal publico para ver concursos, modalidades y resultados.
- Panel ADMIN para gestionar concursos, modalidades, ganadores y operacion.
- Panel STUDENT para equipos, historial y certificados.

## 2. Stack base definido
- Next.js 16 con App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui (base-ui flavor).
- Middleware y validacion de sesion por rol.
- Endpoints internos de Next para proxy de auth y operaciones por dominio.

## 3. Resumen ejecutivo de avance
Estado general: MVP funcional en progreso, con base estable y flujo ADMIN + STUDENT ya operativos en gran parte.

Completado en alto nivel:
- Infraestructura base del proyecto.
- Auth shell con cookies propias del frontend.
- Guardas de sesion reforzadas (middleware + validacion server/client).
- Modulo ADMIN de concursos y modalidades (MVP).
- Modulo STUDENT de equipos e historial (MVP).
- Correcciones de cache para refresco inmediato en paneles y vistas publicas.
- Lecturas compartidas criticas con `no-store` por defecto para evitar hard refresh.
- Modulo ADMIN de Winners implementado.
- Fallback de login dev para estudiantes fake (`fake-google-id-N`).

Pendiente en alto nivel:
- OAuth Google real end-to-end (sin fallback dev).
- Pulido de certificados y mensajes de error UX.
- Hardening final (tests, checklist deploy, accesibilidad).

---

## 4. Fases implementadas

## Fase 0 - Fundacion tecnica
Estado: COMPLETADA

Alcance ejecutado:
- Inicializacion Next.js + TypeScript + App Router.
- Integracion Tailwind + shadcn/ui.
- Estructura de carpetas por dominios funcionales.
- Scripts de desarrollo para LAN.

Resultado:
- Proyecto compilable y extensible.

---

## Fase 1 - Auth shell y control de acceso
Estado: COMPLETADA EN MVP

Alcance ejecutado:
- Login ADMIN via endpoint interno.
- Callback STUDENT para exchange de token.
- Logout con limpieza de cookies de sesion y rol.
- `/api/auth/me` para validacion de sesion.
- Middleware por rol + layouts protegidos server-side.
- Guardas cliente para expulsar en 401/403 durante mutaciones.

Correcciones relevantes aplicadas:
- Manejo de cookie host-safe en frontend.
- Expulsion a `/` con sesion invalida.
- Bloqueo de reingreso por historial del navegador tras logout.
- Fallback dev para login estudiante con `fake-google-id-N`.

Pendiente de fase:
- OAuth Google real con UX final.

---

## Fase 2 - Modulo ADMIN (Concursos y Modalidades)
Estado: COMPLETADA EN MVP

Alcance ejecutado:
- Listado de concursos.
- Crear concurso.
- Editar concurso (incluye OPEN/CLOSED).
- Eliminar concurso.
- Detalle de concurso.
- Crear modalidad en concurso.
- Editar modalidad en concurso.
- Eliminar modalidad en concurso.
- Refresco inmediato de modalidades sin hard reload.

Detalles tecnicos:
- Mutaciones por endpoints internos en Next.
- Lecturas admin criticas con `no-store` para evitar stale data.
- Helpers compartidos de lecturas con `no-store` por defecto para reducir dependencia de hard refresh.

Pendiente de fase:
- Filtros/paginacion opcionales.

---

## Fase 3 - Portal publico
Estado: PARCIALMENTE COMPLETADA

Alcance ejecutado:
- Home publica con concursos.
- Detalle publico de concurso.
- Vista de modalidades y podio con nombres legibles de equipo y modalidad.
- Refresco del podio sin hard reload en la vista publica del concurso.

Pendiente:
- Pulido UX y estados vacios/errores.
- Estrategia fina de cache solo para datos realmente estaticos.

---

## Fase 4 - Modulo STUDENT
Estado: COMPLETADA EN MVP

Alcance ejecutado:
- Dashboard estudiante funcional.
- Crear equipo con validaciones base del lado frontend:
  - Concurso OPEN.
  - Solicitante incluido automaticamente.
  - Maximo 2 miembros.
- Listado de mis equipos.
- Historial del estudiante.
- Descarga de certificado via endpoint interno.

Correcciones relevantes aplicadas:
- Endpoint interno de teams robusto ante backend con `404` en `/teams/my`.
- Resolucion de nombre de modalidad en tabla de equipos (no UUID crudo).

Pendiente de fase:
- Mejor UX para seleccionar companero (actualmente por ID).
- Mensajes de error mas guiados por reglas de negocio.

---

## Fase 5 - Modulo ADMIN Winners
Estado: COMPLETADA EN MVP

Alcance ejecutado:
- Asignar ganador por modalidad y posicion.
- Editar posicion de ganador.
- Eliminar ganador.
- Validaciones de UI segun reglas backend:
  - Una posicion unica por modalidad.
  - Maximo 3 ganadores por modalidad.
  - Team debe corresponder a modalidad.

Pendiente:
- Pulido de UX y estados vacios.
- Validacion manual completa de bordes.

---

## Fase 6 - Certificados y trazabilidad
Estado: EN PROGRESO PARCIAL

Ya existe:
- Descarga de certificado estudiante via endpoint interno.

Pendiente:
- Refinar UX de errores de descarga (401/403).
- Flujo ADMIN de certificados.
- Mejor feedback en historial.

---

## Fase 7 - Hardening para entrega
Estado: PENDIENTE

Pendiente:
- Pruebas de auth/roles y regresion de mutaciones.
- Verificacion E2E por rol.
- Revisión de accesibilidad y consistencia visual.
- Checklist de variables por ambiente y despliegue.

---

## 5. Mapa de cumplimiento contra requerimientos funcionales

Auth:
- ADMIN login: Implementado.
- STUDENT login: Implementado en modo callback + fallback dev.
- Logout: Implementado y reforzado.
- Session check (`/auth/me`): Implementado.
- OAuth Google real: Pendiente.

Contests:
- Public list/detail: Implementado.
- ADMIN create/update/delete: Implementado.

Modalities:
- Public/by contest: Implementado.
- ADMIN create: Implementado.
- ADMIN update/delete: Implementado.

Teams:
- STUDENT create team: Implementado en MVP.
- STUDENT list my teams: Implementado en MVP.

Winners:
- Lectura publica basica: Implementado.
- CRUD admin winners: Implementado en MVP.

History:
- STUDENT history: Implementado en MVP.

Certificates:
- Descarga estudiante: Implementada en MVP.
- Flujo completo ADMIN/STUDENT refinado: Pendiente.

---

## 6. Riesgos actuales y mitigaciones

Riesgo: sesion invalida persistida en cliente.
Mitigacion aplicada: middleware + guard server-side + guard client-side + redireccion forzada.

Riesgo: datos viejos en panel admin.
Mitigacion aplicada: `no-store` en lecturas criticas.

Riesgo: diferencias de host/cookie en desarrollo.
Mitigacion aplicada: scripts de dev LAN + manejo de cookies del lado Next.

Riesgo: comportamiento inconsistente de `/teams/my` en algunos estados backend.
Mitigacion aplicada: fallback con `/auth/me` + `/teams` y filtro por miembro.

---

## 7. Siguiente fase recomendada (sin abrir frentes nuevos)

Prioridad inmediata:
1. Cerrar pendientes menores de Fase 4 (UX de companero y mensajes de error guiados).
2. Refinar Fase 6 (errores certificados + flujo ADMIN).
3. Revisar si algun dato realmente puede volver a cacharse sin reintroducir hard refresh.

Prioridad posterior:
1. OAuth Google real en reemplazo de fallback dev.
2. Hardening final (tests y checklist de entrega).

---

## 8. Criterio de terminado para MVP funcional
El MVP se considera terminado cuando:
- ADMIN puede gestionar concursos, modalidades y winners de inicio a fin.
- STUDENT puede autenticarse, crear equipo valido, ver historial y descargar certificado cuando aplique.
- Usuario sin sesion no puede permanecer en rutas protegidas ni por historial.
- Flujos criticos pasan validacion manual y `lint/build` en verde.
