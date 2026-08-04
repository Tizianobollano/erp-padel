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
