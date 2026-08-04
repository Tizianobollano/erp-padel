# Log - erp-padel

[2026-07-29] Creacion del proyecto. Ingest de investigacion de mercado provista por el humano
(esquemas de cobro y funcionalidades de Clubo, CanchaFija y PadelCRM) y redaccion de la propuesta
borrador 1 en wiki/propuesta.md: Parte 1 comercial (3 modulos -- turnos, torneos, caja y
contabilidad --, dos planes a $22.000 y $34.000/mes, adicionales, puesta en marcha en 5 dias sin
cargo) y Parte 2 interna (economia del modelo sin costo de instalacion, arquitectura sobre Workers +
D1 por club, 4 decisiones pendientes, riesgos, 8 oleadas de construccion).

Restriccion que ordeno toda la propuesta, planteada por el humano: cobrar instalacion nos saca del
mercado. Consecuencia que la propuesta hace explicita en vez de esconder: sin cargo de puesta en
marcha, la construccion se recupera solo con volumen (menos de 5 clubes no cierra) y el compromiso
de 12 meses pasa a ser el mecanismo que reemplaza al cargo, no una clausula de tramite.

Diferenciacion elegida frente a los tres competidores: contabilidad de verdad (ingresos por origen,
egresos, margen de cantina, resultado del periodo) y auditoria inmutable, donde ellos ofrecen punto
de venta y caja diaria. Mas soberania del dato: base propia por club y exportacion completa
siempre disponible.

Sin construir nada. Sin recursos CF creados.

[2026-07-29] Entregable para cliente en propuesta-cliente.md (raiz del proyecto, fuera del wiki,
como erp-inmobiliaria): Parte 1 de la propuesta sin valores (placeholders $--.--- al estilo del
entregable de gestoria), sin el anexo interno, con seccion de fuentes al pie. Las fuentes se
verificaron por busqueda: clubo.com.ar, canchafija.com.ar y padelcrm.com existen y son los sitios
de los tres competidores; los precios de la investigacion original siguen sin verificarse contra
esas paginas, asi que la tabla comparativa del entregable no lleva ningun valor de mercado. Se
listan tambien los terceros con condiciones propias (Mercado Pago, WhatsApp Business API, ARCA).

[2026-07-29] Modulo 4 - Precio por demanda, agregado a propuesta.md y al entregable. Discriminacion
de precio por cancha y franja mediante algoritmo de reglas explicitas (ocupacion historica,
ocupacion del dia, anticipacion de la reserva, calendario, tasa de no-show), acotado por bandas de
piso y techo que fija el club. Decisiones de diseno tomadas: reglas en tabla y no modelo entrenado
(el club tiene que entender por que subio una hora), ajuste en las dos direcciones y no solo
recargo en pico, precio sellado al confirmar la reserva, simulador contra historico obligatorio
antes de activar, y modo sugerencia por defecto. Implementacion prevista: Cron Trigger diario por
club sobre datos ya existentes en D1, sin servicio externo. Empaquetado como adicional de $9.000
sobre plan Club ($43.000 de ticket, al filo del techo de mercado ~$45.000) con costo marginal
cercano a cero; queda como decision pendiente 5 si va como adicional o como tercer plan. Entra
como oleada 7 y no antes, porque el algoritmo necesita historico de reservas que no existe hasta
que el club opero meses sobre la oleada 1.

[2026-07-29] Carpeta renombrada padel -> erp-padel e inicializado repo git propio (proyecto fuera
del repo normai, como el resto de projects/, que esta gitignored). Remoto en GitHub pendiente: no
hay `gh` instalado en esta maquina, asi que la creacion del repositorio remoto y el primer push
quedan a cargo del humano.

[2026-08-04] Reconciliacion de inicio de sesion (paso 6 del protocolo): MISMATCH detectado entre
wiki y estado real. index.md decia "sin repo" / "remoto pendiente de crear", pero `git remote -v`
muestra origin ya apuntando a git@github.com:Tizianobollano/erp-padel.git y `git status` confirma
la rama al dia con origin/main (6 commits, incluido uno de habilitacion de worktrees). El humano
creo el remoto y pusheo a mano en algun momento posterior al 2026-07-29 sin que quedara registrado
en la wiki. Reportado como MISMATCH y confirmado por el humano antes de corregir; index.md
actualizado. Tambien se deja registrado: arranca una corrida end-to-end del Modulo 1 (Reserva de
cancha) como implementacion de referencia para ejercitar la suite de agentes, confirmada por el
humano como excepcion tecnica a la regla de "2 clubes comprometidos" (no es un compromiso
comercial).

[2026-08-04] ADR-0001 (software-architect): resuelta la decision pendiente 1 (modelo de cuentas
Cloudflare para producto de ticket bajo). Cuenta CF compartida con Workers for Platforms (dispatch
namespace, un User Worker por club con su D1 adjuntada por binding), no una cuenta por club.
Matiza ADR-0006 global (una cuenta por cliente) para el caso de erp-padel: producto enlatado
multi-tenant de UN mismo codigo, exactamente la excepcion que el propio ADR-0006 nombra y descarta
para su caso (bespoke). Verificado en cloudflare-docs MCP: W4P soporta bindings D1/KV/R2 aislados
por User Worker, es la arquitectura de referencia de Cloudflare para este patron, y los scripts de
un namespace no cuentan contra el limite de "Number of Workers" de la cuenta (lo que descarta el
modelo alternativo `--env <club>` sobre cuenta compartida). Gap dejado abierto: costo mensual
propio de W4P mas alla del Workers Paid $5/mes, no encontrado en la documentacion consultada;
devops debe confirmarlo en el dashboard. Detalle completo en
decisions/0001-modelo-cuentas-cloudflare-multi-club.md. Cascada aplicada: propuesta.md
(arquitectura + decision pendiente 1 marcada resuelta) e index.md (decision movida de pendientes a
tomadas) actualizados en la misma sesion.

[2026-08-04] database-architect: modelo de datos del Modulo 1 (Reserva de cancha), corrida en el
worktree reserva-cancha. Tres tablas (`canchas`, `horarios_atencion`, `reservas`) en
migrations/0001_reservas.sql, PK INTEGER AUTOINCREMENT y timestamps TEXT ISO-8601 provistos por la
app, consistente con el patron de inmobiliaria (ADR-0007) citado como referencia de auth en este
proyecto. El caso pedido explicitamente por el humano -- bloqueo de turno a nivel de schema, no de
logica de app -- se resuelve con un indice UNICO PARCIAL
(`idx_reservas_turno_unico ON reservas(cancha_id, fecha, hora_inicio) WHERE estado='confirmada'`):
dos INSERT concurrentes para el mismo turno chocan en el motor SQLite, uno gana y el otro recibe
SQLITE_CONSTRAINT, sin necesidad de SELECT previo ni lock explicito. Detalle completo, relaciones y
decisiones no triviales (horarios club-wide no por cancha, sin tabla usuarios/auth todavia,
estados simplificados a confirmada/cancelada por exclusion explicita de sena/pago, jugador sin
tabla propia) en wiki/architecture/modelo-datos-reservas.md.

Nota de reconciliacion (paso 6 del protocolo): la wiki de este worktree quedo desactualizada
respecto a la wiki principal del proyecto -- no tiene el ADR-0001 (modelo de cuentas Cloudflare
W4P) ni el registro del remoto de GitHub ya creado, porque el worktree se creo antes de que esos
cambios se commitearan a main. No lo reconcilie en esta sesion por estar fuera del alcance de la
tarea (modelado de datos); queda para quien mergee este worktree a main.

[2026-08-04] api-developer: Worker del Modulo 1 (Reserva de cancha) armado desde cero en este
worktree -- package.json, wrangler.jsonc, tsconfig.json, Hono sobre Workers ESM. Migracion
0001_reservas.sql aplicada tal cual (no se toco); migracion nueva 0002_auth.sql agrega `usuarios`
(email PK, sin columna de rol -- el alcance de este modulo no distingue permisos entre usuarios
del panel, a diferencia de inmobiliaria).

Endpoints: publicos `GET /api/disponibilidad` (deriva la grilla de horarios_atencion menos
reservas confirmadas) y `POST /api/reservas`; privados `GET /api/panel/reservas` y
`POST /api/panel/reservas/:id/cancelar`, montados detras de `requireAccess`.

Anti-doble-reserva: la creacion de reserva hace el INSERT directo con estado='confirmada' (sin
SELECT previo) y captura el Error que D1 lanza cuando el indice UNICO PARCIAL
`idx_reservas_turno_unico` rechaza el segundo INSERT -- el mensaje observado en local
(Miniflare/workerd) es "D1_ERROR: UNIQUE constraint failed: ...: SQLITE_CONSTRAINT", detectado con
`/UNIQUE constraint failed/i` sobre `err.message`; cualquier otro error se re-lanza. Verificado con
`wrangler dev` local: primer POST /api/reservas para el mismo turno -> 201, segundo -> 409
`{"error":"turno ya no disponible"}`. Cancelar libera el turno (el indice es parcial): probado
disponibilidad antes/despues de cancelar.

Auth del panel: mismo patron que projects/inmobiliaria (ADR-0003 de ese proyecto, citado en
wiki/index.md de erp-padel) -- Cloudflare Access verifica el JWT con Web Crypto (RS256, JWKS
cacheado por isolate), la tabla `usuarios` de D1 autoriza por email. Codigo copiado de
projects/inmobiliaria/src/platform/auth/{access,middleware}.ts y simplificado (sin roles). Bypass
de dev con ENVIRONMENT=development (mismo criterio fail-closed que inmobiliaria: allowlist
explicita, no denylist) para poder probar el panel con `wrangler dev` sin una app de Access
montada -- probado que con ENVIRONMENT=production y sin JWT el panel devuelve 403.

Sin UI mas alla de un `GET /health`: design-lead/frontend-developer definen el formulario publico y
el panel despues. Sin tests automatizados (vitest) en esta pasada -- se verifico todo con
`wrangler dev` local + curl, no hay suite en el repo todavia; si se agrega, seguir el patron de
inmobiliaria (`@cloudflare/vitest-pool-workers`).

Gaps para el humano: (1) `.dev.vars.example` documenta ACCESS_TEAM_DOMAIN/ACCESS_AUD para cuando
devops monte la app de Access real -- sin app creada todavia, no hay valores reales que poner. (2)
Sin seed de canchas/horarios mas alla de las filas de prueba insertadas a mano para el curl de esta
sesion (Cancha 1, martes 09-12hs cada 60min) -- si el humano quiere datos de demo persistentes,
falta un seeds/ como el de inmobiliaria. (3) wrangler.jsonc quedo de un solo entorno (sin bloques
`env.*`): a diferencia de inmobiliaria (multi-cliente en un repo), erp-padel es un club por Worker
via W4P (ADR-0001), asi que no hace falta esa estructura -- devops define el pipeline de subida al
dispatch namespace aparte, sin `wrangler deploy --env`.

[2026-08-04] design-lead: PRODUCT.md y design.md del Modulo 1 (Reserva de cancha), corridos en el
worktree reserva-cancha antes de que frontend-developer toque UI. Lei literal `src/routes/{public,
panel}.ts` (contrato de API real, no imaginado) y `wiki/architecture/modelo-datos-reservas.md`
antes de especificar. PRODUCT.md escrito directo (equivalente a `/impeccable init`, sin comando
interactivo) porque erp-padel no tiene PRODUCT.md previo ni cliente/marca confirmada todavia.

Hallazgo de estructura: este worktree NO tiene bootstrap de frontend (sin `src/styles/app.css`,
`src/components/`, `src/pages/`, `src/renderer.tsx` -- solo el backend Hono). Tampoco usa la
convencion `apps/web/` de otros proyectos IIAPIE-UI (gestoria_en_movimiento): es un unico Worker
con `src/` en la raiz. `design.md` y `PRODUCT.md` quedaron en la raiz del worktree por eso, no en
`apps/web/`. Documentado como nota de secuencia en design.md seccion 6 para que
frontend-developer no pierda tiempo buscando una carpeta que no existe: bootstrapear copiando
`/normai/workspace/framework/src/{components,styles,renderer.tsx}` antes de construir las paginas.

El caso critico del modulo (409 "turno ya no disponible" -- la carrera de reserva concurrente que
justifica el indice UNICO PARCIAL del modelo de datos) quedo especificado como estado propio
`conflict` de `ReservaForm` (design.md seccion 7), distinto del estado `error` generico: copy
propio ("Justo se reservo ese horario. Elegi otro."), refetch automatico de disponibilidad para
que el turno perdido aparezca marcado como ocupado, y preservacion de los demas datos cargados
(cancha/fecha/nombre/telefono no se pierden). El estado `error` generico deliberadamente NO
dispara ese refetch, para no asumir el estado real de un turno cuando la API no lo confirmo.

Dos gaps de componente detectados y documentados en framework-backlog.md (no los resolvi yo, no
toco codigo): `Button` no tiene `variant="danger"` ni `Alert` tiene `tone="danger"`, pese a que
`--color-danger` ya existe en `@theme` y ya lo usan `ErrorState`/`Toast`/`StatusBadge`. Este
modulo los necesita en dos lugares reales: boton "cancelar reserva" (destructivo, con patron de
confirmacion en Modal por los datos concretos de la fila) y el bloque del 409. Especificados en
design.md seccion 6 como extension que frontend-developer implementa.

Sin construir nada de UI. Sin tocar `src/**`.

[2026-08-04] frontend-developer: implementacion completa del Modulo 1 (Reserva de cancha) sobre
design.md, en el worktree reserva-cancha.

Bootstrap (design.md seccion 6): copiado `/normai/workspace/framework/src/{components,styles,
renderer.tsx}` a este proyecto; `src/index.ts` (solo API) renombrado a `src/index.tsx` para poder
montar `c.render()`. Agregado a package.json/wrangler.jsonc/tsconfig.json lo que el bootstrap del
framework trae y que este worktree (armado solo-backend por api-developer) todavia no tenia:
scripts de Tailwind (`dev:css`/`build:css` via `@tailwindcss/cli`), `assets: { directory:
"./public" }` para servir `styles.css`, y `jsx: "react-jsx"` / `jsxImportSource: "hono/jsx"` +
`include` de `.tsx` en tsconfig. `public/styles.css` gitignorado (se regenera con `npm run
build:css`), mismo criterio que el framework base.

Tokens (design.md seccion 3): `--font-sans` cambiado a pila de sistema (sin Inter, sin
`@font-face`); sacados los `<link>` de Google Fonts de `renderer.tsx`. Ningun otro `@theme`
tocado.

Extension de componentes (design.md seccion 6, ya specced por design-lead): `Button
variant="danger"` (`bg-danger` + `hover:brightness-90` -- sin token `*-hover` nuevo, el contrato
de roles no define uno para `danger`) y `Alert tone="danger"` (`bg-danger/12 border-danger/30`,
icono `alert-triangle`). Dos extensiones tecnicas adicionales, no previstas en design.md pero
necesarias para implementar su propio pseudocodigo literal: `Button` ahora spreadea `data-*` (el
pseudocodigo de design.md seccion 7 ya asume `<Button data-cancelar={r.id}>`, que con el
componente original no compila) e `Input` gano tipos `min`/`max` (ya se forwardeaban en runtime
via rest, faltaba declararlos). Las tres son solo tipos/atributos, cero cambio visual. Documentadas
en framework-backlog.md (4 entradas nuevas: danger ya estaba, sume Button data-*, Input min/max, y
FilterBar sin opcion de ocultar el buscador bundleado).

Componentes nuevos (`src/components/reservas/`): `TurnosGrid` (grilla de turnos SSR, estados
disponible/seleccionado/ocupado con `aria-label` + texto `sr-only` para no depender solo de
color) y `ReservaForm` (orquesta encabezado + flujo completo de la pagina publica, 5
`data-state` con TODAS las variantes en el SSR -- idle/loading/success/conflict/error via
`group-data-[state=X]` sobre el contenedor, mismo patron que `data-open` de Modal). Turnos se
piden por fetch desde `ClientScript` (no hay SSR de ese fragmento, design.md lo pide explicito) --
el JS reconstruye la grilla por DOM directo con las mismas clases que `TurnosGrid.tsx`; si cambian
las clases de un lado hay que actualizar el otro a mano (riesgo de drift documentado en comentario
en ambos archivos).

Paginas: `src/pages/reservar.tsx` (`GET /reservar`, publica) y `src/pages/panel.tsx` (`GET /panel`,
detras de `requireAccess`, mismo middleware que `/api/panel/*`). Ninguna de las dos tiene endpoint
propio para "listar canchas" en la API existente (`public.ts`/`panel.ts` no lo exponen) -- se
resolvio consultando D1 directo desde el route handler de `index.tsx` con el helper `all()` ya
existente en `src/db/client.ts`, sin tocar `src/routes/*`. El panel tampoco tiene forma de resolver
`cancha_nombre` desde `GET /api/panel/reservas` (solo devuelve `cancha_id`, nota explicita de
design.md seccion 7) -- resuelto con un segundo `SELECT` a `canchas` y un `Map` en memoria. Fecha
por defecto del filtro del panel: hoy (no specced literal, pero design.md seccion 4.B da la razon
explicita: "el encargado casi siempre busca las de hoy").

Desviacion de composicion (no de diseno visual): design.md pide "chips de FilterBar" para el panel,
pero el componente `FilterBar` del framework siempre monta ademas un buscador de texto libre que
la API de este modulo no soporta (`GET /api/panel/reservas` solo filtra por fecha/estado). Montar
`FilterBar` tal cual dejaba un buscador visible que no filtra nada. Se replicaron a mano las
clases de los chips en `panel.tsx` sin usar el componente; documentado en framework-backlog.md.

ClientScript.tsx extendido (sin tocar los bloques del framework base) con: overlays genericos
(`data-overlay-close`/Esc, foco entra al abrir y vuelve al trigger al cerrar -- PRODUCT.md 7),
orquestacion de TurnosGrid+ReservaForm (fetch de disponibilidad, seleccion de turno, submit con
manejo de 201/409/error, refetch automatico en 409), filtro de fecha del panel (auto-submit) y
cancelacion de reserva (Modal con datos de la fila inyectados por `data-*` del trigger, POST,
actualizacion de la fila en el DOM sin recargar pagina, Toast). En 409 de cancelacion (reserva ya
cancelada por otra sesion) la fila se actualiza igual que en el 200, porque el estado real
confirmado es "cancelada" en ambos casos -- interpretacion de "refresca la fila desde el estado
real cuando sea posible" (design.md seccion 7), no hay endpoint para pedir el estado real de una
sola reserva.

Config: `src/config/club.ts` con `CLUB_NOMBRE = "Club de Padel"` (placeholder unico, centralizado
para no hardcodear el nombre en dos JSX). erp-padel no tiene nombre comercial ni club piloto
todavia (wiki/index.md, decision pendiente 2) -- cuando lo tenga, es cambiar este valor, no tocar
componentes.

**Desviacion de spec para reportar al humano/design-lead, implementada literal sin corregir:** el
Modal de cancelacion usa `Button variant="outline-light"` para "Volver" (design.md seccion 7, cita
literal), pero ese variant esta pensado para superficie oscura (`text-on-dark` = texto claro) y el
Modal es `bg-surface-1` (blanco). Verificado visualmente con Playwright: el boton "Volver" queda
practicamente ilegible (texto casi blanco sobre fondo blanco). Lo implemente tal cual el spec por
la regla dura de mi rol (ejecutar el spec literal, no corregir diseno por mi cuenta) pero es casi
seguro un error de design-lead -- el candidato obvio es `outline-accent` (mismo patron que "Cancelar"
de la tabla, texto/borde `accent` sobre superficie clara). Pendiente de que design-lead lo revise y
actualice design.md; no lo cambie.

Verificacion: `tsc --noEmit` limpio. `wrangler dev` local con migraciones ya aplicadas (por
api-developer) + datos de prueba insertados a mano (2da cancha, reserva confirmada, reserva en
carrera). Flujo completo verificado en navegador real (Playwright): formulario publico
idle -> seleccion de turno -> submit -> 409 (turno tomado por una insercion concurrente simulada,
grilla se refresca sola marcando el turno como ocupado, datos cargados se conservan) -> reintento
con otro turno -> success con el resumen de la respuesta 201. Panel: cancelacion via Modal (foco
correcto, datos de la fila inyectados, Toast de exito, fila actualizada sin reload), y el 409 del
panel (reserva cancelada por otra sesion mientras el Modal estaba abierto) con Toast de error y
fila igual actualizada. Filtro por estado (chip "Confirmadas") probado con `EmptyState` cuando no
hay resultados. Screenshots no se conservan en el repo (se usaron solo para verificar, se
borraron).

No commiteado (regla dura: nunca commitear sin pedido explicito). Pendiente para el humano: revisar
la desviacion de `outline-light` en el Modal antes de dar el modulo por cerrado.

[2026-08-04] qa-engineer: gate de QA del Modulo 1 (Reserva de cancha) corrido en el worktree
reserva-cancha antes de mergear a main. Veredicto: **SHIP CON FIXES**.

Verificado realmente (no asumido): `tsc --noEmit` limpio (cero errores). Lint: no corrido -- no
existe script `lint` ni config de linter en este proyecto (`package.json` no lo define, sin
`.eslintrc`/`eslint.config.*`/`biome.json`), a diferencia de `projects/inmobiliaria` que usa
`oxlint src test`. Gap de tooling, no un check saltado a proposito. Sin suite de tests
automatizados (sin `vitest`/`@cloudflare/vitest-pool-workers` en el repo) -- toda la verificacion
de esta pasada fue manual contra `wrangler dev --local` + curl, igual que hizo api-developer en su
sesion.

**Prueba de concurrencia (foco explicito pedido por el humano):** 10 `POST /api/reservas`
simultaneos (bash `&` + `wait`, no `Promise.all` en el mismo proceso) contra el mismo
`cancha_id=2, fecha=2026-08-11, hora_inicio=10:00` (horario libre confirmado antes por
`GET /api/disponibilidad`). Resultado: exactamente un `201` (id 5, "Concurrente 2") y nueve `409
{"error":"turno ya no disponible"}`. Verificado el estado real en D1 despues (`SELECT ... WHERE
cancha_id=2 AND fecha='2026-08-11' AND hora_inicio='10:00'`): una sola fila, `confirmada`, sin
duplicados ni filas huerfanas. El indice UNICO PARCIAL `idx_reservas_turno_unico` se comporta
exactamente como describe `wiki/architecture/modelo-datos-reservas.md`. Limitacion documentada:
D1 local (Miniflare/workerd) no da paralelismo real de motor -- 10 requests HTTP concurrentes
contra el mismo proceso Worker, pero el arbitraje final es serializado por el runtime local, no
por multiples workers de SQLite en paralelo real. Es la mejor aproximacion posible sin D1 remoto;
no equivale a una prueba de carga contra la infraestructura real de D1 en produccion.

Migraciones: 0001 y 0002 son aditivas -- 0002 solo agrega una tabla nueva (`usuarios`), no toca
ninguna columna ni tabla de 0001. Sin `ALTER TABLE` en ninguna de las dos.

Manejo de errores: `POST /api/reservas` y `POST /api/panel/reservas/:id/cancelar` cubren campo
faltante, fecha invalida, hora fuera de grilla, dia sin atencion, cancha inexistente, body no-JSON,
id invalido y doble cancelacion -- todos devuelven `{"error": string}` con status coherente,
probado con curl uno por uno. Gap real: no hay `app.onError`/`app.notFound` en `src/index.tsx` --
una ruta inexistente devuelve `404 Not Found` en `text/plain` (verificado con curl -I), no JSON, y
cualquier excepcion no capturada (ej. `GET /api/panel/reservas` no tiene try/catch, a diferencia de
la pagina `/panel` que si lo tiene) caeria al handler default de Hono, tambien no-JSON. Rompe la
consistencia que pide este rol. Severidad: warning.

Hallazgo de severidad blocker (nuevo, no reportado por api-developer): `wrangler.jsonc` tiene
`vars.ENVIRONMENT = "development"` hardcodeado como default committeado -- ese valor es lo que
habilita el bypass total de `requireAccess` (`src/auth/middleware.ts`, `esDev()`), que entra
directo como `dev@local` sin JWT. Confirmado que el codigo de auth es fail-closed *cuando*
`ENVIRONMENT` no es development (probado localmente con `wrangler dev --var
ENVIRONMENT:production`: `GET/POST /api/panel/*` sin JWT -> 403 en ambos casos). El riesgo no es el
codigo de auth en si, es que `package.json` tiene `"deploy": "wrangler deploy"` (deploy directo,
distinto del pipeline W4P via Upload User Worker API que describe ADR-0001 y que todavia no existe)
y ese comando lee `vars` de este mismo `wrangler.jsonc` -- si alguien lo corre tal cual contra
staging o produccion antes de que exista el pipeline real, el panel queda expuesto sin
autenticacion a cualquiera. Gate de staging es "automatico tras typecheck+lint" (CLAUDE.md) y este
valor pasaria ambos sin alertar. Bypass de auth es blocker sin excepcion segun la tabla de
severidad de este rol.

Hallazgo confirmado por mi cuenta (ya reportado por frontend-developer en la entrada anterior,
severidad no asignada por ellos): el boton "Volver" del Modal de cancelacion usa `Button
variant="outline-light"` (`src/pages/panel.tsx` linea 132, literal de `design.md` seccion 7 linea
301) -- ese variant es `text-on-dark` (`--color-on-dark: #eeecde`, casi blanco) sobre
`border-on-dark/55`, pensado para superficie oscura, pero `Modal` es `bg-surface-1`
(`--color-surface-1: #ffffff`). Contraste real ~1.05:1, muy por debajo del piso 4.5:1 que
`PRODUCT.md` seccion 7 fija como "Estandar base: WCAG 2.1 AA" no negociable para este modulo.
Clasificado como warning (no blocker): el boton sigue siendo clickeable e identificable por
posicion/borde, no pierde datos ni bypassea nada, pero incumple un criterio de aceptacion explicito
del propio PRODUCT.md y el fix es trivial (`outline-accent`, ya usado en la tabla para "Cancelar").
El error es de `design.md` (design-lead), no de la implementacion: frontend-developer siguio el
spec literal por regla de su rol, correctamente.

No se escribieron tests automatizados en esta pasada (fuera del pedido explicito de esta sesion,
que se enfoco en reproducir la carrera y verificar los gates existentes) ni se toco codigo de
produccion. Sin commit.

[2026-08-04] security-reviewer: auditoria puntual pre-staging del Modulo 1 (formulario publico +
login/panel del club), worktree reserva-cancha. **Confirmado por cuenta propia** (no se dio por
buena la cita de QA) el hallazgo blocker de la entrada anterior, leyendo directo
`src/auth/middleware.ts`, `src/auth/access.ts`, `wrangler.jsonc` y `package.json`: `esDev()`
(middleware.ts linea 17-19) entra en bypass total de `requireAccess` cuando `env.ENVIRONMENT` es
`"development"` o `"dev"`; `wrangler.jsonc` linea 16 fija ese valor como default (todavia no
commiteado a main -- el worktree completo esta sin commitear, `git ls-files` no lo tiene
trackeado, matiz sobre como lo cito QA); `package.json` linea 11 expone `"deploy": "wrangler
deploy"` que leeria ese default si se corre fuera del pipeline W4P real (ADR-0001). Agravante no
mencionado por QA: `wrangler.jsonc` no fija `workers_dev: false` ni `routes`, asi que un
`wrangler deploy` suelto con el default actual quedaria publico de inmediato en un subdominio
`*.workers.dev`, exponiendo nombre+telefono de TODAS las reservas via `GET /api/panel/reservas`
sin ningun JWT. Por regla propia de este rol (frenar y reportar ante un blocker, sin seguir
auditando), la revision se detuvo ahi -- CORS, rate limiting del formulario publico y headers de
respuesta quedan sin revisar hasta recibir instruccion.

Confirmado de forma incidental (ya leido `src/routes/public.ts` antes de llegar al blocker):
`GET /api/disponibilidad` solo devuelve `hora_inicio`/`disponible` (bool), y el `409` de
`POST /api/reservas` devuelve unicamente `{"error": "turno ya no disponible"}` -- ninguno de los
dos expone nombre/telefono de otro jugador. Todas las queries de `public.ts`/`panel.ts` usan
prepared statements parametrizados (sin concatenacion de input de usuario en SQL). Pendiente sin
revisar: CORS (no se leyo `src/index.tsx`), rate limiting del formulario publico, headers de
respuesta (CSP/X-Frame-Options). `.dev.vars` confirmado gitignoreado y no trackeado;
`.dev.vars.example` sin secrets reales.

Reporte completo entregado al humano en la conversacion; sin fixes aplicados (regla del rol).

[2026-08-04] security-reviewer: continuacion de la auditoria tras fix de api-developer sobre el
blocker. **Verificado por cuenta propia, no dado por bueno solo por el aviso del coordinador**:
releida `wrangler.jsonc` (ya no fija `ENVIRONMENT` en `vars`, default ahora fail-closed;
`workers_dev: false` explicito), `package.json` (`deploy` ahora es guardia `echo ... && exit 1`;
`dev:worker` pasa `--var ENVIRONMENT:development` explicito solo para local) y
`src/auth/middleware.ts` (logica de `esDev()`/`requireAccess` sin cambios, seguia siendo correcta
antes -- el problema nunca fue la logica, era el default). **Blocker: FIXED, confirmado.**

Retomada la auditoria en CORS, rate limiting y headers de respuesta (`src/index.tsx`,
`src/renderer.tsx`, `wrangler.jsonc` -- sin `hono/cors`, sin `hono/secure-headers`, sin binding KV
pese a que `wiki/index.md` documenta "KV: rate limit del formulario publico" como parte del stack
planeado, no implementado en este modulo):

- CORS: ausente por completo (sin middleware, sin headers manuales). No es hallazgo -- el default
  de ausencia de `Access-Control-Allow-Origin` es deny-by-default para lectura cross-origin, y la
  arquitectura actual es same-origin (Hono sirve pagina + API). Suggestion: si en el futuro se
  necesita un widget embebible en otro dominio del club, agregar CORS con allowlist explicita de
  origen, nunca wildcard, especialmente en `/api/panel/*` que usa cookie de Access.
- Rate limiting: **ausente en `POST /api/reservas` y `GET /api/disponibilidad`**, sin Turnstile/
  CAPTCHA. Warning: superficie de abuso real (spam de reservas contra el mismo club, agotamiento
  de turnos por bots) sobre un endpoint publico por diseno -- no es bypass de auth ni exposicion de
  datos, por eso no es blocker segun la tabla de severidad de este rol.
- Headers de respuesta: **sin CSP, sin X-Frame-Options/frame-ancestors, sin X-Content-Type-Options**
  en ninguna ruta (paginas SSR ni respuestas JSON). Warning: hardening basico ausente, en particular
  proteccion anti-clickjacking en `/panel` (superficie privilegiada). Nota para quien aplique el fix:
  `src/components/ClientScript.tsx:21` tiene un `<script>` inline -- una CSP con `script-src 'self'`
  sin nonce lo rompe, hay que resolverlo con nonce (via `jsxRenderer`) o moviendo el script a un
  archivo externo antes de endurecer.
- Hallazgo adicional no pedido explicitamente pero relacionado (CORS/cookies): `requireAccess`
  acepta el JWT via cookie `CF_Authorization` ademas del header `Cf-Access-Jwt-Assertion`
  (`src/auth/middleware.ts:25`). Sin verificar en este repo el atributo `SameSite` que Cloudflare
  Access le pone a esa cookie, `POST /api/panel/reservas/:id/cancelar` (accion que cambia estado)
  no tiene ninguna defensa adicional propia contra CSRF (sin chequeo de `Origin`/`Referer`).
  Suggestion: agregar chequeo de `Origin` como defensa en profundidad, no depender solo de
  `SameSite` del lado de Access.
- Secrets, D1 (prepared statements) y no-exposicion de datos de otros jugadores en el formulario
  publico: sin cambios respecto a lo ya confirmado en la entrada anterior.

Sin fixes aplicados (regla del rol). Memoria del agente actualizada con el patron confirmado y su
estado FIXED.

[2026-08-04] api-developer: fix del blocker confirmado por qa-engineer y security-reviewer,
worktree reserva-cancha. Cambio acotado en 3 archivos, sin tocar logica de negocio ni
`src/auth/middleware.ts` (ese codigo ya era fail-closed, el problema era el default committeado).

`wrangler.jsonc`: sacado `vars.ENVIRONMENT = "development"` -- ya no hay ningun default de
`ENVIRONMENT` en el archivo, asi que sin `--var`/`.dev.vars` explicito el Worker corre fail-closed
(`esDev()` devuelve false). Agregado `workers_dev: false` explicito, con comentario documentando
que faltan `routes` (sin dominio de staging asignado todavia) y que el pipeline real es W4P
(ADR-0001), no `wrangler deploy` directo.

`package.json`: `dev:worker` ahora es `wrangler dev --var ENVIRONMENT:development` -- el bypass de
dev se sigue activando solo con `npm run dev`, sin que el default viva en `wrangler.jsonc` ni el
humano tenga que crear `.dev.vars` a mano. `deploy` reemplazado por una guardia (`echo` +
`exit 1`) que explica que el pipeline real es W4P y que este script no es el camino hasta que
devops lo arme; ya no ejecuta `wrangler deploy`.

`.dev.vars.example`: comentario actualizado para reflejar que `ENVIRONMENT` ya no sale de
`wrangler.jsonc` sino del `--var` de `npm run dev`, y que el archivo solo hace falta si se quiere
forzar el flujo real de Access en local.

Verificado con `wrangler dev` real (no solo lectura de codigo): sin `--var` (`wrangler dev --port
18787`), `GET /api/panel/reservas` -> `403 {"error":"forbidden"}` (fail-closed por default, antes
bypasseaba). Con `--var ENVIRONMENT:development` (el comando real de `npm run dev`), mismo request
-> `200` con el listado de reservas via `dev@local`, igual que antes del fix. `npm run deploy` ->
exit 1 con el mensaje de guardia, no llega a invocar `wrangler deploy`. `tsc --noEmit` limpio.

No commiteado (regla dura). Pendiente para devops: definir `routes` de staging antes del primer
deploy real via W4P.

[2026-08-04] ux-reviewer: auditoria de UX/accesibilidad sobre la app corriendo (`npm run dev`,
worktree reserva-cancha), `/reservar` y `/panel` con Playwright real, protocolo de usuario adverso
y verificacion WCAG 2.1 AA. Detalle completo, severidades y ruteo en wiki/index.md seccion
"## UX Audit". Resumen: **NO listo para staging**, 5 blockers (contraste real ~1.19:1 en boton
"Volver" -- confirmado visualmente, severidad elevada sobre lo que QA reporto como warning --,
contraste 3.41:1 en "Si, cancelar reserva", contraste 4.22:1 en "Confirmar reserva"/chip
activo/avatar -- sistemico del token accent+on-dark heredado del framework --, Modal de
cancelacion sin focus-trap real -- Tab escapa a elementos de fondo con el modal abierto,
confirmado con teclado real --, y ningun estado final del formulario publico -exito/409/error-
anunciado a lectores de pantalla) + 5 warnings (error generico + loop de "Reintentar" inutil en
validacion de campos vacios, click en "Confirmar reserva" sin turno elegido sin feedback, nombre de
500 caracteres rompe el layout completo de la pagina de exito por falta de `break-words`, chips de
filtro del panel a 30px de alto en mobile, tabla del panel exige scroll horizontal para llegar a
"Cancelar" en mobile). Confirmado que el caso central del modulo (409 "turno ya no disponible")
funciona bien end-to-end salvo el aria-live, y que la carrera de 10 requests concurrentes via curl
da resultados limpios (1x201/9x409, sin 500, sin duplicados en D1) consistente con lo que QA ya
documento -- una repeticion de la misma carrera disparada desde dentro del browser (compitiendo con
la carga de la propia auditoria) sí produjo 500s intermitentes y un crash de `wrangler dev`, anotado
como posible artefacto de entorno sin confirmar, no como hallazgo de producto. Ruteo mayoritario a
design-lead (contraste de tokens heredados, focus-trap sin especificar, DataTable/FilterBar sin
adaptacion mobile, estado `error` que conflaciona validacion con fallas de red) y dos items a
frontend-developer (aria-live faltante en `buildDangerAlert`/success -el patron ya existe en el
mismo archivo para otros casos-, y `break-words` faltante en el nombre del jugador). Sin fixes
aplicados (fuera de mi scope). Sin commit.

[2026-08-04] design-lead: revision de design.md/PRODUCT.md sobre los blockers/warnings de la
auditoria de ux-reviewer que ruteaban a esta spec (blockers 1-4, warnings 9-10). Calcule contraste
real (formula WCAG de luminancia relativa, sobre los hex exactos de `app.css` y `Button.tsx` de
este worktree, no estimado) para verificar cada fix antes de escribirlo, no solo confiar en el
numero que trajo ux-reviewer:

- **"Volver"**: `outline-light` (1.19:1, confirmado) -> `outline-accent` (verificado 5.01:1).
- **"Si, cancelar reserva"**: `bg-danger text-on-dark` (3.41:1, confirmado) -> `bg-danger text-ink`
  (4.58:1 -- el maximo alcanzable con los tokens actuales para este par, `--color-danger` no tiene
  tint/hover propio; margen mas ajustado que el resto, anotado en design.md por si el proyecto
  define paleta propia mas adelante).
- **CTA "Confirmar reserva"/sistemico**: `bg-accent text-on-dark` (4.22:1, confirmado) ->
  `bg-accent-tint text-ink border-accent` (8.62:1). Encontre que el mismo par fallido se repetia
  en mas lugares de los que nombro el hallazgo: turno seleccionado de `TurnosGrid`
  (`turnoSeleccionado`/`TURNO_SELECCIONADO`), ademas del chip activo y el avatar de `AppShell` que
  si nombro el audit -- los cuatro quedaron con el mismo fix en design.md seccion 6/7. Agregadas
  dos entradas a framework-backlog.md: el patron `accent`+`on-dark` (afecta al default AFOLAP
  entero, no solo a este proyecto) y el boton "Cerrar" de `Modal`/`Drawer` sin area de toque
  minima (encontrado al resolver el touch-target de "Volver"/"Cerrar" del blocker 1, mismo
  componente framework, no exclusivo de erp-padel).
- **Focus-trap del Modal**: PRODUCT.md seccion 7 tenia una redaccion ambigua ("sin trampas de
  foco") que confundia focus-trap correcto (ARIA dialog) con focus-trap como anti-patron --
  corregida ahi tambien, no solo en design.md, porque el origen de la ambiguedad era mio.
  design.md ahora tiene el criterio completo: ciclo Tab/Shift+Tab dentro del `[data-overlay]`,
  nada de la pagina de fondo alcanzable por teclado con el modal abierto (Esc y foco de retorno ya
  funcionaban bien, no los toque).
- **Chips de filtro (30px)**: `min-h-11` (44px) sobre `chipClass` de `panel.tsx`, mismo fix
  anotado como addendum en la entrada de FilterBar de framework-backlog.md para que el componente
  compartido no repita el hueco.
- **Tabla del panel en mobile**: sin patron responsive propio en `DataTable`/`Table` del
  framework (confirmado leyendo el codigo) -- specifique vista de tarjetas propia de esta pagina
  bajo `sm` (una tarjeta por reserva, mismos datos que las columnas, boton Cancelar de ancho
  completo), no scroll horizontal con prioridad de columnas, porque el principio de "escaneo
  rapido" del panel (PRODUCT.md seccion 6) pesa mas que preservar el layout de tabla en mobile.

Sin tocar `src/**`. Pendiente: frontend-developer implementa el diff, ux-reviewer re-audita antes
de devops. Sin commit.

[2026-08-04] design-lead: segunda pasada del mismo dia sobre design.md, exclusivamente sobre el
warning 6 de la auditoria de ux-reviewer (formulario publico sin distinguir error de validacion
de error de servidor/red -- loop de "Reintentar" reenviando el mismo payload vacio). Quedaba
afuera de la revision anterior a proposito, para no mezclarlo con los blockers 1-4/warnings 9-10.

- Lei `src/routes/public.ts` completo (sin tocarlo) para confirmar el contrato real de
  `POST /api/reservas`: TODOS los 400 devuelven `{"error": "<mensaje>"}` con texto de validacion ya
  redactado en espanol simple (`cancha_id invalido`, `fecha invalida...`, `hora_inicio invalida...`,
  `jugador_nombre requerido`, `jugador_telefono requerido`, `el club no atiende ese dia`,
  `hora_inicio no coincide con la grilla`) -- ninguno es un error de servidor disfrazado de 400.
  Eso confirmo que el status code alcanza como criterio de distincion, sin necesidad de parsear el
  texto del mensaje.
- design.md seccion 7 (`ReservaForm`) separaba `error` en un unico estado para 400/404/500/red. Lo
  dividi en dos: `invalid` (400, nuevo) muestra el texto literal de `body.error` en el `Alert`,
  sin boton "Reintentar" (reenviar el mismo payload sin cambios repite el fallo -- es exactamente
  el loop reportado), y en su lugar devuelve el formulario a estado interactivo para que el
  jugador corrija el campo y reenvie por el submit normal. `error` (ahora solo 404/500/red) se
  mantiene sin cambios: copy generico + "Reintentar", porque ahi si puede ser transitorio y no hay
  mensaje seguro y especifico que mostrar (404 "cancha no encontrada" es una condicion de datos,
  no un error de tipeo del jugador).
- Agregue el criterio de deteccion explicito para `ClientScript`: `response.status === 400` ->
  `invalid`, cualquier otro status o excepcion de `fetch` -> `error`. Solo el status code, nunca el
  contenido del mensaje.
- Actualice la lista de `data-state` posibles en la intro de `ReservaForm` (agrega `invalid`) y el
  checklist de seccion 9 (componentes implementados) para reflejar que el warning 6 tambien esta
  cerrado a nivel de spec.
- Nota: el `Alert` de `invalid` necesita el mismo `role`/`aria-live` que le falta al `Alert` de
  `error` (blocker 5 de la misma auditoria, ya rutea a frontend-developer) -- lo deje anotado en la
  spec como el mismo fix aplicado a un segundo estado, no como un gap nuevo separado.

Sin tocar `src/**`. Pendiente: frontend-developer implementa el split `invalid`/`error` (en
paralelo ya esta implementando el resto del diff de la revision anterior); ux-reviewer re-audita
el flujo completo del formulario antes de devops. Sin commit.

[2026-08-04] frontend-developer: implementacion del diff de UX especificado por design-lead
(blockers 1-4 + warnings 9-10, primera revision de design.md) mas los tres items ruteados directo
a mi rol (blocker 5, warnings 7 y 8). Todo verificado contra la app corriendo (`wrangler dev` local
+ D1 local con los datos ya sembrados por sesiones previas de auditoria, incluida la reserva con
nombre de 500 caracteres), no solo lectura de codigo -- Playwright real via claude-in-chrome.

**Colores (spec literal de design.md seccion 6, mismo par `accent-tint`+`ink` en todos lados):**
`Button` variant `accent` (`src/components/ui/Button.tsx`), boton "Confirmar reserva" de
`ReservaForm.tsx` (clase inline duplicada), `turnoSeleccionado` en `TurnosGrid.tsx` +
`TURNO_SELECCIONADO` en `ClientScript.tsx`, `chipClass` de `panel.tsx`, avatar de iniciales y badge
de nav de `AppShell.tsx`. `Button` variant `danger`: `text-on-dark` -> `text-ink` (3.41:1 ->
4.58:1). Verifique los tres contrastes resultantes con `getComputedStyle` real en el navegador
(formula WCAG de luminancia relativa, no el numero teorico): `accent-tint`+`ink` = 8.62:1,
`danger`+`ink` = 4.58:1, `outline-accent` (`text-accent` sobre `surface-1`) = 5.01:1 -- los tres
calzan exacto con lo que design.md preveia.

**Modal de cancelacion:** boton "Volver" `outline-light` -> `outline-accent` + `min-h-11` explicito
(medido 44.75px real, sobre el minimo). Boton "Cerrar" (X): area de toque ampliada a 44x44px
exacto via selector CSS scoped `[data-overlay="cancelar-reserva"] header button` en `app.css` (sin
forkear `Modal` -- decision documentada en framework-backlog.md con el addendum correspondiente).
Focus-trap real: agregue un listener de `keydown` generico en `ClientScript.tsx` (seccion
"Overlays genericos") que recalcula el set de focuseables de `[data-overlay][data-open]` en CADA
Tab (no lo cachea al abrir) y cicla Tab/Shift+Tab dentro del overlay. Verificado con teclado real:
Shift+Tab desde el primer elemento (Cerrar) salta al ultimo (Si, cancelar reserva) y viceversa,
Tab normal entre medio sigue funcionando, Esc sigue cerrando y devolviendo foco al trigger (no
tocado, ya andaba bien).

**Panel -- chips y DataTable mobile:** `min-h-11` en `chipClass`. Vista de tarjetas bajo `sm`
(`hidden sm:block` en la tabla -- la clase la aplique al `<table>` mismo, no al div wrapper de
`Table.tsx`, porque `DataTable`/`Table` no exponen un slot de clase para ese wrapper; funciona
igual porque el navegador genera una caja anonima de tabla para los hijos con display interno de
tabla; confirmado visualmente, la tabla se sigue viendo bien en desktop) y `sm:hidden` en la lista
de tarjetas nueva (mismos `rows`, layout segun design.md seccion 7: header hora+`StatusBadge`,
pares label/valor, boton Cancelar ancho completo si `confirmada`). La libreria `resize_window` de
claude-in-chrome no cambio el viewport real en este sandbox (`window.innerWidth` se mantuvo fijo
pese a reportar exito) -- verifique la composicion forzando el ancho del contenedor por CSS
inyectado y togueleando las clases a mano, mas inspeccion directa de las clases `hidden sm:block`/
`sm:hidden` en el DOM para confirmar que el breakpoint esta bien puesto en el markup. Detalle en
memoria de agente (`feedback_mobile_viewport_verification.md`).

**Blocker 5 (aria-live):** `role="status" aria-live="polite"` en los tres bloques finales del
formulario publico (`data-state="conflict"`, `="error"` y el `data-success-card`, los tres en
`ReservaForm.tsx`) y en `buildDangerAlert` de `ClientScript.tsx` (usado para el error de red al
pedir disponibilidad -- no lo usan los estados `conflict`/`error` del formulario, esos son bloques
SSR estaticos con `Alert`, corregi la premisa del hallazgo pero aplique el mismo patron en los tres
lugares reales donde faltaba).

**Warning 7 (sin feedback al confirmar sin turno):** en `doSubmit` de `ClientScript.tsx`, ahora
siempre hace `scrollIntoView` de la grilla; si hay al menos un turno disponible, foca el primero
(comportamiento previo, sigue andando); si la grilla esta vacia (el caso que rompia antes, sin
adonde mover el foco), muestra un texto "Elegi un horario para continuar." (`role="status"
aria-live="polite"`) debajo de la grilla, que se limpia solo al elegir turno o al re-pedir
disponibilidad. Verificado en vivo con fecha sin horarios: el mensaje aparece, es legible, y
desaparece al elegir un turno valido despues.

**Warning 8 (break-words) -- encontrado en TRES lugares, no uno:** el reportado
(`data-success-nombre` en `ReservaForm.tsx`) mas dos que encontre al verificar visualmente con la
reserva de 500 caracteres ya sembrada en D1 local: la fila "Jugador" de la vista de tarjetas mobile
que acabo de construir (mismo bug que hubiera introducido sin darme cuenta si no verificaba con
datos reales), y el `<strong data-cancel-jugador>` del cuerpo del Modal de cancelacion en
`panel.tsx` -- este ultimo mas grave que el original: al ser el Modal `position:fixed`, el texto
desbordado quedaba cortado fuera de la pantalla sin forma de scrollear hasta el, no solo
ensanchaba la pagina. Los tres llevan `break-words` (mas `min-w-0`/`shrink-0` donde el contenedor
es flex) ahora. Verificado con `scrollWidth` antes/despues en los tres casos (via
`javascript_tool`): el de `ReservaForm` bajo de 5192px a 1366px (documentWidth normal, cero
overflow), el de la tarjeta mobile de 5049px a 390px (igual al contenedor forzado), y el del Modal
de un `right` de 4173px a 899px (dentro del card de 480px de ancho). Documentado en memoria de
agente (`feedback_break_words_incidental_bugs.md`) para que la proxima sesion busque el mismo
patron en cualquier archivo que toque, no solo en el punto que nombra el hallazgo.

**MISMATCH detectado a mitad de sesion, sin resolver, dejo explicito para la proxima vuelta:**
design-lead corrio una SEGUNDA revision de `design.md` el mismo dia (ver entrada de arriba,
"segunda pasada... warning 6"), agregando el estado `invalid` a `ReservaForm` (split
`invalid`/`error` de la validacion 400 vs servidor/red) DURANTE mi sesion -- el archivo que lei al
empezar no lo tenia, el que quedo al terminar si. Mi tarea me instruyo explicitamente NO tocar esa
separacion ("llega en una vuelta separada... no lo inventes vos"), asi que NO implemente el estado
`invalid` ni el split de deteccion en `ClientScript.tsx` (`response.status === 400`), pese a que la
seccion 9 de `design.md` (linea ~533) ahora lo lista como parte del mismo "pendiente: frontend-
developer implementa el diff completo". Sigo la instruccion explicita que recibi por sobre el
checklist de `design.md`, pero dejo la inconsistencia marcada: **falta implementar el estado
`invalid` (Alert con `body.error` literal, sin boton Reintentar, formulario vuelve a interactivo) y
el criterio de deteccion por status code en `ClientScript.tsx`** antes de que el modulo este
completo segun la spec vigente. No es parte de lo que corri en esta sesion.

**Verificacion:** `tsc --noEmit` limpio (dos corridas, antes y despues de los fixes incidentales de
break-words). `wrangler dev` local levantado con `npm run dev`, D1 local con
`wrangler d1 migrations apply --local` (sin migraciones pendientes, datos de sesiones previas
todavia presentes). Playwright real via claude-in-chrome contra `/reservar` y `/panel`: seleccion
de turno y color resultante, submit exitoso con nombre largo, submit sin turno (grilla con y sin
turnos), Modal de cancelacion completo (contraste de los tres controles, area de toque del cierre,
focus-trap con teclado real en ambas direcciones, Esc, wrap del nombre largo), vista de tarjetas
mobile (verificada por CSS forzado, ver nota arriba sobre `resize_window`). Sin errores de consola
durante las pruebas. Sin captures conservados en el repo.

Cambios en `src/components/ui/Button.tsx`, `src/components/reservas/ReservaForm.tsx`,
`src/components/reservas/TurnosGrid.tsx`, `src/components/app/AppShell.tsx`,
`src/components/ClientScript.tsx`, `src/pages/panel.tsx`, `src/styles/app.css`. Dos addenda en
`workspace/framework-backlog.md` (correccion de contraste de `danger`, eleccion de implementacion
del boton "Cerrar" del Modal). Sin commit (regla dura).

[2026-08-04] frontend-developer: split de estado `invalid`/`error` en `ReservaForm.tsx` +
`ClientScript.tsx` (warning 6, spec agregada por design-lead a `design.md` seccion 7 mientras
corria la sesion anterior -- ver el MISMATCH documentado en la entrada previa, ahora resuelto).

- Agregue el sexto `data-state` (`invalid`) al patron ya existente en `ReservaForm.tsx`
  (`group-data-[state=invalid]:block`, mismo mecanismo que `conflict`/`error`): un `Alert
  tone="danger"` con un unico nodo `<p data-invalid-message>` vacio en SSR, sin boton
  "Reintentar" (a diferencia del bloque `error`), con `role="status" aria-live="polite"` (mismo
  patron del blocker 5, la spec lo pedia explicito para este estado tambien).
- En `doSubmit()` de `ClientScript.tsx` agregue la rama `r.status === 400`: escribe
  `r.body.error` (el mensaje literal que ya devuelve `POST /api/reservas`) en
  `[data-invalid-message]` y hace `setFormState('invalid')`. El formulario ya queda interactivo
  sin codigo extra: `submitBtn.disabled = false` y el texto del boton ya se resetean arriba, para
  TODAS las ramas de respuesta, antes del `if`. El resto del criterio de deteccion (409 ->
  conflict, cualquier otro status o excepcion de `fetch` -> error) queda sin tocar.
- Probado el 400 real de punta a punta: `curl` directo confirmo `{"error":"jugador_nombre
  requerido"}` con status 400 (cancha+fecha+turno validos, nombre/telefono vacios). Repeti el
  mismo caso en el navegador via claude-in-chrome (seleccion real de cancha/fecha/turno, submit
  con campos vacios): el estado paso a `invalid`, el mensaje literal de la API aparecio
  (`jugador_nombre requerido`), SIN boton "Reintentar", con el turno seleccionado y
  cancha/fecha/turno intactos, y el formulario totalmente interactivo (verificado tocando cada
  campo). Complete Nombre/Telefono sobre el mismo formulario (sin recargar la pagina) y reenvie
  por el submit normal: la reserva se creo (201, `data-state` paso a `success`) -- confirma que el
  loop inutil del warning 6 original esta roto, corregir el dato y reenviar funciona sin
  mecanismo nuevo. Confirme tambien el `role="status" aria-live="polite"` presente en el bloque
  `invalid` renderizado. Sin errores de consola durante la prueba.
- `tsc --noEmit` limpio antes y despues del cambio.

Con este item, blockers 1-4 y warnings 5-10 de la auditoria original de ux-reviewer quedan todos
cerrados a nivel de codigo. Pendiente unicamente la re-auditoria de ux-reviewer contra la app
corriendo antes de devops. Cambios en `src/components/reservas/ReservaForm.tsx` y
`src/components/ClientScript.tsx`. Sin commit (regla dura).

[2026-08-04] ux-reviewer: re-auditoria de UX/accesibilidad contra la app corriendo (`npm run dev`,
worktree reserva-cancha), segunda pasada tras el diff completo de frontend-developer sobre los 5
blockers + 5 warnings de la auditoria original. Playwright real via `claude-in-chrome` (no lectura
de codigo ni confianza en lo que reportaron design-lead/frontend-developer en sus entradas
anteriores), mismo rigor que la primera pasada: calculo exacto de contraste sobre `getComputedStyle`
(formula WCAG de luminancia relativa), teclado real para el focus-trap, `curl` en paralelo para
reproducir el 409 de verdad, doble click real en los dos botones criticos.

**Veredicto: LISTO PARA STAGING.** Los 10 hallazgos originales (5 blockers + 5 warnings) cierran,
verificados uno por uno contra la app corriendo. Sin hallazgos nuevos.

- **Blockers 1-3 (contraste)**: "Volver" 5.005:1, "Si, cancelar reserva" 4.584:1, y el par
  `accent-tint`+`ink` en los 4 lugares (CTA, turno seleccionado, chip activo, avatar) 8.623:1 --
  los tres calzan exacto con lo que design-lead calculo en `design.md`. Area de toque del "Cerrar"
  del Modal: 44x44px exacto. Chips de filtro: 44px de alto exacto.
- **Blocker 4 (focus-trap)**: Tab/Shift+Tab reales confirman el ciclo completo dentro del
  `[data-overlay]` en ambas direcciones, sin que ningun elemento de la pagina de fondo reciba foco.
  Esc y foco de retorno siguen andando (no se tocaron).
- **Blocker 5 (`aria-live`)**: los 4 estados (`success`, `conflict`, `invalid`, `error`) tienen
  `role="status" aria-live="polite"`. Verificado dinamicamente en los 3 estados que logre disparar
  de verdad en el navegador: `success` (reserva real), `conflict` (409 real, turno robado por
  `curl` en paralelo mientras el formulario estaba completo en pantalla) e `invalid` (400 real).
- **Warning 6 (split invalid/error)**: 400 real con Nombre/Telefono vacios -> mensaje literal de la
  API, sin boton "Reintentar" (confirme que el unico "Reintentar" del DOM vive oculto dentro del
  bloque `error`), formulario interactivo, reenvio sin recargar funciona. Forzando un `cancha_id`
  inexistente (999, inyectado sin disparar `change` para no contaminar con un refetch) confirme que
  el 404 real sigue cayendo en `error` generico con "Reintentar" funcional -- el split no rompio el
  camino que ya andaba.
- **Warning 7 (sin turno seleccionado)**: con grilla vacia, aparece "Elegi un horario para
  continuar." (`role="status"`) y hace scroll a la grilla.
- **Warning 8 (break-words)**: confirmado en el Modal de cancelacion del panel (nombre de 500
  caracteres envuelve dentro de la tarjeta de 480px, sin desbordar la pagina) y en una simulacion
  aislada de la tarjeta mobile a 390px de ancho (ver nota de entorno). No repeti la prueba en el
  bloque de exito del formulario publico (ya confirmado en la primera pasada, archivo no tocado
  para este punto en esta ronda).
- **Warning 9 (chips `min-h-11`)**: 44px de alto real, no gateado por breakpoint.
- **Warning 10 (`DataTable` mobile)**: verificado estructuralmente -- `<table>` con
  `hidden sm:block`, wrapper de tarjetas con `sm:hidden`, media query compilado en
  `public/styles.css` confirma `@media (width >= 40rem)` (640px, breakpoint `sm` estandar sin
  alteraciones). Simulacion aislada (clon del wrapper en contenedor de 390px fijo) confirma que las
  4 tarjetas de una fecha con reservas renderizan sin scroll (hora+`StatusBadge`, pares
  label/valor, boton "Cancelar" ancho completo) y sin overflow con el nombre de 500 caracteres. La
  tabla desktop sigue con su scroll horizontal contenido, sin romper la pagina.

**Protocolo de usuario adverso repetido** sobre lo que esta ronda toco (`ClientScript.tsx`,
`panel.tsx`): doble click en "Confirmar reserva" (una sola reserva) y doble click en "Si, cancelar
reserva" (una sola cancelacion) -- sin regresion. No repeti la carrera de 10 requests concurrentes
ni el refresh post-reserva ni cancelar-dos-veces: ninguno de los archivos que las involucran
cambio en esta ronda, ya estaban confirmados limpios en la primera pasada.

**Nota de entorno:** `resize_window` de `claude-in-chrome` no cambia el viewport real en este
sandbox (mismo problema que documento frontend-developer en su memoria de agente, confirmado de
nuevo de forma independiente en dos tabs distintas). Para el punto 10 use verificacion estructural
(clases + media query compilado) mas una simulacion aislada por clonado de nodo a ancho fijo, en vez
de un resize de viewport real.

Sin errores de consola en ningun tab durante toda la sesion. Sin errores en el log de `wrangler dev`.
`npm run dev` levantado y detenido limpio al terminar (sin dejar el proceso corriendo).

Documentado en `wiki/index.md` seccion "## UX Audit" (subseccion "Re-auditoria (2026-08-04,
ux-reviewer, segunda pasada)"), sin borrar el historico de la auditoria original. Sin cambios en
`src/**` ni en `design.md` (regla dura del rol). Gate de UX para pasar a `devops`: **LISTO PARA
STAGING**.

[2026-08-04] Cierre de la corrida e2e del Modulo 1 (Reserva de cancha). Cadena completa:
software-architect -> database-architect -> api-developer -> design-lead -> frontend-developer ->
qa-engineer (SHIP CON FIXES, blocker de auth encontrado y arreglado) -> security-reviewer (blocker
confirmado y cerrado, 2 warnings abiertos) -> ux-reviewer (NO listo -> ronda de fixes de
accesibilidad con design-lead y frontend-developer -> re-auditoria: LISTO PARA STAGING) ->
devops (plan de staging, sin ejecutar nada contra la cuenta CF real -- confirmado con el humano
antes de invocarlo). Hallazgo no anticipado de devops: Workers for Platforms (ADR-0001) no esta
comprado en la cuenta CF real, bloqueando la ejecucion del plan hasta que el humano lo habilite en
el dashboard. Desviacion de proceso a documentar: parte del fix pass de UX se completo fuera de
esta sesion (otra cuenta, tras corte por limite de sesion) y genero 4 commits locales en la rama
del worktree sin pasar por el flujo de confirmacion humana de CLAUDE.md; no se revirtieron, se
verificaron (tsc limpio, diff completo revisado, log del worktree leido). Auditoria completa,
orden de agentes, entregables, friccion y tiempos reales: corrida-e2e.md. Codigo, schema, specs y
plan de staging quedan en `.claude/worktrees/reserva-cancha` (rama `worktree-reserva-cancha`), sin
mergear a main, sin pushear. Commit de esta sesion en el checkout principal (reconciliacion +
ADR-0001 + cierre) preparado y pendiente de confirmacion humana, no ejecutado.


[2026-08-04] devops: plan de staging del Modulo 1, sin ejecutar nada contra la cuenta CF real
(restriccion explicita del humano para esta pasada -- solo planificacion). Documento completo en
`wiki/architecture/plan-staging.md`.

Verificado por lectura contra la cuenta real (MCP cloudflare, solo GET/list, cero escritura):
cuenta `1a5f93adc916c9642a1d1807032bde4a`. **Hallazgo bloqueante no anticipado por ADR-0001**:
`GET /accounts/.../workers/dispatch/namespaces` devuelve error 10121, "no tenes acceso a dispatch
namespaces, comaralo desde el dashboard" -- Workers for Platforms no esta habilitado/comprado en
esta cuenta. No aparece en `/subscriptions` (que si lista Workers Paid $5/mes activo, R2 Paid y
Teams Free Base). Esto no es solo el gap que ADR-0001 dejo abierto ("cuanto sale W4P mas alla de
Workers Paid") -- es mas grave: ni siquiera esta contratado, y habilitarlo es un alta de producto
en el dashboard que el humano tiene que hacer, no un comando de wrangler ni una llamada de API de
devops. Bloquea el primer paso ejecutable del plan.

Tambien verificado por lectura (resuelve incognitas del plan sin adivinar): Zero Trust ya existe a
nivel cuenta compartida (org "IIAPIE", team domain `minerva-setter.cloudflareaccess.com`, Teams
Free Base 50 usuarios) -- erp-padel suma una app nueva a ese team, mismo patron que las apps de
gestoria/afolap ya creadas, no hace falta team nuevo. Subdominio de Workers de la cuenta:
`minerva-setter.workers.dev` (confirmado via `/workers/subdomain`), sirve de URL publica temporal
de staging mientras no haya dominio propio (gap ya conocido, sin zona de erp-padel entre las 4 de
la cuenta). Sin D1 ni Worker de erp-padel creados todavia (13 D1 y 17 Workers en la cuenta, ninguno
de este proyecto).

Plan documentado, en orden: 1) habilitar W4P (humano, dashboard, bloqueante) 2) dispatch namespace
`erp-padel-staging` 3) D1 `erp-padel-club-piloto-staging` (convencion de nombre para Oleada 8:
`<proyecto>-<club>-<entorno>`) 4) migraciones D1 contra esa base -- gate humano explicito aparte
5) Worker dinamico de dispatch (`erp-padel-dispatch-staging`, pieza nueva fuera de `src/**` de
este repo, la unica pieza publica, `wrangler deploy` normal con binding `dispatch_namespaces`)
6) Upload del User Worker (`club-piloto`) al namespace via API (Upload Worker Module, bindings D1/
ENVIRONMENT=staging/ACCESS_* en el metadata, no en `wrangler.jsonc`) 7) app de Cloudflare Access
para `/panel*` reusando el team existente.

Gap de tooling nuevo, no resuelto en el documento: `wrangler.jsonc` de este repo apunta a
`src/index.tsx` (TSX) pero el Upload Worker Module pide JS ya bundleado -- falta un script de
build propio para W4P antes de que el paso de upload sea ejecutable sin improvisar.

Verificacion post-deploy especificada segun ADR-0009 (workspace global): version real que sirve
trafico (distinto mecanismo para el Worker dinamico -- que si tiene Version ID de Wrangler -- vs
el script dentro del namespace -- que no, se confirma por `etag`/`created_on` del GET del script),
camino critico contra la URL publica de staging (`/health`, `/reservar` con SELECT a D1 remota,
repetir la prueba de concurrencia de 10 requests que QA ya corrio en local pero contra D1 real,
`/panel` sin JWT debe seguir dando 403 -- confirma que el bypass de dev no resucito por un binding
mal subido), migraciones confirmadas contra `sqlite_master` remota, logs reales via `wrangler
tail` durante la corrida de prueba. Sin consumidores asincronicos que verificar (modulo sin Queues/
Cron/Durable Objects).

Ningun recurso creado ni modificado en la cuenta CF. Ninguna migracion aplicada. Sin commit (el
plan es un archivo nuevo bajo `wiki/`, pendiente del mismo criterio de confirmacion humana para
commit que el resto de la sesion).

[2026-08-04] devops: PRIMER DEPLOY REAL a staging del Modulo 1, para probar de punta a punta la verificacion post-deploy de ADR-0009 (que hasta hoy estaba escrita pero nunca ejercitada). Alcance acotado por el humano: solo Workers Paid, sin Workers for Platforms -- es decir `wrangler deploy` directo, no el pipeline de dispatch namespace que plantea ADR-0001, que sigue bloqueado por la compra de W4P. Recursos creados en la cuenta 1a5f93adc916c9642a1d1807032bde4a: D1 `erp-padel-reserva-cancha-staging` (id f7f749ad-80c2-4763-b958-d8b25d6df5fd) y el Worker `erp-padel-reserva-cancha` publicado en https://erp-padel-reserva-cancha.minerva-setter.workers.dev. Para eso `workers_dev` paso de false a true: security-reviewer lo habia puesto en false a proposito, y se revierte SOLO para este ejercicio (ver Pendiente al pie). Gate de staging cumplido: typecheck limpio; el proyecto no tiene script de lint. Migraciones 0001 y 0002 aplicadas con --remote. Los 5 pasos de ADR-0009 corridos en orden, y el ejercicio valio la pena porque tres de los cinco encontraron algo. PASO 1: Version ID 821da05a-581b-4d3e-9451-0e0292357513 capturado del output de `wrangler deploy`. PASO 2: `wrangler deployments status` confirma esa misma version al 100% del trafico, sin deployment gradual. PASO 3 (camino critico real, no la raiz): la primera pasada dio /reservar 200 pero /panel y /api/panel/reservas 404, y una segunda pasada inmediata dio /reservar 404 -- las dos anomalias eran PROPAGACION, no bugs: repetido un minuto despues, /reservar da 200 ocho de ocho veces y /panel da 403. Es exactamente el fenomeno que motiva la regla ("salio 0" no es "esta vivo sirviendo el codigo nuevo"): un agente que declaraba done con el exit code del deploy habria reportado exito, y uno que miraba una sola vez habria reportado un 404 falso. PASO 4 (migraciones verificadas CONTRA la base, no por exit code): aca aparecio el hallazgo grande. `wrangler d1 migrations apply` reporto ambas migraciones con tilde verde, y las 4 tablas quedaron creadas -- pero `SELECT` contra la base remota devolvio canchas=0 y horarios=0, y en consecuencia TODO POST /api/reservas respondia 404 "cancha no encontrada". La app deployaba, servia HTML y era completamente inusable. Causa: el proyecto no tiene seed data en ninguna parte -- ni en las migraciones (los 3 "INSERT" que aparecen en 0001 son menciones dentro de comentarios, no sentencias) ni en un directorio seeds/. En local los datos se habian cargado a mano y nunca quedaron como artefacto, que es literalmente el item 4 del checklist de habilitacion de worktrees ("documentar como reponer la D1 local") que corrida-e2e.md ya habia marcado como incumplido. Se creo `seeds/seed_club_demo.sql` (3 canchas, una inactiva a proposito para cubrir la baja logica; 7 filas de horarios, turnos de 90 minutos; idempotente via INSERT OR IGNORE sobre los UNIQUE) y se aplico con --remote: canchas=3, horarios=7 verificado por SELECT. Recien ahi el camino critico cierra: POST /api/reservas -> 201 con la reserva creada. CARRERA CONTRA LA BASE REMOTA, que hasta hoy solo se habia probado contra D1 local: 10 POST concurrentes al mismo turno -> 1x201 y 9x409, y `SELECT COUNT(*)` sobre ese turno con estado confirmada devuelve exactamente 1. El indice unico parcial aguanta en condiciones reales, no solo en miniflare. PASO 5 (logs): `wrangler tail --format json` durante trafico real -- 2 eventos capturados, los dos con outcome=ok, cero excepciones, y el campo scriptVersion.id de cada uno coincide con el Version ID del paso 1, que es la confirmacion mas fuerte posible de que la version que sirve es la que se subio. Nota honesta: el tail capturo 2 de los 3 requests generados, consistente con el sampling que la propia regla advierte. PENDIENTE, decision del humano: el Worker quedo PUBLICO en workers.dev con el formulario de reserva abierto y sin rate limiting (WARNING abierto de security-reviewer desde la corrida). El panel es fail-closed (403 sin JWT de Access, verificado en vivo), asi que no hay exposicion de datos, pero cualquiera que encuentre la URL puede escribir reservas. Recomendacion: bajar el Worker y borrar la D1 al terminar de auditar, o dejarlo solo el tiempo que haga falta.
