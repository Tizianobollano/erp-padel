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
