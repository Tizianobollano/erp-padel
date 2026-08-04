# ADR-0001: Modelo de cuentas Cloudflare para erp-padel (Workers for Platforms, cuenta compartida)

Fecha: 2026-08-04
Estado: aceptada
Relacionada: ADR-0006 (wiki global NORMAI, matizada por esta decision, no reemplazada)

## Contexto

ADR-0006 (wiki global NORMAI, `/normai/workspace/wiki/decisions/0006-hosting-multi-cliente-cuentas-cloudflare.md`)
fija "una cuenta Cloudflare por cliente en produccion" como modelo de hosting default. Ese ADR fue
escrito resolviendo un caso concreto (gestoria/afolap conviviendo en una cuenta, login de Zero
Trust compartido) y su propio texto acota el alcance: "Workers for Platforms (dispatch
namespaces): descartado, es para multi-tenant de UN mismo producto SaaS, no para proyectos
bespoke distintos por cliente (modelo de NORMAI)". Es decir, el ADR-0006 ya preve que existe un
caso donde W4P es la respuesta correcta, y ese caso no es el de gestoria/afolap.

erp-padel cae en ese caso. Verificado contra `wiki/propuesta.md` (Parte 1 y Parte 2) y
`wiki/index.md`:

- Es un producto enlatado: **un mismo codigo** desplegado a N clubes, no un desarrollo a medida
  por cliente (a diferencia de gestoria o afolap, que son proyectos bespoke con codigo distinto
  cada uno).
- Ticket bajo: $22.000-$43.000 ARS/mes por club, techo de mercado ~$45.000/mes (propuesta.md Parte
  1, tabla de precios y "Lectura del mercado"). Contribucion neta por club ~$30.000/mes con costo
  marginal estimado de ~$4.000/mes (propuesta.md Parte 2, "Economia del modelo").
- La propuesta ya identifica la tension explicitamente como "Decision pendiente 1" (propuesta.md
  Parte 2): "USD 5 por cuenta por mes es tolerable pero la carga operativa de N cuentas no lo es",
  y la lista de opciones a evaluar incluye textualmente Workers for Platforms.
- El stack ya fijado en propuesta.md exige **D1 aislada por club, sin base compartida**: "el
  aislamiento es fisico, no un campo `club_id` en un WHERE" -- esto es un requisito no negociable
  del argumento comercial de soberania del dato ("la base de datos es del club"), y esta decision
  no lo reabre.

Verificado en cloudflare-docs MCP (2026-08-04):

- Workers for Platforms (W4P) es exactamente el patron "un dispatch Worker central enruta a
  User Workers aislados, cada uno con sus propios bindings D1/KV/R2 adjuntados al momento del
  upload" (`cloudflare-for-platforms/workers-for-platforms/configuration/bindings/`). La
  arquitectura de referencia que Cloudflare documenta y ofrece como deploy de un click
  ("AI vibe coding platform", VibeSDK) usa este mismo mecanismo para dar a cada tenant su propio
  D1/KV/R2 aislado sobre una unica cuenta -- es el caso de uso que ADR-0006 nombra como la
  excepcion valida.
- El upload de un User Worker se hace via API (`PUT .../dispatch/namespaces/<namespace>/scripts/<script-name>`)
  con los bindings especificados en el `metadata` del multipart upload; no pasa por
  `wrangler.toml` ni por `wrangler deploy` tradicional.
- Los User Workers de un namespace W4P **no cuentan** contra el limite de "Number of Workers" de
  la cuenta (100 en Free, 500 en Paid) -- la doc de limits de Workers dice explicitamente: "If you
  reach this limit, consider using Workers for Platforms" (`workers/platform/limits/`). Esto
  descarta el modelo `--env <club>` sobre una cuenta compartida (cada environment de wrangler es
  un Worker script mas, contra ese mismo limite de 500).
- La gestion de namespaces W4P ya esta disponible desde el dashboard (no solo API) desde el
  changelog de diciembre 2025 -- no requiere entrar al Partner Program ni un contrato Enterprise
  para arrancar.
- Gap no resuelto: no se encontro en cloudflare-docs MCP una pagina de pricing propia y vigente
  de Workers for Platforms (mas alla de que sigue corriendo sobre el Workers Paid plan de $5/mes
  de la cuenta). Devops debe confirmar en el dashboard si hoy existe un cargo adicional por
  namespace o por script antes de dar por cerrado el numero de costo marginal de propuesta.md
  Parte 2.

## Decision

1. **erp-padel usa una unica cuenta Cloudflare compartida** (una para staging, potencialmente la
   misma o una separada para produccion segun convenga a devops), no una cuenta por club. Esto
   matiza el alcance de ADR-0006 para el caso especifico de productos enlatados multi-tenant de
   NORMAI: ADR-0006 sigue vigente tal cual para proyectos bespoke (gestoria, afolap, y cualquier
   cliente con desarrollo a medida). erp-padel no es ese caso.

2. **Arquitectura concreta, accionable por api-developer y devops en este ejercicio (Modulo 1,
   staging):**
   - Un **dispatch namespace** por entorno (`erp-padel-staging`, `erp-padel-prod` mas adelante).
   - Un **dynamic dispatch Worker** (pieza nueva, chica): resuelve el club a partir del hostname o
     subdominio de la request (`<club>.dominio-producto.com` o el dominio propio del club) y hace
     `env.DISPATCH.get(nombreDeScriptDelClub).fetch(request)`. Este Worker es el unico expuesto
     a internet.
   - Un **User Worker por club**, subido al namespace via el Upload User Worker API, con el
     **mismo codigo fuente** que el resto (no hay logica distinta por club). Lo que cambia por
     club es el binding: cada script sube con su propio binding `d1_database` apuntando a la base
     D1 de ESE club (`metadata.bindings` en el multipart upload), preservando el requisito de
     aislamiento fisico de D1 que ya fija propuesta.md.
   - **KV** (cache de tarifas, rate limit del formulario publico) y **R2** (exportaciones,
     respaldos) pueden compartirse entre clubes con prefijo `club_id` en la key / en el path del
     objeto -- propuesta.md no exige aislamiento fisico para estos dos, solo para D1. Si mas
     adelante se decide aislarlos tambien, el mismo mecanismo de binding-por-script de W4P lo
     permite sin cambiar de modelo.
   - **Alta de un club nuevo** (procedimiento de devops, no de api-developer): crear la D1 de ese
     club, subir el script al namespace con el binding D1 adjunto, dar de alta el hostname en el
     dispatch Worker. Esto es exactamente la Oleada 8 ("Replicacion: alta de un club nuevo como
     procedimiento") que propuesta.md ya preveia construir; esta decision le da el mecanismo
     concreto.
   - **api-developer no cambia como escribe el Worker del Modulo 1**: sigue siendo Hono + D1
     binding `env.DB`, igual que en cualquier otro proyecto del stack. Lo unico que cambia es
     el pipeline de deploy (sube al namespace via API en vez de `wrangler deploy` contra una
     cuenta propia), que es responsabilidad de devops.

3. **Umbral de excepcion**: si en el futuro un club puntual exige contractualmente una cuenta
   Cloudflare propia y transferible (aislamiento total, no solo de datos), ese club se saca del
   namespace compartido como caso individual. No es el default y no dispara una migracion de todo
   el producto.

## Alternativas descartadas

- **Cuenta compartida con Worker y D1 aislados por club via `--env <club>`** (opcion (a) de
  propuesta.md, "modelo finz"): descartada. Cada `--env` de wrangler es un Worker script
  independiente contra el limite de "Number of Workers" de la cuenta (500 en Paid), y cada alta
  de club sigue siendo un `wrangler deploy` mas para operar manualmente o en CI -- no resuelve el
  problema de overhead operativo que motiva esta decision, solo lo esconde dentro de una cuenta.
  La propia doc de Cloudflare senala W4P como la salida cuando se choca ese limite.
- **Una cuenta por club, tal como manda ADR-0006 sin matizar** (opcion (b)): descartada para
  erp-padel. El ticket ($22.000-$43.000/mes, techo $45.000) no absorbe el overhead operativo de N
  cuentas (N dashboards, N secret stores, N targets de deploy) que el propio ADR-0006 reconoce
  como "el costo real que crece, no la plata" -- ese ADR lo acepta como costo tolerable para
  clientes bespoke con desarrollo dedicado, no para un producto enlatado que necesita escalar a
  decenas de clubes con el mismo codigo.
- **Cuenta compartida ahora, migrar a Cloudflare Partners Platform / Tenant al cruzar ~8 clubes**
  (opcion (c) de propuesta.md, calcada de la etapa 3 de ADR-0006): descartada como plan por
  default. Partners Platform sigue provisionando **una cuenta CF por club** (jerarquia
  madre-hijas); resuelve billing centralizado y alta programatica, pero hereda el mismo overhead
  operativo de N cuentas que W4P evita de raiz. Queda como opcion residual solo si aparece el caso
  de excepcion del punto 3 de la Decision (un club que exige cuenta propia), no como escalon
  automatico por volumen.
- **D1 compartida entre clubes (una base, `club_id` como columna de particion)**: descartada, no
  se evaluo en profundidad porque contradice un requisito ya fijado en propuesta.md ("sin base
  compartida entre clubes: el aislamiento es fisico") que sostiene el argumento comercial de
  soberania del dato. No es parte del alcance de este ADR reabrir esa decision.

## Consecuencias

+ Una sola cuenta Cloudflare para todo el producto: un solo Workers Paid ($5/mes total, no x N
  clubes), un solo dashboard, un solo secret store -- elimina el overhead operativo que ADR-0006
  identifica como el costo real de escalar cuentas.
+ Aislamiento de datos real preservado: cada club sigue con su propia D1 fisica, adjuntada por
  binding a su User Worker. El argumento de soberania del dato de la propuesta comercial no se
  toca.
+ Patron soportado y documentado por Cloudflare para este caso exacto (multi-tenant de un mismo
  producto), no un uso improvisado de un binding para otra cosa.
+ Alta de club nuevo queda como procedimiento API-driven (Oleada 8 de propuesta.md), sin tocar
  wrangler.toml de una cuenta nueva cada vez.
- Blast radius de cuenta compartido: un incidente a nivel cuenta (suspension, credencial de API
  comprometida, limite de cuenta) afecta a todos los clubes a la vez, a diferencia del aislamiento
  total por cuenta de ADR-0006. Es el trade-off que el propio ADR-0006 anticipa para el patron
  SaaS multi-tenant; se acepta porque el aislamiento que el club realmente compra (sus datos, D1
  fisica) se mantiene.
- Ningun club recibe una cuenta Cloudflare propia y transferible por default (si algun club lo
  exige, es la excepcion del punto 3, a resolver caso por caso).
- Pieza nueva en el sistema: el dynamic dispatch Worker no existia en el stack original de
  propuesta.md; hay que construirlo y es la puerta de entrada unica de todo el trafico -- un bug
  ahi afecta a todos los clubes.
- Deploy de un club deja de ser `wrangler deploy` simple: requiere un upload multipart con
  metadata de bindings via API. Devops necesita scriptear esto antes de que el alta de clubes sea
  realmente un procedimiento y no un trabajo manual propenso a error.
- Gap abierto: costo mensual propio de Workers for Platforms (si existe, mas alla del Workers Paid
  de $5/mes de la cuenta) no verificado en cloudflare-docs MCP. Devops debe confirmarlo en el
  dashboard antes de cerrar el numero de costo marginal de propuesta.md Parte 2.

## Cascada aplicada

- `wiki/propuesta.md` Parte 2, seccion "Arquitectura propuesta" (bullet de D1) y "Decisiones
  pendientes" (item 1): marcar la decision pendiente 1 como resuelta, referenciar este ADR.
- `wiki/index.md`: mover el item 1 de "Decisiones pendientes" a "Decisiones tomadas" con enlace a
  este archivo.
- Antes de las Oleadas 0-1 del Modulo 1 (este ejercicio): devops crea el dispatch namespace de
  staging y el dynamic dispatch Worker minimo (routing por hostname a un unico club de prueba
  alcanza para este ejercicio, no hace falta el procedimiento completo de alta de club).
- api-developer construye el Worker del Modulo 1 igual que en cualquier otro proyecto del stack
  (Hono + `env.DB`); el unico cambio de esta decision es que devops lo sube via Upload User Worker
  API al namespace en vez de `wrangler deploy` contra una cuenta dedicada.
