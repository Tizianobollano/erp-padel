# Corrida end-to-end: Modulo 1 (Reserva de cancha)

Fecha: 2026-08-04
Worktree: `.claude/worktrees/reserva-cancha` (rama `worktree-reserva-cancha`, 4 commits locales,
sin pushear)
Objeto: implementacion de referencia para ejercitar la suite completa de agentes de NORMAI de
principio a fin. No es un compromiso comercial (ver `index.md`, seccion "Excepcion vigente").

Este documento es el objeto de la auditoria, mas importante que el codigo que salio de la corrida.

## Orden de invocacion y que entrego cada uno

1. **Protocolo de inicio + reconciliacion (sesion principal, no agente)**. MISMATCH detectado:
   `index.md` decia "sin repo" / "remoto pendiente de crear"; `git remote -v` y `git status`
   mostraban un remoto real (`git@github.com:Tizianobollano/erp-padel.git`) ya pusheado y al dia.
   Reportado al humano antes de tocar nada, confirmado, corregido. Confirmacion aparte del humano
   sobre el encuadre de la corrida (referencia, no disparador comercial de "2 clubes
   comprometidos").
2. **Worktree**. `EnterWorktree name:"reserva-cancha"` creo el worktree en la raiz del repo
   `normai`, no dentro del repo `erp-padel` (ver Friccion 1). Corregido a mano con
   `git worktree add` dentro de `projects/erp-padel/` + `EnterWorktree path:...`.
3. **software-architect** -- ADR-0001 (`wiki/decisions/0001-modelo-cuentas-cloudflare-multi-club.md`,
   en el checkout principal, no en el worktree -- ver Friccion 3). Resolvio la decision pendiente 1:
   cuenta Cloudflare compartida con Workers for Platforms (dispatch namespace), matizando ADR-0006
   global para el caso de un producto enlatado multi-tenant. Aplico cascada a `propuesta.md` e
   `index.md` por su cuenta. Duracion: 5m40s.
4. **database-architect** -- `migrations/0001_reservas.sql` + `wiki/architecture/modelo-datos-reservas.md`.
   Mecanismo anti-doble-reserva: indice UNICO PARCIAL sobre `reservas(cancha_id, fecha, hora_inicio)
   WHERE estado='confirmada'`, verificado contra sqlite3 real simulando la carrera. Dejo
   explicitamente fuera de scope la tabla de usuarios/auth (correcto segun su mandato declarado).
   Duracion: 7m07s.
5. **api-developer** -- Worker Hono+D1 completo (`src/routes/public.ts`, `panel.ts`), login via el
   patron de `inmobiliaria` (Cloudflare Access + autorizacion por tabla `usuarios`,
   `migrations/0002_auth.sql`, agregado por iniciativa propia ante el gap que dejo
   database-architect). Verifico el 409 de conflicto con curl real. Duracion: 8m59s.
6. **design-lead** -- `PRODUCT.md` + `design.md` contra la API real, cubriendo explicitamente el
   estado 409 "turno ya no disponible" como caso propio (no generico). Detecto y documento en
   `framework-backlog.md` un gap del framework compartido (`Button`/`Alert` sin variante "danger").
   Duracion: 9m12s.
7. **frontend-developer** -- implemento el spec literal (bootstrap del framework IIAPIE-UI que no
   existia todavia en el worktree, componentes `TurnosGrid`/`ReservaForm`, paginas `/reservar` y
   `/panel`). Verifico en navegador real con Playwright, no solo por codigo. Reporto sin corregir
   una desviacion detectable a simple vista (boton "Volver" del modal con variant equivocado para
   el fondo) -- correcto segun su mandato de "implementar el spec literal, no decidir diseno".
   Duracion: 31m32s.
8. **qa-engineer** -- gate dentro del worktree. Veredicto: **SHIP CON FIXES**. Reprodujo la
   atomicidad con 10 `POST /api/reservas` concurrentes reales (bash `&` + `wait`, no
   `Promise.all` de un solo proceso) contra el mismo turno: 1x201, 9x409, sin duplicados en D1.
   Encontro un **BLOCKER real**: `wrangler.jsonc` traia `ENVIRONMENT=development` como default,
   que activa un bypass completo de auth; agravado por un script `"deploy": "wrangler deploy"` que
   lo heredaria fuera del pipeline real. Duracion: 7m34s.
9. **security-reviewer** (primera pasada) -- confirmo el blocker de QA por cuenta propia (no lo
   dio por bueno sin releer el codigo) y lo amplio: sin `workers_dev: false` ni `routes`, el
   default expondria el panel completo (nombre+telefono de reservas, cancelacion sin credencial)
   en un subdominio publico `*.workers.dev` apenas alguien corriera `wrangler deploy`. Detuvo la
   auditoria por su propia regla de frenar ante un blocker, sin llegar a CORS/rate-limit/headers.
   Duracion: 2m46s.
10. **api-developer** (fix puntual) -- saco `ENVIRONMENT` de los `vars` default de `wrangler.jsonc`,
    agrego `workers_dev: false`, convirtio `"deploy"` en una guardia que falla a proposito hasta
    que exista el pipeline W4P real. Verifico que el default ahora es fail-closed y que el flujo
    de dev local (`--var ENVIRONMENT:development` explicito) sigue andando. `tsc` limpio.
    Duracion: 3m21s.
11. **security-reviewer** (resumida via `SendMessage`, no un agente nuevo) -- confirmo el fix por
    segunda lectura propia, cerro el blocker, completo CORS (sin hallazgo, same-origin por
    default), rate limiting (WARNING: sin implementar, pese a que `index.md` lo listaba en el
    stack planeado) y headers de seguridad (WARNING: sin CSP/X-Frame-Options). Sin exposicion de
    datos de otros jugadores en el formulario publico. Duracion: 3m02s.
12. **ux-reviewer** (primera pasada) -- audito la app CORRIENDO (`wrangler dev` + Playwright), no
    el spec. Veredicto: **NO listo para staging**. 5 blockers nuevos: 3 fallas de contraste WCAG AA
    (una de ellas, el boton "Volver", ya la habia visto QA como warning -- ux-reviewer la elevo a
    blocker al verla renderizada y evaluar las vias de escape del modal, no solo el numero de
    contraste), el modal no atrapaba el foco (Tab se escapaba a la pagina de fondo), y ningun
    estado final del formulario (exito/409/error) se anunciaba a lectores de pantalla. Mas 5
    warnings (touch targets, layout roto con nombre de 500 caracteres, tabla sin vista mobile,
    feedback faltante, error de validacion conflacionado con error de red). Duracion: 36m19s.
13. **design-lead** (fix pass) -- revision de `design.md`/`PRODUCT.md`: redefinio el token
    `accent` (de `bg-accent text-on-dark`, 4.22:1, a `bg-accent-tint text-ink`, 8.62:1), corrigio
    `danger` a 4.58:1, cambio el variant del boton "Volver", especifico el criterio completo de
    focus-trap, tamanos minimos de touch target, y una vista de tarjetas para la tabla en mobile.
    Documento el hallazgo sistemico del framework AFOLAP (`accent`+`on-dark` falla AA) en
    `framework-backlog.md`. **Interrumpida por limite de sesion de la cuenta** antes de cubrir el
    ultimo item (warning 6, error de validacion vs. error de red) -- ver Friccion 7.
14. **Continuacion fuera de esta sesion** (otra cuenta, ver Friccion 7): design-lead completo el
    item que quedo pendiente, frontend-developer implemento el diff completo de fixes de
    accesibilidad (contraste, focus-trap real con Tab/Shift+Tab, `aria-live` en los 4 estados del
    formulario, split de error de validacion vs. servidor, `break-words`, vista mobile de la
    tabla), y ux-reviewer volvio a auditar la app corriendo desde cero. **Veredicto final: LISTO
    PARA STAGING**, los 10 hallazgos originales cerrados y verificados uno por uno (numeros de
    contraste exactos, Tab real, `curl` paralelo para el 409 real, doble click real). Se generaron
    4 commits locales en la rama del worktree (no pusheados) -- fuera del flujo de confirmacion
    humana que exige CLAUDE.md (ver Friccion 7).
15. **devops** -- plan de staging (`wiki/architecture/plan-staging.md`), sin ejecutar nada contra
    la cuenta CF real (restriccion confirmada explicitamente por el humano antes de invocarlo, ver
    Friccion 9). Uso llamadas de solo lectura al MCP de Cloudflare para no adivinar nombres/IDs.
    **Hallazgo real, no anticipado**: Workers for Platforms **no esta comprado/habilitado** en la
    cuenta CF real (API devuelve error 10121) -- es un alta de producto en el dashboard que solo
    puede hacer el humano, no un comando de wrangler. Mas grave que el gap que ADR-0001 dejo
    abierto (costo de W4P sin verificar): la arquitectura elegida no se puede ejecutar todavia, ni
    siquiera para probar el costo. Duracion: 6m42s.

## Friccion y donde hubo que improvisar

1. **`EnterWorktree name:...` crea el worktree en el repo equivocado.** erp-padel es un repo
   anidado dentro del arbol de trabajo de `normai` pero es un git repo propio con su remoto
   propio. `EnterWorktree` con `name` targetea el repo MAS EXTERNO (`normai`) por default, no el
   repo anidado donde realmente hacia falta trabajar -- pese a que `workspace/workflow/worktrees.md`
   es explicito en que "el repo normai no usa worktrees". Se detecto de inmediato (la ruta
   devuelta no coincidia con `projects/erp-padel/`), se removio con `ExitWorktree action:"remove"`
   (sin trabajo adentro, sin perdida), y se recreo a mano con `git worktree add` dentro del repo
   correcto + `EnterWorktree path:...` para entrar a el. Vale la pena una nota en
   `worktrees.md` sobre este caso (multi-repo anidado) para la proxima sesion que lo pise.
2. **database-architect dejo la tabla de usuarios/auth fuera de scope**, correctamente segun su
   mandato ("modelado de datos de canchas, horarios y reservas"), pero eso significaba que
   api-developer llegaba al login sin modelo. Se resolvio pidiendole explicitamente a
   api-developer que buscara el patron ya usado en `inmobiliaria` en vez de inventar uno propio,
   y que agregara su propia migracion (`0002_auth.sql`). Funciono, pero es una costura entre
   agentes que el orquestador tuvo que anticipar en el prompt, no algo que salio solo de la
   cadena.
3. **Donde vive un ADR de arquitectura de proyecto vs. donde vive el codigo de una feature no esta
   escrito en ningun lado.** Se decidio por criterio propio: ADR-0001 (decision persistente,
   bloqueante para cualquier trabajo futuro, no solo esta corrida) vive en el checkout principal
   de `erp-padel`; el resto (schema, codigo, specs de producto/diseno) vive en el worktree y se
   integra recien al mergear. Es una decision razonable pero no estaba en las instrucciones ni en
   `worktrees.md` -- deberia quedar documentada ahi si el patron se repite.
4. **QA encontro un blocker de seguridad real que no estaba en el radar de nadie hasta ese punto**:
   un default de configuracion (no un bug de codigo) que desactivaba la autenticacion por
   completo. Forzo un ciclo fuera de la cadena lineal original: volver a api-developer para un fix
   puntual, y recien despues resumir security-reviewer (no relanzarlo desde cero) para que
   terminara su auditoria sobre el estado corregido.
5. **security-reviewer se detuvo solo, a mitad de auditoria, al toparse con el blocker** (regla
   propia del rol) en vez de reportar parcial y seguir. Correcto por diseno, pero implica que la
   cadena "QA -> security -> ux" no es en verdad lineal cuando aparece un blocker real: hay que
   resolver y volver, no solo avanzar.
6. **ux-reviewer, auditando la app CORRIENDO en vez del spec, encontro mas de lo que QA y
   security-reviewer habian visto en el codigo**: elevo un warning de QA a blocker al verlo
   renderizado, y sumo dos fallas de contraste WCAG que nadie habia calculado antes (el CTA
   publico y el boton destructivo del modal). Esto confirma el valor de auditar contra la app real
   y no solo contra el codigo o el spec -- pero tambien duplico el trabajo: gran parte de lo que
   fallaba ya estaba "aprobado" en pasadas anteriores bajo un lente distinto (typecheck/logica de
   QA, superficie de auth de security), y solo se vio bajo el lente de accesibilidad real.
7. **Esta sesion se quedo sin cupo a mitad del fix pass de design-lead** (limite de sesion de la
   cuenta, no un error de la tarea). El trabajo se completo por fuera de esta sesion, desde otra
   cuenta, sin que este orquestador lo dirigiera ni lo viera en curso -- se entero recien al volver
   y encontrar 4 commits nuevos en la rama del worktree. Esos commits **no pasaron por el flujo de
   confirmacion humana que exige CLAUDE.md** ("El agente NUNCA hace commit ni push por su cuenta...
   prepara, redacta el mensaje, y pide confirmacion"). No se revirtieron (instruccion explicita del
   humano de revisar y terminar, no de deshacer); se verificaron en cambio por otros medios
   (`tsc --noEmit` limpio, revision del diffstat completo entre el commit base y el ultimo,
   lectura del detalle en `wiki/log.md` que la propia continuacion dejo escrito). Es la mayor
   desviacion de proceso de toda la corrida y queda documentada aca en vez de escondida.
8. **`framework-backlog.md` termino con multiples entradas nuevas de la misma familia de problema**
   (tokens `accent`/`danger` que fallan WCAG AA contra `on-dark`, componentes sin area de toque
   minima) escritas por tres agentes distintos en momentos distintos (design-lead dos veces,
   frontend-developer una). Nadie las consolido en una sola entrada; quedan como estan, es trabajo
   de una futura sesion de lint del wiki global.
9. **El paso de devops se re-encuadro a mitad de tarea por una pregunta al humano**: el plan
   original de la cadena decia "devops: staging, con la verificacion post-deploy obligatoria
   completa", que sonaba a ejecucion real. Antes de invocarlo se le pregunto explicitamente al
   humano si aprovisionar de verdad o solo planificar, porque la wiki del propio proyecto exige
   confirmacion humana para "crear/modificar recursos de la cuenta CF" y esa confirmacion todavia
   no se habia dado para ejecutar. El humano eligio "solo plan". Sin esa pausa se habria ejecutado
   sobre la cuenta CF real de un producto sin ningun cliente comprometido.

## Reglas que no se pudieron cumplir del todo, y por que

- **"El agente NUNCA hace commit ni push por su cuenta"** (CLAUDE.md, seccion Commits) -- no se
  cumplio en la rama del worktree: 4 commits locales existen sin haber pasado por el flujo de
  `git add` + mensaje redactado + confirmacion humana. Origen: la continuacion desde otra cuenta
  tras el corte por limite de sesion, fuera del control de este orquestador. Sin pushear, asi que
  el remoto no se vio afectado; queda a la vista para que el humano decida si los deja, los
  reescribe, o los revisa uno por uno antes de fusionar.
- **Checklist de habilitacion de worktrees, item 4** ("Documentar en la wiki del proyecto: comando
  de dev, puerto, y como reponer la D1 local") -- nunca se escribio como documento unico y
  explicito. La informacion existe, pero dispersa en entradas de `wiki/log.md` del worktree
  (varias, de distintos agentes) en vez de en un lugar fijo. Gap menor, no bloqueante, pero
  incumple la letra del checklist.
- **ADR-0001 en la practica no es ejecutable todavia**: la decision (Workers for Platforms) es
  valida y bien fundamentada, pero devops encontro que el producto W4P no esta contratado en la
  cuenta Cloudflare real. La regla "binding-first, verificar en MCP antes de escribir integracion
  custom" (CLAUDE.md, seccion Cloudflare) se siguio -- devops verifico por API antes de asumir
  nada -- pero el resultado de esa verificacion es que la arquitectura elegida esta bloqueada por
  un paso comercial (compra en el dashboard), no tecnico.
- **Rate limiting y CSP/security headers** -- `index.md` listaba "KV: rate limit del formulario
  publico" como parte del stack planeado desde el dia 1 de la propuesta; el modulo se construyo
  sin implementarlo. security-reviewer lo marco como WARNING, no BLOCKER, asi que no freno la
  cadena, pero es una promesa de la propuesta original que esta corrida no cumplio.

## Tiempos reales por tramo (agentes lanzados y trackeados por esta sesion)

| Tramo | Duracion |
|---|---|
| software-architect (ADR-0001) | 5m40s |
| database-architect (modelo de datos) | 7m07s |
| api-developer (Worker inicial) | 8m59s |
| design-lead (PRODUCT.md/design.md inicial) | 9m12s |
| frontend-developer (implementacion inicial) | 31m32s |
| qa-engineer (gate) | 7m34s |
| security-reviewer (primera pasada, hasta el blocker) | 2m46s |
| api-developer (fix del blocker) | 3m21s |
| security-reviewer (resumida, cierre de auditoria) | 3m02s |
| ux-reviewer (primera pasada) | 36m19s |
| design-lead (fix pass) | interrumpida por limite de sesion, sin duracion trackeada |
| design-lead + frontend-developer + ux-reviewer (segunda pasada) | fuera de esta sesion, sin duracion trackeada |
| devops (plan de staging) | 6m42s |
| **Total trackeado por esta sesion** | **~2h02m de trabajo de agentes en background** |

No incluye el tiempo de la sesion principal orquestando (leer resultados, decidir el siguiente
paso, redactar prompts) ni el tramo completo que corrio fuera de esta sesion (Friccion 7).

## Estado final

- Codigo, schema, specs y plan de staging: en `.claude/worktrees/reserva-cancha`
  (`worktree-reserva-cancha`), 4 commits locales sin pushear.
- Veredictos: QA SHIP CON FIXES (fixes aplicados), security-reviewer blocker cerrado (2 warnings
  abiertos: rate limiting, security headers), ux-reviewer LISTO PARA STAGING.
- Staging: plan escrito, nada ejecutado contra la cuenta CF real. Bloqueado en la practica por
  W4P sin comprar (hallazgo de devops).
- Sin merge a `main` de erp-padel. Sin push. Sin deploy. Sin recursos CF creados o modificados.
