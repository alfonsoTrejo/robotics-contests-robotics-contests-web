# RCMS Frontend - Estado por fases y plan de continuidad

Fecha de actualizacion: 2026-04-01

## 1. Contexto del proyecto
Este frontend implementa el Sistema de Gestion de Torneos de Robotica Universitarios sobre el backend RCMS documentado en docs/api.md.

Objetivo del frontend:
- Portal publico para ver concursos, modalidades y resultados.
- Panel ADMIN para gestionar concursos, modalidades, ganadores y operacion.
- Panel STUDENT para equipos, historial y certificados.

## 2. Stack base definido
- Next.js 16 con App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui (base-ui flavor).
- Middleware para control de acceso.
- Endpoints internos de Next para proxy seguro de autenticacion y operaciones admin.

## 3. Resumen ejecutivo de avance
Estado general: Base funcional estable, con flujo ADMIN principal en progreso avanzado.

Completado en alto nivel:
- Infraestructura del proyecto y UI base.
- Middleware y guardas de sesion reforzadas.
- Modulo ADMIN de concursos y modalidades (crear, editar, eliminar, listar).
- Correcciones de cache y refresco de datos sin hard reload.
- Correcciones de logout para evitar reingreso por historial del navegador.

Pendiente en alto nivel:
- Flujo OAuth estudiante de punta a punta (UI completa con proveedor).
- Modulo STUDENT completo (crear equipo, validaciones de negocio, historial final).
- Modulo WINNERS ADMIN completo.
- Integracion completa de certificados y reportes.
- Endurecimiento final (tests, observabilidad y checklist de produccion).

---

## 4. Fases implementadas

## Fase 0 - Fundacion tecnica
Estado: COMPLETADA

Alcance:
- Inicializacion del proyecto Next.js con TypeScript y App Router.
- Integracion de Tailwind y shadcn/ui.
- Estructura base de carpetas para escalado por features.
- Configuracion de scripts de desarrollo para LAN.

Resultado:
- Proyecto compilable, con lint y build en verde.
- Base lista para iteraciones por dominio funcional.

---

## Fase 1 - Auth shell y control de acceso
Estado: MAYORMENTE COMPLETADA

Alcance ejecutado:
- Login ADMIN mediante endpoint interno en Next.
- Callback STUDENT para intercambio de id_token.
- Logout via endpoint interno.
- Middleware por rutas ADMIN/STUDENT.
- Guard adicional en cliente para sesiones invalidas.
- Validacion activa de sesion mediante /auth/me en rutas protegidas.

Correcciones relevantes ya aplicadas:
- Manejo de cookies para host frontend (evita inconsistencias localhost/IP).
- Expulsion a inicio cuando la sesion no es valida.
- Bloqueo de acceso por historial del navegador tras logout.

Pendiente de esta fase:
- Integracion OAuth completa con proveedor Google (flujo UX final, no solo callback tecnico).
- Mensajes de sesion expirada mas amigables en UI.

---

## Fase 2 - Modulo ADMIN (Concursos y Modalidades)
Estado: COMPLETADA EN MVP

Alcance ejecutado:
- Listado de concursos para ADMIN.
- Crear concurso.
- Editar concurso (incluye cambio de estado OPEN/CLOSED).
- Eliminar concurso.
- Detalle de concurso en panel ADMIN.
- Crear modalidad dentro de concurso.
- Listar modalidades del concurso en tiempo real al refrescar ruta.

Detalles tecnicos importantes:
- Mutaciones ADMIN se ejecutan contra endpoints internos en Next (proxy), no directo desde browser al backend.
- Ajustes de cache para evitar stale data: en area ADMIN se prioriza no-store donde aplica.

Pendiente de esta fase:
- Edicion y eliminacion de modalidades en UI.
- Paginacion/filtros si el volumen de concursos crece.

---

## Fase 3 - Portal publico
Estado: PARCIALMENTE COMPLETADA

Alcance ejecutado:
- Home publica con listado de concursos.
- Detalle publico de concurso.
- Visualizacion basica de modalidades y podio cuando existe data.

Pendiente:
- Pulido UX final del portal publico.
- Manejo de estados vacios/errores mas rico.
- Estrategia de revalidacion por tags para cache publico inteligente.

---

## Fase 4 - Modulo STUDENT
Estado: INICIADA, NO COMPLETA

Ya existe:
- Estructura de rutas STUDENT.
- Dashboard base.
- Historial base conectado.

Pendiente critico:
- Crear equipo completo segun reglas de negocio del backend:
  - Maximo 2 miembros.
  - El solicitante debe incluirse en memberUserIds.
  - Solo concursos OPEN.
- Gestion de equipos propios en UI (con estados y errores claros).
- Flujo de certificados desde historial (descarga y feedback de errores).

---

## Fase 5 - Modulo ADMIN Winners y operacion final
Estado: PENDIENTE

Pendiente:
- Asignar ganador por modalidad y posicion.
- Editar posicion de ganador.
- Eliminar ganador.
- Reflejar reglas del backend en UI:
  - Solo una posicion FIRST/SECOND/THIRD por modalidad.
  - Maximo 3 ganadores por modalidad.
  - Validaciones de consistencia team-modality.

---

## Fase 6 - Certificados y trazabilidad
Estado: PENDIENTE

Pendiente:
- Integracion fina de descarga de certificados en flujo STUDENT y ADMIN.
- Manejo de errores de autorizacion al descargar PDF.
- Mejorar experiencia de historial con estado de certificado disponible/no disponible.

---

## Fase 7 - Hardening para entrega
Estado: PENDIENTE

Pendiente:
- Pruebas de rutas criticas de auth y permisos.
- Pruebas de regresion de mutaciones admin.
- Verificacion E2E de flujos reales por rol.
- Revisión de accesibilidad y consistencia visual.
- Checklist de variables de entorno por ambiente.
- Documentacion de despliegue y operacion.

---

## 5. Mapa de cumplimiento contra requerimientos funcionales

Auth:
- ADMIN login: Implementado.
- STUDENT login Google: Parcial (callback tecnico), falta UX OAuth completa.
- Logout: Implementado y reforzado.
- Me/session check: Implementado.

Contests:
- Public list/detail: Implementado.
- ADMIN create/update/delete: Implementado.

Modalities:
- List by contest: Implementado.
- ADMIN create: Implementado.
- ADMIN update/delete: Pendiente de UI.

Teams:
- Public/team list y STUDENT create con reglas: Pendiente principal.

Winners:
- Lectura publica basica: Parcial.
- CRUD admin winners: Pendiente.

History:
- Vista base: Implementada.
- Flujo completo y refinado: Pendiente.

Certificates:
- Integracion operativa completa: Pendiente.

---

## 6. Riesgos actuales y mitigaciones

Riesgo: sesion invalida persistida en cliente.
Mitigacion aplicada: middleware con validacion de sesion real + guard cliente + redireccion forzada.

Riesgo: datos viejos en panel admin por cache.
Mitigacion aplicada: consultas admin criticas con no-store.

Riesgo: discrepancias de dominio/host para cookies en desarrollo LAN.
Mitigacion aplicada: ajustes de script dev y origen permitido en Next.

---

## 7. Backlog recomendado para la siguiente jornada

Prioridad alta:
1. Completar modulo STUDENT de equipos con reglas de negocio.
2. Completar modulo ADMIN de winners.
3. Cerrar OAuth Google end-to-end en UI.

Prioridad media:
1. Editar/eliminar modalidades en panel ADMIN.
2. Mejorar UX de errores y estados de carga.
3. Revalidacion por tags para area publica.

Prioridad baja:
1. Pulido visual final y microinteracciones.
2. Reportes adicionales para ADMIN.

---

## 8. Criterio de terminado para MVP funcional
El MVP se considera terminado cuando:
- ADMIN puede gestionar concursos, modalidades y winners de inicio a fin.
- STUDENT puede autenticarse, crear equipo valido, ver historial y descargar certificado cuando aplique.
- Usuario sin sesion no puede permanecer en rutas protegidas ni por historial del navegador.
- Flujos criticos pasan validacion manual y build/lint en verde.
