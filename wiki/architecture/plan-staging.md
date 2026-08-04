# Plan de staging -- Modulo 1 (Reserva de cancha)

Documento de planificacion. NINGUN comando de este archivo fue ejecutado. Restriccion vigente
confirmada por el humano: sin creacion/mutacion de recursos CF hasta confirmacion explicita para
ejecutar (distinta de la confirmacion para planificar, ya dada).

Arquitectura de referencia: [decisions/0001-modelo-cuentas-cloudflare-multi-club.md](../decisions/0001-modelo-cuentas-cloudflare-multi-club.md)
(Workers for Platforms, cuenta CF compartida, D1 aislada por club). Verificacion post-deploy
segun `/normai/workspace/wiki/decisions/0009-verificacion-post-deploy-y-carreras.md`.

## 0. Estado real de la cuenta CF, verificado por lectura (2026-08-04)

Cuenta: `1a5f93adc916c9642a1d1807032bde4a` (Kirbytomas096@gmail.com's Account). Todo lo de esta
seccion salio de llamadas de solo lectura (`d1_databases_list`, `workers_list`,
`workers/dispatch/namespaces` GET, `/zones`, `/subscriptions`, `/access/organizations`,
`/access/apps`, `/workers/subdomain`) -- cero escritura.

- **HALLAZGO BLOQUEANTE, no estaba en el ADR:** `GET /accounts/.../workers/dispatch/namespaces`
  devuelve error `10121`: *"You do not have access to dispatch namespaces. You can purchase it
  within the Cloudflare dashboard here: https://dash.cloudflare.com?to=/:account/workers-for-platforms"*.
  Workers for Platforms **no esta habilitado en esta cuenta**. No aparece como subscription en
  `/accounts/.../subscriptions` (que si lista Workers Paid activo a USD 5/mes, R2 Paid a USD 0 de
  base, y Teams Free Base). Esto resuelve -- en sentido negativo -- el gap abierto de ADR-0001
  ("costo mensual propio de W4P sin verificar"): no es que el costo sea cero sobre el Workers Paid
  existente, es que el producto ni siquiera esta contratado. Es un alta en el dashboard (compra),
  no una llamada de API ni un `wrangler` command -- **paso 1 del plan, y requiere que el humano lo
  haga el mismo desde el dashboard** (el MCP de solo-API no tiene un endpoint de compra de
  subscription; y aunque lo tuviera, cae bajo "crear/modificar recursos de la cuenta CF").
- Sin D1 de erp-padel/reserva-cancha en la cuenta: los 13 D1 existentes son de otros proyectos
  (gestoria, inmobiliaria, afolap, minerva, etc.). Ninguno se toca.
- Sin Worker de erp-padel en la cuenta (17 Workers listados, ninguno del proyecto).
- **Zero Trust / Access ya existe a nivel cuenta**, compartido con el resto de NORMAI: org "IIAPIE",
  team domain `minerva-setter.cloudflareaccess.com`, plan Teams Free Base (50 usuarios, USD 0).
  No hace falta crear un team nuevo -- erp-padel suma una app nueva al team existente, mismo patron
  que `dev` (gestoria) y `crm-afolap-mailbox` ya la usan. Confirma el valor de
  `ACCESS_TEAM_DOMAIN` de `.dev.vars.example` sin adivinarlo.
- Sin zona/dominio propio para erp-padel entre las 4 zonas de la cuenta (afolap.com.ar,
  afolap.org.ar, gestoriaenmovimiento.com.ar, jacordoba-campus.org.ar). Confirma el gap ya
  documentado en `wrangler.jsonc` ("sin dominio de staging asignado").
- Subdominio de Workers de la cuenta: `minerva-setter.workers.dev` (usado por otros Workers de la
  cuenta con `workers_dev: true`, ej. `crm-afolap-mailbox.minerva-setter.workers.dev` como
  destino de Access). Sirve como URL publica temporal de staging mientras no haya dominio propio.

## 1. Recursos a crear, en orden

Cada paso es una accion sobre la cuenta CF real -- gate del proyecto: "Crear/modificar recursos de
la cuenta CF" (`wiki/index.md`). Ninguno se ejecuta sin confirmacion humana explicita, item por
item o en bloque segun decida el humano en ese momento.

### 1.1 Habilitar Workers for Platforms (humano, dashboard)

Bloqueante para todo lo que sigue. `https://dash.cloudflare.com/1a5f93adc916c9642a1d1807032bde4a/workers-for-platforms`.
No hay comando de wrangler ni llamada de API de solo-cuenta que lo resuelva -- es una alta de
producto/subscription. Devops no puede ejecutar este paso por API; lo hace el humano.

### 1.2 Dispatch namespace de staging

Nombre: `erp-padel-staging` (ADR-0001 seccion "Arquitectura concreta"). Un solo namespace para
este ejercicio (un solo club piloto); produccion usaria `erp-padel-prod` mas adelante, fuera de
alcance aca.

```
curl -X POST "https://api.cloudflare.com/client/v4/accounts/1a5f93adc916c9642a1d1807032bde4a/workers/dispatch/namespaces" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"erp-padel-staging"}'
```

No existe subcomando de Wrangler para dispatch namespaces (Wrangler v3+ no lo cubre); es API
directa. Verificacion: `GET /accounts/.../workers/dispatch/namespaces/erp-padel-staging` -> 200
con el namespace creado, cero scripts.

### 1.3 D1 de staging del club piloto

Nombre: `erp-padel-club-piloto-staging` (convencion para Oleada 8 -- alta de club nuevo: una D1
por `<slug-proyecto>-<slug-club>-<entorno>`, para que el nombre sea inequivoco entre los ~15 D1 ya
existentes en la cuenta compartida). Gate del proyecto: creacion de recurso CF, confirmacion
explicita.

```
wrangler d1 create erp-padel-club-piloto-staging
```

Captura el `database_id` real del output. Este id va en DOS lugares distintos (no es el mismo
mecanismo, ver seccion 2):
1. `wrangler.jsonc` de este repo (para que `db:apply:remote` y cualquier `wrangler d1` local
   apunten a la base real).
2. El `metadata.bindings` del Upload Worker Module del paso 1.5 (para que el User Worker en el
   dispatch namespace tenga el binding `DB`).

### 1.4 Migraciones D1 contra la base de staging -- GATE HUMANO

`0001_reservas.sql` y `0002_auth.sql` ya estan verificadas como aditivas por qa-engineer (log.md,
entrada del 2026-08-04: "sin `ALTER TABLE` en ninguna de las dos"). Aun asi, aplicar migraciones
D1 en produccion/staging-compartiendo-cuenta-real requiere confirmacion humana explicita segun
CLAUDE.md ("Migraciones D1 en produccion: SIEMPRE requiere confirmacion humana") -- se aplica el
mismo criterio a esta D1 real aunque el entorno se llame "staging", porque la base ya no es local
ni descartable.

```
npm run db:apply:remote
# equivale a: wrangler d1 migrations apply reserva-cancha --remote
```

Nota: el nombre logico en `wrangler.jsonc` (`database_name: "reserva-cancha"`) no tiene que
coincidir con el nombre real en la cuenta (`erp-padel-club-piloto-staging`) -- lo que ata ambos es
el `database_id`, no el nombre. Mantener el `database_name` como esta evita tocar el script de
`package.json`.

### 1.5 Worker dinamico de dispatch (pieza nueva, la unica publica)

ADR-0001, cascada: "devops crea el dispatch namespace de staging y el dynamic dispatch Worker
minimo (routing por hostname a un unico club de prueba alcanza para este ejercicio)". Es un Worker
chico, propio, fuera de `src/**` de este repo (ese directorio es de `api-developer`, ver frontera
de roles). Vive en su propio directorio, ej. `infra/dispatch-worker/` en la raiz del proyecto
erp-padel (no en este worktree de Modulo 1) o un repo/carpeta que devops decida al ejecutar --
queda a definir en la ejecucion, no es parte de este documento de planificacion fijar la carpeta
exacta.

Logica minima para este ejercicio (un solo club, sin resolver hostname todavia porque no hay
dominio):

```js
export default {
  async fetch(request, env) {
    const scriptName = "club-piloto"; // fijo: un solo club en este ejercicio.
    const userWorker = env.DISPATCHER.get(scriptName);
    return userWorker.fetch(request);
  },
};
```

`wrangler.jsonc` de este Worker dinamico (no de este repo):

```jsonc
{
  "name": "erp-padel-dispatch-staging",
  "main": "src/index.js",
  "compatibility_date": "2026-01-01",
  "workers_dev": true, // unico caso donde true es correcto: es la puerta publica de staging
  "dispatch_namespaces": [
    { "binding": "DISPATCHER", "namespace": "erp-padel-staging" }
  ]
}
```

Deploy de este Worker (a diferencia del User Worker del club, este SI es `wrangler deploy`
normal -- no va dentro del dispatch namespace, es lo que lo invoca):

```
wrangler deploy
```

URL publica resultante: `erp-padel-dispatch-staging.minerva-setter.workers.dev` (subdominio de
cuenta confirmado por lectura, seccion 0).

### 1.6 Upload del User Worker del club piloto al dispatch namespace

Este es el paso que reemplaza a `wrangler deploy` para el Worker de Reserva de Cancha en si
(`package.json` de este repo ya bloquea `npm run deploy` a proposito -- ver comentario del script,
no tocar esa guardia hasta que este paso este armado en CI/script real).

Build primero (el asset de CSS tiene que existir antes de subir):

```
npm run build
```

Script name dentro del namespace: `club-piloto`. Bindings a adjuntar en el `metadata` del upload:
`DB` (D1, `database_id` real del paso 1.3), `ASSETS` (assets binding, mismo mecanismo que
`wrangler.jsonc` local pero declarado en el multipart), `ENVIRONMENT` como `plain_text` = `staging`
(NO `development` -- ver seccion 3, esto es lo que mantiene fail-closed el bypass de Access en
este entorno), `ACCESS_TEAM_DOMAIN` y `ACCESS_AUD` como `plain_text`/`secret_text` una vez creada
la app de Access (paso 1.7 -- hay una dependencia circular real: la app de Access necesita conocer
la URL del Worker, y el Worker necesita el AUD de la app; se resuelve creando primero la app de
Access apuntando a la URL del dispatch Worker del paso 1.5, que ya es estable, y recien despues
subiendo el User Worker con el AUD resultante).

```
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/1a5f93adc916c9642a1d1807032bde4a/workers/dispatch/namespaces/erp-padel-staging/scripts/club-piloto" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -F 'metadata={
    "main_module": "index.js",
    "compatibility_date": "2026-01-01",
    "bindings": [
      { "type": "d1", "name": "DB", "database_id": "<database_id real del paso 1.3>" },
      { "type": "plain_text", "name": "ENVIRONMENT", "text": "staging" },
      { "type": "plain_text", "name": "ACCESS_TEAM_DOMAIN", "text": "minerva-setter.cloudflareaccess.com" },
      { "type": "secret_text", "name": "ACCESS_AUD", "text": "<aud tag de la app de Access, paso 1.7>" }
    ]
  };type=application/json' \
  -F 'index.js=@./dist/index.js;type=application/javascript+module'
```

Nota real, no asumida: el `main` de `wrangler.jsonc` de este repo es `src/index.tsx`, un modulo
TSX -- el Upload Worker Module API pide JS ya bundleado (`application/javascript+module`), no TSX
crudo. Falta un paso de build/bundle (`wrangler deploy --dry-run --outdir=dist` es el mecanismo
estandar de Wrangler para generar el bundle sin desplegar, o el `unstable_dev`/build API segun la
version de Wrangler) antes del `curl` de arriba -- **gap de tooling, no resuelto en este
documento**: hoy no existe un script en `package.json` que produzca ese bundle. Devops necesita
armarlo (`wrangler deploy --dry-run --outdir=dist-w4p` o equivalente) antes de que este paso sea
ejecutable de punta a punta, no solo teorico. Ver seccion 4, gap 5.

El asset binding (`ASSETS` -> `public/styles.css`) dentro de W4P tiene su propio mecanismo
(`assets-upload-session`, listado en la seccion 0 de endpoints) distinto del binding simple de
arriba -- no lo expando en detalle aca porque depende de resolver primero el bundle (parrafo
anterior); queda como parte del mismo gap de tooling.

### 1.7 App de Cloudflare Access para el panel del club piloto

Reusa el team existente (`minerva-setter.cloudflareaccess.com`, seccion 0) -- no crear un team
nuevo. Nombre de app: `erp-padel-panel-staging`. Dominio: la URL publica del dispatch Worker
(paso 1.5) acotada a `/panel*` y `/api/panel/*` (el resto -- `/reservar`, `/api/disponibilidad`,
`/api/reservas`, `/health` -- es publico, no va detras de Access).

```
curl -X POST "https://api.cloudflare.com/client/v4/accounts/1a5f93adc916c9642a1d1807032bde4a/access/apps" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "erp-padel-panel-staging",
    "type": "self_hosted",
    "domain": "erp-padel-dispatch-staging.minerva-setter.workers.dev/panel",
    "self_hosted_domains": [
      "erp-padel-dispatch-staging.minerva-setter.workers.dev/panel",
      "erp-padel-dispatch-staging.minerva-setter.workers.dev/api/panel"
    ],
    "session_duration": "24h",
    "app_launcher_visible": false
  }'
```

Policy minima -- por ahora, mismo patron restrictivo que la app `dev` de gestoria (allowlist de
emails concretos, no un dominio entero, porque erp-padel todavia no tiene club real ni encargado
real, solo el humano probando):

```
curl -X POST "https://api.cloudflare.com/client/v4/accounts/1a5f93adc916c9642a1d1807032bde4a/access/apps/<app_uid>/policies" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "erp-padel-staging - acceso restringido",
    "decision": "allow",
    "include": [ { "email": { "email": "<email del humano/tester>" } } ]
  }'
```

Guardar el `aud` que devuelve la respuesta del `POST /access/apps` -- es el valor que completa
`ACCESS_AUD` en el paso 1.6. Confirma que este paso va ANTES del upload final del User Worker
(dependencia ya anotada en 1.6).

## 2. Resumen de bindings -- dos mecanismos distintos, no confundir

- **`wrangler.jsonc` de este repo** (edita devops, no toca `src/**`): solo sirve para
  `wrangler dev` local y `wrangler d1 migrations apply --remote` contra la D1 real. Cambio
  concreto tras el paso 1.3:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "reserva-cancha",
    "database_id": "<database_id real de erp-padel-club-piloto-staging>",
    "migrations_dir": "migrations"
  }
]
```

  `workers_dev` se mantiene `false` (no cambia: este repo nunca se despliega solo, ver guardia de
  `package.json`). No agregar `routes` aca -- las rutas reales las resuelve el dispatch Worker
  del paso 1.5, no este `wrangler.jsonc`.

- **Metadata del Upload Worker Module** (paso 1.6): es la fuente de verdad real de lo que corre en
  staging. Bindings independientes de `wrangler.jsonc` -- si diverge, gana lo que esta en el
  namespace, no el archivo local. Riesgo a vigilar: nada impide que alguien actualice
  `wrangler.jsonc` y asuma que eso alcanza para que el User Worker tenga el binding nuevo. Devops
  tiene que resubir explicitamente tras cualquier cambio de bindings.

## 3. Verificacion post-deploy obligatoria (ADR-0009)

No se reporta "deployado" hasta cerrar todos los puntos. Si alguno falla, se reporta al humano, no
se escribe estado en el wiki.

1. **Version que sirve trafico.** W4P no tiene "Version ID" ni `wrangler deployments status` como
   un Worker normal desplegado con `wrangler deploy` -- el User Worker subido a un dispatch
   namespace no tiene routing gradual ni versionado propio expuesto por esos comandos (son para
   Workers desplegados por cuenta, no para scripts dentro de un namespace). El equivalente real
   aca: `GET /accounts/.../workers/dispatch/namespaces/erp-padel-staging/scripts/club-piloto` debe
   devolver el script recien subido, y comparar su `etag`/`created_on` contra el momento del
   upload del paso 1.6 -- eso es lo que confirma "esta version es la que sirve", no un
   Version ID de Wrangler. El Worker dinamico (paso 1.5) SI es un deploy normal y SI tiene Version
   ID -- correr `wrangler deployments status` sobre `erp-padel-dispatch-staging` para confirmar
   que sirve la version recien deployada de la logica de routing.
2. **Camino critico real**, contra la URL publica de staging (no local, no D1 local):
   - `GET https://erp-padel-dispatch-staging.minerva-setter.workers.dev/health` -> `200 {"ok":true}`.
   - `GET .../reservar` -> 200, HTML con el Select de canchas poblado (confirma que el SELECT a D1
     REMOTA en `app.get("/reservar")` funciona, no solo el `/health` estatico).
   - **409 de doble reserva contra D1 remota, no local**: repetir la prueba de concurrencia que ya
     corrio qa-engineer en local (`wiki/log.md`, entrada del 2026-08-04: 10 `POST /api/reservas`
     simultaneos al mismo turno) pero apuntando a la URL de staging. Resultado esperado identico:
     exactamente un `201`, el resto `409 {"error":"turno ya no disponible"}`, y `SELECT` directo
     contra la D1 real (`wrangler d1 execute erp-padel-club-piloto-staging --remote --command
     "SELECT * FROM reservas WHERE cancha_id=? AND fecha=? AND hora_inicio=?"`) confirmando una
     sola fila. Esto es lo que el ejercicio pidio explicitamente probar en D1 real, no en
     Miniflare -- D1 remota si tiene el motor SQLite real detras, a diferencia de la limitacion
     que qa-engineer ya documento sobre el paralelismo local.
   - `GET .../panel` sin JWT -> `403 {"error":"forbidden"}`. Confirma que el bypass de dev
     (`ENVIRONMENT=development`) esta REALMENTE desactivado en este entorno -- el binding subido
     en 1.6 es `ENVIRONMENT=staging`, no `development`; si este chequeo da 200, es el mismo
     blocker que QA y security-reviewer ya encontraron y fijaron en local, reaparecido en staging
     por un binding mal subido. No shipear con esto en 200.
   - `GET .../panel` con un JWT real de Access (login manual del humano contra la app del paso
     1.7) -> 200, panel renderizado.
3. **Migraciones D1 aplicadas contra la base remota**, no asumido por el exit code de
   `db:apply:remote`: `wrangler d1 execute erp-padel-club-piloto-staging --remote --command
   "SELECT name FROM sqlite_master WHERE type='table'"` debe listar `canchas`, `horarios_atencion`,
   `reservas`, `usuarios`, `_cf_KV` (tabla interna de Wrangler para trackear migraciones
   aplicadas) -- confirmar tambien contra esa ultima que las dos migraciones (`0001`, `0002`)
   figuran aplicadas.
4. **Consumidores asincronicos**: no aplica a este modulo -- sin Queues, sin Cron, sin Durable
   Objects (`wiki/index.md`, "Stack propuesto": "Sin Durable Objects, sin Queues"). No hay nada que
   verificar aparte del camino HTTP.
5. **Logs reales tras la primera carga de trafico de prueba** (no un resumen, no el dashboard
   paginado): `wrangler tail erp-padel-dispatch-staging --format json --status error` durante la
   corrida del punto 2 (el Worker dinamico es el unico con `tail` disponible de forma directa por
   nombre de Worker normal; el User Worker dentro del namespace no tiene un `wrangler tail` propio
   documentado de la misma forma -- si hace falta ver sus logs, es via Workers Logs con
   `observability.enabled` si ese binding tambien se sube en el metadata del paso 1.6, gap a
   decidir en la ejecucion). Reportar ventana de tiempo y volumen mirado.

Recien si los 5 puntos cierran: actualizar `wiki/index.md` (URL de staging, en "Identidad del
proyecto" o seccion nueva) y `wiki/log.md` con la version confirmada viva. Si algo no cierra: se
reporta al humano, no se escribe estado.

## 4. Gaps que quedan abiertos para produccion real

1. **Workers for Platforms no esta comprado en la cuenta** (seccion 0). Bloqueante de TODO este
   plan, no solo de produccion -- ni siquiera staging puede arrancar sin este paso. Accion: humano,
   dashboard, antes de ejecutar 1.2 en adelante.
2. **Sin dominio propio para erp-padel.** Este plan usa `*.workers.dev` como URL publica de
   staging (aceptable para el ejercicio). Produccion real necesita un dominio (del producto o del
   club) y una zona en la cuenta -- no existe ninguna de las 4 zonas actuales que sirva.
3. **La app de Access de este plan es de un solo club de prueba, no el procedimiento de alta de
   club (Oleada 8).** ADR-0001 ya lo anota: "no hace falta el procedimiento completo de alta de
   club" para este ejercicio. Falta disenar como se automatiza crear D1 + subir script + app de
   Access + policy para el club N-esimo sin trabajo manual devops por club.
4. **Costo real de W4P sin conocer todavia** (ni siquiera el gap original de ADR-0001 -- "cuanto
   sale corriendo sobre Workers Paid" -- porque ahora sabemos que hace falta un producto aparte).
   Una vez habilitado en el paso 1.1, revisar el dashboard de billing para completar el numero que
   ADR-0001 dejo pendiente y decidir si cambia el costo marginal de `propuesta.md` Parte 2.
5. **Bundle del User Worker para el Upload API no tiene script propio.** `wrangler.jsonc` de este
   repo apunta a `src/index.tsx` (TSX), y el Upload Worker Module pide JS ya bundleado. Falta un
   script (`build:w4p` o similar) que genere ese artefacto antes de que el paso 1.6 sea ejecutable
   sin improvisar en el momento. No es parte de `src/**` (no le corresponde a api-developer), es
   config/build de devops.
6. **Sin CI/CD todavia.** Todo este plan es manual (curl + wrangler a mano). CLAUDE.md pide
   "CI/CD setup con GitHub Actions + Wrangler" como responsabilidad del rol -- no armado en esta
   pasada porque el pipeline real (W4P, no `wrangler deploy`) recien queda definido en este
   documento; automatizarlo es el paso siguiente, no este.
7. **Rate limiting y hardening de headers**, ya sealados por security-reviewer (`wiki/log.md`,
   entrada del 2026-08-04) como warnings sin bloquear staging: KV para rate limit del formulario
   publico esta en el stack planeado (`wiki/index.md`) pero no implementado. No es un gap de
   infra de este plan (es de `api-developer`), lo anoto porque staging es donde recien se vuelve
   observable con trafico real.
8. **Preview namespace de Wrangler / entorno de desarrollo de W4P** (dispatch namespace aparte
   para que cada desarrollador pruebe su propio User Worker sin pisar el de staging) no evaluado --
   fuera de alcance de este plan, que asume un unico staging compartido.

## 5. Que hace falta del humano para ejecutar este plan

En orden:
1. Confirmar habilitacion de Workers for Platforms en el dashboard (paso 1.1) -- sin esto nada mas
   corre.
2. Confirmar, uno por uno o en bloque, la creacion de los recursos CF de las secciones 1.2, 1.3,
   1.5, 1.7 (gate de "crear/modificar recursos de la cuenta CF").
3. Confirmar explicitamente el paso 1.4 (migracion D1 contra la base real).
4. Proveer o confirmar el email que va en la policy de Access del paso 1.7 (quien prueba el panel
   de staging).
5. Decidir el gap 5 (script de bundle) antes de que alguien intente ejecutar el paso 1.6 de punta
   a punta -- hoy no alcanza con copiar/pegar el `curl` de este documento sin ese paso previo.
