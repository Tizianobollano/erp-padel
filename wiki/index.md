# Wiki - erp-padel
# Mantenido por el agente. Modificaciones humanas: agregar bajo ## Inbox.
# Ultima actualizacion: 2026-08-04 (corrida e2e del Modulo 1 - Reserva de cancha, cerrada)

## Que es

Producto enlatado de gestion para clubes de padel, desplegable por club: turnos, torneos,
contabilidad y precio por demanda en una sola base. Compite contra Clubo, CanchaFija y PadelCRM,
que cobran suscripcion mensual fija sin comision por partido.

**Estado: idea con propuesta escrita, mas una implementacion de referencia del Modulo 1. Sin
cliente.** El repo propio y su remoto ya existen (ver Identidad del proyecto). No se construye
nada COMERCIAL hasta resolver las decisiones pendientes de la propuesta (Parte 2) y tener 2 clubes
comprometidos.

**Corrida de referencia cerrada (2026-08-04):** Modulo 1 (Reserva de cancha) construido de punta a
punta por la suite completa de agentes, como ejercicio tecnico confirmado por el humano -- no es el
disparador comercial de "2 clubes comprometidos". Codigo, schema, specs y plan de staging viven en
`main` (mergeado desde `worktree-reserva-cancha` el 2026-08-04; sin pushear).
Veredictos: QA SHIP CON FIXES (fixes aplicados), security-reviewer
blocker cerrado (2 warnings abiertos), ux-reviewer LISTO PARA STAGING. Nada desplegado, sin
recursos CF creados o modificados -- devops solo dejo un plan de staging
(`wiki/architecture/plan-staging.md`) porque encontro que
Workers for Platforms (la arquitectura de ADR-0001) todavia no esta comprado en la cuenta CF real.
Auditoria completa, orden de agentes, friccion y tiempos: [corrida-e2e.md](./corrida-e2e.md).

## Identidad del proyecto

- Cliente: ninguno todavia (producto propio, modelo enlatado como finz)
- Slug: erp-padel
- Nombre comercial: a definir (decision pendiente 2)
- Repositorio: repo propio (proyecto fuera del repo normai, como el resto de projects/). Remoto en
  GitHub: git@github.com:Tizianobollano/erp-padel.git (existe, rama main al dia). Creado y
  pusheado por el humano a mano despues del 2026-07-29 (la wiki no lo tenia registrado hasta el
  2026-08-04, ver log.md)
- URL produccion: no desplegado

## Documentos

| Archivo | Que contiene |
|---|---|
| [propuesta.md](./propuesta.md) | Documento maestro, uso interno. Parte 1: propuesta comercial (4 modulos, precios, puesta en marcha). Parte 2: anexo interno (economia del modelo sin instalacion, arquitectura, decisiones pendientes, riesgos, plan de oleadas) |
| [../propuesta-cliente.md](../propuesta-cliente.md) | Entregable para enviar al club: Parte 1 sin valores, con seccion de fuentes del relevamiento de mercado. Sin anexo interno. Derivado de propuesta.md; si cambia el maestro, hay que regenerarlo |
| [architecture/modelo-datos-reservas.md](./architecture/modelo-datos-reservas.md) | Modelo de datos del Modulo 1 (canchas, horarios_atencion, reservas): entidades, relaciones, indices y el mecanismo anti-doble-reserva. Migracion en `migrations/0001_reservas.sql` |

## Restriccion comercial que define el producto

No se cobra costo de instalacion: la competencia se activa el mismo dia con costo inicial cero, y
un cargo de puesta en marcha nos saca de la comparacion. La construccion se recupera con la
suscripcion, lo que obliga a dos cosas: compromiso minimo de 12 meses y volumen (con menos de 5
clubes el producto no cierra). Techo de precio del mercado: ~$45.000/mes por club.

## Stack (validado contra el Modulo 1; el resto sigue siendo propuesta)

- Runtime: Cloudflare Workers ESM + Hono (router y SSR)
- Frontend: IIAPIE-UI (categoria app/ para la consola, secciones de landing para el sitio publico)
- DB: D1 por club, aislada (sin base compartida entre clubes)
- KV: cache de tarifas, rate limit del formulario publico
- R2: exportaciones y respaldos descargables por el club
- Auth: usuarios propios con roles (admin / encargado / cantina / lectura), patron de
  erp-inmobiliaria; jugadores sin cuenta (telefono + codigo)
- Pagos: Mercado Pago Checkout Pro (senas e inscripciones), webhook idempotente
- Sin Durable Objects, sin Queues, sin LangGraph

## Skills a cargar en este proyecto

- Framework: /normai/workspace/skills/framework/iiapie-ui.md
- Patrones: /normai/workspace/skills/patterns/auth.md, error-handling.md, cloudflare-bindings.md
- Cloudflare: plugin oficial

## Gates (siempre requieren confirmacion humana)

- Deploy a produccion
- Aplicar migraciones D1 en produccion
- Crear/modificar recursos de la cuenta CF

## Decisiones tomadas

1. [0001-modelo-cuentas-cloudflare-multi-club.md](./decisions/0001-modelo-cuentas-cloudflare-multi-club.md)
   (2026-08-04): cuenta Cloudflare compartida con Workers for Platforms (dispatch namespace, un
   User Worker por club con D1 propia adjuntada por binding), no una cuenta por club. Matiza
   ADR-0006 global (que sigue vigente para proyectos bespoke) para el caso de productos enlatados
   multi-tenant de NORMAI. Gap abierto: costo mensual propio de Workers for Platforms mas alla del
   Workers Paid de $5/mes, sin verificar contra el dashboard.

## Decisiones pendientes

Detalle y opciones en propuesta.md Parte 2:

1. Nombre comercial y marca del producto
2. Alcance del piloto: 3 modulos completos, o Turnos + Caja primero
3. Ventana de soporte comprometida (el riesgo economico principal, no el precio)
4. Empaquetado del Modulo 4 (precio por demanda): adicional sobre plan Club, o tercer plan que lo
   incluya

## Gaps

- [ ] Ningun club validado: precios, modulos y prioridades salen de la investigacion de mercado, no
      de una conversacion con un club
- [ ] Precios de la competencia sin verificar de primera mano: los sitios de Clubo
      (clubo.com.ar), CanchaFija (canchafija.com.ar) y PadelCRM (padelcrm.com) estan citados como
      fuente en el entregable, pero los valores de la tabla de mercado siguen siendo los de la
      investigacion provista, no lecturas directas de esas paginas
- [ ] Modulo 4 sin validar con ningun club: no sabemos si un club argentino acepta precio variable
      ni si el habitue lo tolera. Es la parte mas nueva de la propuesta y la menos respaldada
- [ ] Efecto economico del Modulo 4 sin cuantificar: no hay estimacion de cuanto sube el ingreso
      por cancha-hora, solo el mecanismo para medirlo despues
- [ ] Inversion de construccion sin estimar en horas: la tabla de recupero usa tres escenarios
      hipoteticos
- [x] Modelo de datos en borrador, sin pasar por database-architect -- resuelto 2026-08-04 para el
      Modulo 1 (canchas/horarios/reservas, ver corrida-e2e.md). Sigue en borrador para los demas
      modulos (torneos, contabilidad, precio por demanda)
- [ ] Sin relevar que hardware tienen realmente los clubes objetivo en el mostrador
- [x] Tabla de autorizacion del panel privado -- resuelta 2026-08-04 por api-developer:
      migrations/0002_auth.sql (`usuarios`, sin columna de rol -- el alcance de este modulo no
      distingue permisos). Login implementado con el patron de inmobiliaria (Access + tabla D1),
      ver wiki/log.md
- [x] wrangler.jsonc creado 2026-08-04 por api-developer en la raiz del worktree, confirma
      migrations_dir "migrations" (default de wrangler). Un solo entorno, sin bloques `env.*`
      (a diferencia de inmobiliaria): erp-padel es un club por Worker via W4P (ADR-0001), el
      pipeline de subida al dispatch namespace lo arma devops aparte
- [ ] Rate limiting del formulario publico y headers de seguridad (CSP/X-Frame-Options): estaban
      en el stack planeado desde el borrador 1 pero el Modulo 1 se construyo sin ellos
      (security-reviewer los dejo como WARNING, no BLOCKER, ver corrida-e2e.md)
- [ ] Workers for Platforms (arquitectura elegida en ADR-0001) no esta comprado/habilitado en la
      cuenta Cloudflare real -- alta de producto en el dashboard, pendiente del humano, antes de
      poder ejecutar el plan de staging


## UX Audit

[2026-08-04] ux-reviewer: auditoria de UX/accesibilidad sobre la app corriendo (`npm run dev`,
worktree reserva-cancha), formulario publico `/reservar` y panel `/panel`, con Playwright real
(no lectura de codigo). Contexto: QA y security-reviewer ya dieron veredicto SHIP CON FIXES; el
blocker de seguridad (bypass de auth) ya esta arreglado. Esta auditoria es el ultimo gate de UX
antes de devops.

**Veredicto: NO listo para staging.** Cuatro blockers nuevos de accesibilidad/UX, ademas del ya
conocido boton "Volver" (confirmado y su severidad revisada al alza). Todos rutean a design-lead
(defectos de `design.md`, no desvios de implementacion) salvo el marcado explicitamente.

### Blockers (frenan el deploy)

1. **Boton "Volver" del Modal de cancelacion, contraste real ~1.19:1** (confirmado visualmente y
   por calculo exacto sobre colores computados: `rgb(238,236,222)` sobre `rgb(255,255,255)`,
   `Button variant="outline-light"` en `src/pages/panel.tsx`, literal de `design.md` seccion 7
   linea 301). Ya reportado por frontend-developer y QA (QA lo clasifico como warning). **Elevo la
   severidad a blocker** tras verlo renderizado y evaluar el flujo completo, no solo el numero: el
   texto es practicamente ilegible (confirmado con screenshot), y aunque el boton conserva forma y
   posicion reconocibles como control, las dos alternativas de escape del modal tambien fallan en
   el dispositivo real del encargado (mobile/tablet, PRODUCT.md seccion 6): el icono "Cerrar" (X)
   tiene un area de toque de **17x24px**, muy por debajo del minimo de 44x44px que exige
   PRODUCT.md seccion 7, y el propio "Volver" mide 43px de alto (1px bajo el minimo). La unica vía
   de escape que queda plenamente funcional es tocar fuera del modal, un affordance no descubrible
   sin señal visual. Cancelar la reserva (boton rojo) SI funciona bien. Fix: cambiar
   `variant="outline-light"` a `variant="outline-accent"` (ya usado en la tabla para "Cancelar") y
   agregar padding al boton "Cerrar" para llegar a 44x44px de area de toque. Ruteo: design.md
   (design-lead) para el variant; frontend-developer para el area de toque del "Cerrar" si
   design.md no la especifica.

2. **Boton "Si, cancelar reserva" (accion destructiva del Modal) tambien falla contraste AA:
   3.41:1**, no detectado antes por QA/security. `Button variant="danger"` (extension nueva de
   `design.md` seccion 6: `bg-danger text-on-dark border-danger`) usa `--color-danger: #dc4c4c` +
   `--color-on-dark: #eeecde` (`app.css` lineas 39/52) = 3.41:1, por debajo del piso de 4.5:1 para
   texto normal (15px/500 no califica como "texto grande" bajo WCAG). Es el boton que ejecuta la
   UNICA accion irreversible del modulo -- que el texto sea dificil de leer con precision en esa
   accion especifica pesa mas que en un boton cualquiera. Confirmado por calculo exacto sobre
   colores computados reales, no sobre el token teorico. Ruteo: design-lead (la combinacion esta
   especificada literalmente en design.md seccion 6, frontend-developer implemento tal cual).

3. **Boton "Confirmar reserva" del formulario publico (CTA unico y mas critico de todo el modulo)
   tambien falla AA: 4.22:1** sobre 4.5:1 requerido. Mismo patron: `variant="accent"`
   (`--color-accent` + `text-on-dark`) heredado sin cambios del framework AFOLAP (design.md seccion
   2: "sin retematizar... no hay marca propia que justifique redefinir @theme"). El mismo par de
   colores aparece tambien en el chip de filtro activo "Todas" y en el avatar de iniciales del
   panel (mismo 4.22:1) -- es sistemico, no un caso aislado. PRODUCT.md seccion 7 fija WCAG AA como
   "estandar base... no negociable" sin excepcion para tokens heredados del framework. Ruteo:
   design-lead (decidio reusar el token tal cual sin auditar su contraste real antes de asumirlo
   valido para un modulo con este piso no negociable); si el origen es el framework base, agregar
   tambien a framework-backlog.md porque otros proyectos que hereden AFOLAP van a repetir el mismo
   fallo.

4. **El Modal de cancelacion NO atrapa el foco** (verificado con Tab real, no lectura de codigo):
   con el modal abierto, tabulando desde "Si, cancelar reserva" (ultimo elemento focuseable del
   modal) el foco sale del dialog y aterriza en `<body>`, y un Tab mas lo lleva al link "Reservas"
   del sidebar -- un elemento de la pagina de FONDO, visualmente tapado por el overlay del modal
   pero igual alcanzable y operable por teclado mientras el modal sigue abierto
   (`data-open` confirmado presente). Esto contradice el criterio de aceptacion explicito que se me
   pidio verificar ("el Modal atrapa el foco y lo devuelve al cerrar") y el patron ARIA de dialogo
   modal (WCAG 2.4.3). Nota a favor: Esc SI cierra correctamente y devuelve el foco al boton
   "Cancelar" que abrio el modal -- ese mecanismo esta bien implementado, falta unicamente el ciclo
   de Tab dentro del modal mientras esta abierto. Ruteo: design.md no especifica el mecanismo de
   focus-trap en detalle (solo dice "sin trampas de foco... foco entra al abrir"), asi que es un
   gap de spec -> design-lead para completar el criterio; el fix en si (ciclar Tab entre el primer
   y ultimo elemento focuseable del `[data-overlay]`) lo implementa frontend-developer una vez
   especificado.

5. **Ningun estado final del formulario publico (exito, conflicto 409, error) se anuncia a
   lectores de pantalla.** `buildDangerAlert` en `ClientScript.tsx` (usado para el 409 "Justo se
   reservo ese horario" -- el "caso critico" que el propio design.md nombra asi -- y para el error
   generico) no tiene `role`/`aria-live`, a diferencia de `buildLoadingState` y `showToast` en el
   mismo archivo, que SI lo tienen (`role="status" aria-live="polite"`). El bloque de exito
   (`data-state="success"`) tampoco lo tiene. Un usuario de lector de pantalla que llena el
   formulario no recibe ninguna señal de que la reserva se confirmo, que perdio la carrera del 409,
   o que hubo un error -- para los tres desenlaces posibles del unico flujo publico del modulo.
   Falla WCAG 2.1 AA 4.1.3 (Status Messages) en el flujo critico. Ruteo: frontend-developer (el
   patron ya existe en el mismo archivo para otros dos casos, es un gap de implementacion
   consistente con lo que design.md ya implica al pedir WCAG AA, no un gap de spec).

### Warnings (corregir antes del deploy, no frenan por si solos)

6. **Formulario publico sin validacion client-side de campos obligatorios y con manejo de error
   generico que produce un loop inutil.** Enviar el formulario con Nombre/Telefono vacios (protocolo
   de usuario adverso, probado de verdad) dispara `POST /api/reservas` -> `400
   {"error":"jugador_nombre requerido"}` (mensaje especifico, confirmado via fetch directo), pero
   el cliente descarta ese mensaje y muestra el generico especificado en `design.md` seccion 7 para
   TODO 400/404/500: "No pudimos completar la reserva. Reintenta." + boton "Reintentar" que
   reenvia el mismo payload (todavia vacio) y vuelve a fallar identico, indefinidamente. El
   formulario tiene `novalidate` (el submit es JS, no HTML nativo) y ningun campo se marca como
   invalido. No es dead-end absoluto (los datos cargados no se pierden, el usuario puede notar y
   completar los campos por su cuenta), pero incumple el criterio explicito de PRODUCT.md seccion 7
   ("telefono vacio... identificado en texto explicito") y confunde con un boton "Reintentar" que
   no soluciona nada. Ruteo: design.md conflacio "error de validacion" con "error de servidor/red"
   en un unico estado `error` (seccion 7 del componente ReservaForm) -> design-lead, para separar
   errores 400 de validacion (mostrar el mensaje especifico que la API ya da, campo por campo o al
   menos el texto crudo) de errores 500/red (donde el generico + reintentar si tiene sentido).

7. **Click en "Confirmar reserva" sin horario elegido no da ningun feedback.** Confirmado: el
   boton queda habilitado (sin `disabled`, sin estilo atenuado) incluso sin seleccionar turno; al
   hacer click no se dispara ningun request (confirmado por network) y no aparece ningun mensaje o
   cambio visual -- nada distingue ese click de no haber hecho nada. Leyendo `ClientScript.tsx` la
   causa es que `doSubmit()` hace `return` temprano y mueve el foco al primer turno disponible, pero
   sin ningun turno disponible visible (grilla vacia) ese `focus()` no tiene adonde ir y el usuario
   no percibe cambio alguno. Es "accion sin feedback" segun la taxonomia de este rol, pero no
   blockea la tarea per se porque el boton de submit rara vez se alcanza sin pasar antes por la
   grilla de turnos en un uso normal (headline solo se da si el usuario llena Nombre/Telefono antes
   de volver a elegir horario, o en la grilla vacia). Ruteo: frontend-developer (falta un mensaje o
   scroll-to cuando `doSubmit` corta temprano sin turno).

8. **Nombre del jugador sin `overflow-wrap`/`break-words` rompe el layout completo de la pagina.**
   Protocolo de usuario adverso: pegar ~500 caracteres sin espacios en "Nombre" y reservar -- la
   reserva se confirma (201, dato guardado tal cual, fuera de mi scope opinar si el backend deberia
   limitar longitud) pero la tarjeta de exito no envuelve el texto: la pagina entera crece a
   ~5192px de ancho (`scrollWidth` vs `clientWidth` 1018px, confirmado por evaluate) y aparece
   scroll horizontal en TODA la pagina, no contenido a la tarjeta. Critico en mobile (dispositivo
   primario del jugador, PRODUCT.md seccion 6). Ruteo: frontend-developer (falta `break-words` en
   el nodo que muestra `jugador_nombre` en el bloque de exito, `design.md` no necesita mencionar
   esto explicitamente, es higiene basica de CSS).

9. **Chips de filtro del panel ("Todas"/"Confirmadas"/"Canceladas") miden 30px de alto en mobile**,
   por debajo del minimo de 44x44px que fija PRODUCT.md seccion 7 -- confirmado por
   `getBoundingClientRect()` en viewport 390x844. Es el control que el encargado toca mas seguido
   desde el mostrador. Ruteo: design.md no dimensiona el `FilterBar` en mobile -> design-lead.

10. **Tabla de reservas del panel requiere scroll horizontal para llegar a "Estado" y "Cancelar" en
    mobile** (390px), confirmado por screenshot -- el scroll esta contenido a la tabla (no rompe la
    pagina, a diferencia del hallazgo 8), pero el encargado tiene que scrollear en CADA fila para
    llegar a la accion que necesita. Contradice el principio de `design.md`/PRODUCT.md de
    "escaneo rapido" y "mobile primero" para el panel. Ruteo: design.md no especifica prioridad de
    columnas ni vista alternativa para mobile del `DataTable` de este modulo -> design-lead.

### Confirmado que funciona bien (para no repetir trabajo)

- **Caso central del modulo (409 "turno ya no disponible")**: reproducido en la app real (turno
  reservado por request paralela mientras el formulario estaba completo en pantalla) -- el Alert
  "Justo se reservo ese horario. Elegi otro." aparece en el lugar correcto, la grilla se
  re-consulta y marca el turno como ocupado con `aria-label`/texto `sr-only` (no depende solo de
  color), Nombre/Telefono/Cancha/Fecha no se pierden. Coincide con `design.md` seccion 7 al pixel.
  Unico defecto: sin `aria-live` (ver blocker 5).
- **Race real de 10 requests concurrentes contra el mismo turno via curl** (fuera del navegador):
  1x201 + 9x409 limpios, sin 500, sin duplicados en D1, consistente con lo que QA ya documento.
  Nota: la misma carrera disparada desde `fetch` dentro del contexto del browser (compitiendo con
  screenshots/evaluates en curso) SI produjo 500s intermitentes y un crash del `wrangler dev` local
  ("Network connection lost") -- no lo reporto como hallazgo de producto porque no pude aislar si
  es un artefacto del entorno de auditoria (Miniflare bajo presion de recursos del sandbox) o un
  problema real; lo dejo anotado para que qa-engineer lo intente reproducir de forma controlada si
  le parece necesario, fuera de mi scope confirmarlo.
- **Doble click en "Confirmar reserva"**: una sola request (boton se deshabilita de forma
  sincronica antes del fetch). **Doble click en "Si, cancelar reserva"**: mismo resultado, una sola
  request. **Cancelar una reserva ya cancelada por otra sesion** (simulado con curl en paralelo):
  el modal cierra igual, la fila se actualiza a "cancelada" sin error visible para el usuario,
  coincide con design.md seccion 7.
- **Teclado en el formulario publico**: tab order logico, foco visible en cada control, los
  turnos deshabilitados ("Ocupado") se saltean automaticamente del tab order (comportamiento nativo
  de `disabled`), seleccion con Enter funciona.
- **Fecha pasada / dia sin atencion**: la API devuelve `turnos: []` para ambos casos y la UI
  muestra el mismo `EmptyState` sin crashear ni permitir seleccionar un turno inexistente. No
  distingue "fecha pasada" de "el club no atiende ese dia" (mensaje igual para ambos) -- lo
  dejo como suggestion, no warning: ambigüedad menor, no bloquea nada.
- **Refrescar la pagina despues de reservar**: la reserva ya esta persistida en D1, el refresh
  simplemente muestra el formulario limpio de nuevo -- correcto y esperado dado que el modulo no
  tiene "mis reservas" (fuera de alcance explicito de PRODUCT.md).

### Protocolo de usuario adverso: que se probo realmente

Campos vacios (Nombre/Telefono) -> hallazgo 6. Telefono mal formateado (`abc-not-a-phone!!`) ->
aceptado sin validacion (nota de datos, no UX, fuera de mi scope). Texto de 500 caracteres pegado
en Nombre -> hallazgo 8. Doble click en "Confirmar reserva" -> protegido (confirmado bien arriba).
Fecha pasada -> manejado como "sin horarios" (confirmado bien arriba, con nota menor). Cancelar dos
veces seguidas en el panel (simulando otra sesion cancelando primero) -> manejado bien (confirmado
arriba). Recargar despues de reservar -> comportamiento esperado (confirmado arriba). Touch-back
del navegador a mitad de flujo -> no reproduce un estado roto (SSR simple, sin router de cliente).
No probado: abrir un "paso profundo por URL directa" -- el modulo no tiene pasos/rutas profundas
(un solo formulario, una sola tabla), no aplica.

### Nota de entorno

Toda la auditoria corrio contra `wrangler dev` local con D1 local (Miniflare). Los numeros de
contraste son cálculos exactos sobre `getComputedStyle` de la pagina real, no estimaciones.

### Estado tras implementacion (2026-08-04, frontend-developer)

Los 4 blockers de diseno (1-4) y warnings 9-10 fueron cerrados a nivel de spec por design-lead
(revision de `design.md`, entrada de `log.md` fechada 2026-08-04) e implementados en esta misma
fecha: colores corregidos (contraste real re-verificado con la app corriendo, no solo el calculo
teorico), focus-trap real del Modal (Tab/Shift+Tab ciclan dentro, verificado con teclado real),
`min-h-11` en chips, y vista de tarjetas mobile del panel bajo `sm`. El blocker 5 y los warnings 7
y 8 (ruteados directo a frontend-developer, sin gap de spec) tambien se implementaron: `aria-live`
en los tres estados finales del formulario, feedback cuando se confirma sin turno elegido, y
`break-words` en el nombre del jugador. Detalle completo (que cambio, por que, que se verifico) en
`./log.md` entrada 2026-08-04 "frontend-developer: implementacion del diff de UX...".

**Pendiente:** re-auditoria de ux-reviewer contra la app corriendo antes de pasar a devops -- esta
seccion documenta el estado ANTES del fix (historico de la auditoria original), no reemplaza la
verificacion independiente. El split `invalid`/`error` (warning 6) que quedo pendiente en una
primera vuelta (ver MISMATCH, ya resuelto) se implemento en una segunda vuelta el mismo dia -- ver
`./log.md` entrada 2026-08-04 "frontend-developer: split invalid/error...". Con esto, blockers 1-4
y warnings 5-10 quedan todos cerrados a nivel de codigo; el modulo esta listo para la re-auditoria
de ux-reviewer.

### Re-auditoria (2026-08-04, ux-reviewer, segunda pasada)

**Veredicto: LISTO PARA STAGING.** Los 5 blockers y los 5 warnings de la auditoria original se
re-verificaron uno por uno contra la app corriendo (`npm run dev` en el worktree, D1 local con los
datos ya sembrados por sesiones previas), no contra lo que reportaron design-lead/frontend-developer
en `log.md`. Metodologia igual a la primera pasada: Playwright real (`claude-in-chrome`), calculo
exacto de contraste sobre `getComputedStyle` (formula de luminancia relativa WCAG, no el numero
teorico de los tokens), teclado real para el focus-trap, y protocolo de usuario adverso repetido en
los puntos que este round pudo haber roto. Los 10 hallazgos cierran. Sin hallazgos nuevos.

**Blockers, verificados cerrados:**

1. **Boton "Volver" del Modal**: contraste real **5.005:1** (`rgb(35,123,124)` `text-accent` sobre
   `rgb(255,255,255)`), calza con el 5.01:1 previsto por design-lead. Altura real **44.75px**
   (`getBoundingClientRect`), sobre el minimo. Boton "Cerrar" (X) del header: area de toque real
   **44x44px** exacto. Ambas vias de escape del Modal ya cumplen WCAG AA y el minimo de touch target.
2. **Boton "Si, cancelar reserva"**: contraste real **4.584:1** (`rgb(19,19,19)` sobre
   `rgb(220,76,76)`), calza con el 4.58:1 previsto (margen ajustado pero sobre el piso 4.5:1). Misma
   altura 44.75px.
3. **CTA "Confirmar reserva" + turno seleccionado + chip activo + avatar**: los 4 lugares dan
   **8.623:1** exacto (`rgb(19,19,19)` sobre `rgb(137,186,180)`, el par `accent-tint`+`ink`),
   confirmado con `getComputedStyle` real en las 4 ubicaciones por separado (`ReservaForm`,
   `TurnosGrid`, chip "Todas" del panel, avatar "C" del `AppShell`). Sistemico y consistente en los
   4 sitios, tal como preveia design.md seccion 6.
4. **Focus-trap del Modal**: Tab real desde "Si, cancelar reserva" (ultimo foco) vuelve a "Cerrar"
   (primero); Shift+Tab desde "Cerrar" vuelve a "Si, cancelar reserva" (ultimo). Ciclo confirmado en
   ambas direcciones con teclado real, ningun elemento de la pagina de fondo (sidebar, tabla)
   recibio foco durante el ciclo. Esc sigue cerrando y devolviendo el foco al boton "Cancelar" de la
   fila que abrio el modal (`data-open` se remueve, `document.activeElement` vuelve al trigger) --
   sigue andando, no se toco.
5. **`aria-live`/`role="status"` en los estados finales del formulario publico**: los 4 bloques
   (`success`, `conflict`, `invalid`, `error`) tienen `role="status" aria-live="polite"` en el markup
   SSR. Verificado no solo estatico sino en los 3 flujos disparados de verdad en el navegador:
   - **`success`**: reserva real completada (id 16, "Double Click Reaudit"), tarjeta de exito
     renderizada con los datos correctos.
   - **`conflict` (409)**: reproducido de punta a punta -- turno robado por `curl` en paralelo
     mientras el formulario estaba completo en pantalla (cancha 2, 2026-08-04, 11:00), submit real
     dispara 409, el `Alert` visible ("Justo se reservo ese horario. Elegi otro.") tiene
     `role="status" aria-live="polite"` confirmado en el nodo que realmente se muestra (no un nodo
     estatico sin renderizar), la grilla se re-consulta y marca 11:00 como ocupado, Nombre/Telefono
     no se pierden.
   - **`invalid` (400)**: ver punto 6 abajo, mismo mecanismo confirmado ahi.
   - Los 4 estados con feedback a lector de pantalla, cierra el blocker 5.

**Warnings, verificados cerrados:**

6. **Split `invalid`/`error`**: enviar cancha+fecha+turno validos con Nombre/Telefono vacios da 400
   real (`{"error":"jugador_nombre requerido"}`, confirmado por network) -> estado `invalid`, mensaje
   literal de la API visible ("jugador_nombre requerido"), **sin boton "Reintentar"** (confirmado:
   el unico boton "Reintentar" del DOM vive dentro del bloque `error`, oculto, `offsetParent: null`),
   boton "Confirmar reserva" no queda `disabled`. Complete los campos sobre el mismo formulario (sin
   recargar la pagina) y reenvie por el submit normal: la reserva se creo (201, `data-state` paso a
   `success`) -- el loop inutil del hallazgo original esta roto. Aparte, forzando un `cancha_id`
   inexistente (999, inyectado en el `<select>` sin disparar el listener de `change` para no
   contaminar la prueba con un refetch de disponibilidad) confirme que el 404 real sigue cayendo en
   el estado `error` generico ("No pudimos completar la reserva. Reintenta." + "Reintentar" visible
   y funcional) -- el split no rompio el camino `error` que ya andaba.
7. **Feedback al confirmar sin turno elegido**: con grilla vacia (fecha sin atencion, `turnos: []`)
   el click en "Confirmar reserva" hace scroll a la grilla y muestra "Elegi un horario para
   continuar." (`role="status" aria-live="polite"`, confirmado) debajo de "Sin horarios disponibles".
   Con grilla no vacia pero sin turno seleccionado, el comportamiento (foco al primer turno
   disponible) es el mismo de antes de esta ronda de fixes -- design-lead/frontend-developer lo
   documentaron asi (la spec solo pedia mensaje para el caso de grilla vacia, que era el dead-end
   real) y el comportamiento observado calza con eso.
8. **`break-words`**: confirmado en los 3 lugares que el log de frontend-developer menciono. Con la
   reserva de 500 caracteres sin espacios (id 12, "BBBB...") ya sembrada en D1: en el Modal de
   cancelacion del panel, el nombre envuelve dentro de la tarjeta de 480px sin desbordar la pagina
   (`overflowWrap: break-word` confirmado via `getComputedStyle`, `card.scrollWidth === 480`,
   `rectRight` 923 < viewport 1366). En la vista de tarjetas mobile (simulada, ver nota de entorno),
   el mismo nombre envuelve dentro del ancho forzado de 390px sin overflow
   (`container.scrollWidth === container.clientWidth === 371`). No repeti la prueba en el bloque de
   exito del formulario publico (ya estaba confirmado en la primera pasada y esta ronda no toco ese
   archivo para este punto).
9. **Chips de filtro, `min-h-11`**: altura real **44px** exacto (`getBoundingClientRect`), medido en
   el chip "Todas" del panel. No es un fix gateado por breakpoint (design.md lo pide "siempre"), asi
   que el numero es representativo independientemente del viewport real usado para medirlo.
10. **`DataTable` mobile / vista de tarjetas**: confirmado estructuralmente (la forma confiable de
    verificarlo en este entorno, ver nota de entorno abajo) -- el `<table>` tiene clases
    `hidden sm:block`, el wrapper de tarjetas tiene `sm:hidden`, y la hoja de estilos compilada
    define `@media (width >= 40rem) { .sm\:block{display:block} .sm\:hidden{display:none} }`
    (640px, breakpoint `sm` estandar, sin alteraciones). Simulando el layout mobile de forma aislada
    (clon del wrapper de tarjetas en un contenedor de 390px, ver nota de entorno), las 4 tarjetas de
    una fecha con reservas renderizan: hora+`StatusBadge` en el encabezado, pares label/valor en el
    cuerpo, boton "Cancelar" ancho completo -- Estado y Cancelar visibles sin ningun scroll, ni
    siquiera vertical dentro de la tarjeta. La tabla desktop (`sm:` y mas ancho, verificada al
    viewport real de 1366px) sigue con su propio scroll horizontal contenido (`overflow-x-auto` del
    wrapper), sin desbordar la pagina -- no se rompio nada del lado desktop.

**Protocolo de usuario adverso, repetido sobre lo que esta ronda pudo haber tocado** (`ClientScript.tsx`
y `panel.tsx` cambiaron esta ronda, ambos archivos centrales de interaccion):

- **Doble click en "Confirmar reserva"**: una sola reserva creada (un solo 201 en la red), igual que
  antes del fix.
- **Doble click en "Si, cancelar reserva"**: una sola cancelacion (un solo 200 en la red), fila
  actualizada a "cancelada", modal cerrado limpio.
- Sin errores de consola en ningun tab usado durante la sesion completa de re-auditoria. Sin errores
  en el log del `wrangler dev` local.
- No repeti carrera de 10 requests concurrentes (ya confirmada limpia en la primera pasada y ninguno
  de los archivos que la involucran -- `src/routes/public.ts`, el indice unico de D1 -- cambio en
  esta ronda), refrescar despues de reservar, ni cancelar-dos-veces con simulacion de otra sesion:
  sin cambios en esa superficie, no hay motivo para esperar una regresion y repetirlo no hubiera
  agregado señal.

**Nota de entorno:** `resize_window` de `claude-in-chrome` no cambia el viewport real en este
sandbox (`window.innerWidth` se mantuvo en 1366 tras pedir 390x844, confirmado en dos tabs
distintas) -- mismo problema que dejo documentado frontend-developer en su memoria de agente. Para
el punto 10 use dos verificaciones que no dependen de un viewport real: (a) lectura estructural de
las clases `hidden sm:block`/`sm:hidden` en el DOM mas el media query compilado en
`public/styles.css`, que es lo que efectivamente determina el comportamiento en un viewport real; y
(b) un clon aislado del wrapper de tarjetas en un contenedor de 390px de ancho fijo (no gateado por
`sm:`, visible siempre), para confirmar visualmente que el contenido de la tarjeta (incluido el
nombre de 500 caracteres) no desborda a ese ancho. No es lo mismo que un dispositivo mobile real,
pero cubre tanto "el mecanismo esta bien conectado" como "el contenido cabe" -- el riesgo residual
es bajo porque el breakpoint en si es un prefijo `sm:` estandar de Tailwind, no logica custom.

Con esta re-auditoria, los 5 blockers y los 5 warnings de la auditoria original quedan cerrados.
**Gate de UX: LISTO PARA STAGING.** Sigue el gate de `devops` (staging puede ser automatico tras
typecheck+lint segun CLAUDE.md; produccion y migraciones D1 en produccion siguen requiriendo
confirmacion humana explicita).

## Inbox
<!-- Humano: deja notas aqui para la proxima sesion -->
