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
`.claude/worktrees/reserva-cancha` (rama `worktree-reserva-cancha`, 4 commits locales sin
pushear, sin mergear a `main`). Veredictos: QA SHIP CON FIXES (fixes aplicados), security-reviewer
blocker cerrado (2 warnings abiertos), ux-reviewer LISTO PARA STAGING. Nada desplegado, sin
recursos CF creados o modificados -- devops solo dejo un plan de staging
(`.claude/worktrees/reserva-cancha/wiki/architecture/plan-staging.md`) porque encontro que
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

## Restriccion comercial que define el producto

No se cobra costo de instalacion: la competencia se activa el mismo dia con costo inicial cero, y
un cargo de puesta en marcha nos saca de la comparacion. La construccion se recupera con la
suscripcion, lo que obliga a dos cosas: compromiso minimo de 12 meses y volumen (con menos de 5
clubes el producto no cierra). Techo de precio del mercado: ~$45.000/mes por club.

## Stack propuesto (sin validar contra codigo, no existe todavia)

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

- Framework: /workspace/normai/skills/framework/iiapie-ui.md
- Patrones: /workspace/normai/skills/patterns/auth.md, error-handling.md, cloudflare-bindings.md
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
- [ ] Rate limiting del formulario publico y headers de seguridad (CSP/X-Frame-Options): estaban
      en el stack planeado desde el borrador 1 pero el Modulo 1 se construyo sin ellos
      (security-reviewer los dejo como WARNING, no BLOCKER, ver corrida-e2e.md)
- [ ] Workers for Platforms (arquitectura elegida en ADR-0001) no esta comprado/habilitado en la
      cuenta Cloudflare real -- alta de producto en el dashboard, pendiente del humano, antes de
      poder ejecutar el plan de staging

## Inbox
<!-- Humano: deja notas aqui para la proxima sesion -->
