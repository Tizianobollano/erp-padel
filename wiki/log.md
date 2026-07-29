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

[2026-07-29] Carpeta renombrada padel -> erp-padel e inicializado repo git propio (proyecto fuera
del repo normai, como el resto de projects/, que esta gitignored). Remoto en GitHub pendiente: no
hay `gh` instalado en esta maquina, asi que la creacion del repositorio remoto y el primer push
quedan a cargo del humano.
