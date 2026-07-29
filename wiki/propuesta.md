# Propuesta - Sistema de gestion para clubes de padel

Turnos - Torneos - Caja y contabilidad
Producto enlatado NORMAI, desplegable por club. Nombre comercial: a definir.
Version: 2026-07-29 (borrador 1, sin revisar con ningun club)

---

# Parte 1 - Propuesta comercial

## Lectura del mercado

Los sistemas que ya usan los clubes en Argentina cobran suscripcion mensual fija y ninguno cobra
comision por partido. Los tres esquemas vigentes:

| Sistema | Esquema | Precio de referencia |
|---|---|---|
| Clubo | Tarifa plana por cancha activa | $15.000/cancha/mes ($30.000 con 2 canchas) |
| CanchaFija | Tramos por tamano de club (plan Pro) | ~$20.000/mes club chico o mediano |
| PadelCRM | Base + modulos avanzados (torneos, automatizaciones) | $35.000 a $45.000/mes |

Consecuencias directas para nosotros:

1. **No hay espacio para cobrar instalacion.** El club compara contra alternativas que se activan
   el mismo dia con costo inicial cero. Un cargo de puesta en marcha nos saca de la comparacion
   antes de que se evalue el producto. La propuesta que sigue no lo cobra.
2. **El techo de precio esta en ~$45.000/mes** para un club estandar. Todo lo que ofrezcamos tiene
   que caber ahi.
3. **La comision por turno esta descartada** como modelo: nadie la cobra y el club lo lee como
   quedarse con parte de su facturacion.
4. Lo unico que el club si paga aparte, y lo entiende, son las **comisiones de la pasarela**
   (Mercado Pago) cuando el jugador sena el turno online. Esas no son nuestras.

## Que resuelve el sistema

Tres areas en una sola base de datos, sin exportar entre planillas.

### Modulo 1 - Turnos

- **Grilla horaria** por cancha y por dia, en tiempo real, operable desde el mostrador
  (celular o tablet) y desde la computadora.
- **Reserva online del jugador**: link propio del club, 24 horas, sin instalar nada.
- **Tarifas por franja**: precio distinto por dia y por rango horario (hora pico nocturna vs
  matinal), configurable por el club sin pedirnos nada.
- **Turnos fijos y abonados**: reserva recurrente semanal con vencimiento y estado de pago.
- **Sena obligatoria** configurable (porcentaje o monto) para confirmar el turno. Sin sena, el
  turno queda como pendiente y libera automaticamente al vencer el plazo.
- **Estados explicitos**: pendiente -> confirmado -> jugado / cancelado / ausente (no-show). Cada
  transicion queda registrada con quien la hizo y cuando.
- **Avisos**: confirmacion y recordatorio al jugador. Base incluida: link de WhatsApp de un click
  desde la ficha del turno + email. WhatsApp automatico masivo es un adicional (ver Adicionales).

### Modulo 2 - Torneos

- **Inscripcion online** con formulario propio del club: pareja, categoria, contacto, pago o sena
  de inscripcion.
- **Categorias y control de nivel** por jugador, para armar cuadros parejos.
- **Fixture automatico**: zonas todos contra todos, clasificacion y llave de eliminacion directa,
  con carga de resultados desde el celular.
- **Programacion sobre la grilla**: los partidos del torneo ocupan canchas y horarios en la misma
  grilla de turnos, sin doble reserva.
- **Ranking del club** por puntos acumulados, publicable en el sitio del club.
- **Ingreso del torneo integrado a la caja**: inscripciones, gastos (pelotas, premios, arbitraje) y
  resultado neto del evento.

### Modulo 3 - Caja, tienda y contabilidad

Es el modulo donde nos diferenciamos. La competencia ofrece punto de venta y caja diaria; lo que
falta es el cierre contable.

- **Punto de venta** para cantina, pelotas, alquiler de paletas y grip: venta rapida en tablet,
  con o sin turno asociado.
- **Stock** de pelotas y productos de cantina: existencias, costo de compra, alerta de minimo y
  margen real por producto.
- **Caja por turno de empleado**: apertura con monto inicial, movimientos, cierre con arqueo y
  diferencia declarada. Queda registrado quien abrio y quien cerro.
- **Ingresos clasificados por origen** (turnos / torneos / cantina / tienda / alquiler) y por medio
  de pago (efectivo / transferencia / Mercado Pago / cuenta corriente).
- **Egresos** con categoria (mercaderia, mantenimiento, sueldos, servicios, premios) para llegar a
  resultado del periodo, no solo a caja del dia.
- **Cuentas corrientes** de jugadores y abonados: saldo a favor, deuda, historial de consumos.
- **Informes**: ocupacion por cancha y franja, ingreso por metro de cancha y hora, ticket promedio
  de cantina, resultado mensual, ranking de morosos. Todo exportable a CSV o Excel.
- **Registro de auditoria** inmutable: anulaciones de venta, turnos regalados, ajustes de stock y
  cambios de precio quedan con autor, fecha y valor anterior. Es lo que permite explicar un
  faltante de caja sin discutir de memoria.

## Que nos diferencia

| | Sistemas actuales | Este sistema |
|---|---|---|
| Contabilidad | Caja diaria y punto de venta | Ingresos por origen, egresos, margen de cantina, resultado del periodo |
| Auditoria | Parcial o ausente | Registro inmutable de toda anulacion, ajuste y cambio de precio |
| Datos del club | Dentro del SaaS del proveedor | Base propia del club, exportable completa cuando quiera |
| Comision por turno | No cobran | No cobramos |
| Precio con 4+ canchas | Escala por cancha (Clubo: $60.000) | Plan por club, no por cancha |
| Pedidos del club | Cola de un producto masivo | Entran al roadmap de un producto con pocos clubes |

El punto de fondo: no es un SaaS al que el club se sube, es un sistema del club. La base de datos
es del club, el respaldo es del club y la exportacion completa esta siempre disponible. Si algun
dia deja de trabajar con nosotros, se va con sus datos, no con un PDF.

## Precio

Sin costo de instalacion. Sin comision por turno. Sin costo por usuario.

| Plan | Incluye | Precio mensual |
|---|---|---|
| **Turnos** | Modulo 1 + caja simple (ingresos por turno) | **$22.000** hasta 3 canchas |
| **Club** | Modulos 1 + 2 + 3 completos | **$34.000** hasta 4 canchas |
| Cancha adicional | Sobre cualquier plan | $5.000 |
| Sede adicional | Grilla, caja y stock propios por sede | $12.000 |

- Pago anual: 10 meses en lugar de 12.
- Compromiso minimo 12 meses en el plan mensual, o 3 meses de preaviso para dar de baja. Es la
  contrapartida de no cobrar puesta en marcha.
- Los precios se ajustan una vez por ano, avisando con 30 dias.

**Adicionales opcionales** (solo si el club los pide):

| Adicional | Precio | Nota |
|---|---|---|
| WhatsApp automatico (recordatorios y deudas) | $8.000/mes | Requiere cuenta de WhatsApp Business API a nombre del club y plantillas aprobadas por Meta; el costo por mensaje de Meta va aparte |
| Facturacion electronica ARCA | $6.000/mes | Via intermediario habilitado; requiere CUIT, punto de venta y delegacion del club |
| Migracion de historico | Presupuesto unico | Cargar turnos, jugadores y stock desde planillas existentes |
| Capacitacion en el club | Presupuesto unico | La capacitacion remota esta incluida |

**Programa socio fundador** (primeros 2 clubes): 50% del plan Club durante 6 meses. A cambio:
reuniones de feedback cada dos semanas, tolerancia a errores del primer periodo y autorizacion
para usar al club como caso de referencia.

## Puesta en marcha

Sin cargo, y no es una promesa vaga: son 5 dias.

1. **Dia 1** - Relevamiento: canchas, franjas, tarifas, productos de cantina, empleados y permisos.
2. **Dia 2-3** - Configuracion del club en el sistema, carga de tarifas y productos, sitio de
   reservas con la marca del club.
3. **Dia 4** - Capacitacion remota: mostrador (1 hora) y administracion (1 hora). Queda grabada.
4. **Dia 5** - Salida en vivo acompanada, con nosotros disponibles en el horario de mayor
   movimiento.
5. **Primeras 2 semanas** - Ajustes de configuracion sin cargo.

No hace falta comprar hardware. Funciona en el celular del encargado, en cualquier tablet Android
o iPad, y en la computadora del mostrador si ya existe. Para la cantina alcanza una tablet de
gama baja; si el club quiere impresora de tickets, se conecta la que ya tenga.

**Soporte incluido**: WhatsApp directo, lunes a domingo de 9 a 23 (el horario en que un club de
padel factura). Respuesta comprometida: menos de 1 hora en horario, y menos de 15 minutos si la
grilla o la caja estan caidas.

---

# Parte 2 - Anexo interno (no enviar al club)

## Economia del modelo sin costo de instalacion

No cobrar puesta en marcha significa que la construccion se recupera con la suscripcion. La
pregunta no es si el precio cubre el costo operativo (lo cubre con holgura), es en cuantos meses y
con cuantos clubes se recupera lo invertido en construir.

Costo marginal por club, mensual (estimado):

| Concepto | Costo |
|---|---|
| Infraestructura Cloudflare | ~USD 0 a 5 segun modelo de cuentas (ver Decisiones pendientes) |
| Soporte y ajustes | 1 a 3 horas/mes por club una vez estabilizado |
| Total en pesos | ~$3.000 a $8.000 equivalente |

Con plan Club a $34.000 y costo marginal de ~$4.000, la contribucion por club es ~$30.000/mes.

Meses hasta recuperar la construccion, segun cuanto se valore construirla y cuantos clubes se
consigan:

| Inversion de construccion | 3 clubes | 5 clubes | 8 clubes | 12 clubes |
|---|---|---|---|---|
| $1.500.000 | 17 meses | 10 meses | 6 meses | 4 meses |
| $2.500.000 | 28 meses | 17 meses | 10 meses | 7 meses |
| $4.000.000 | 44 meses | 27 meses | 17 meses | 11 meses |

Conclusiones, sin adornos:

- **Con menos de 5 clubes el producto no cierra.** El ticket es bajo; lo que lo hace viable es la
  replicacion, no el cliente. Antes de construir hay que tener 2 clubes comprometidos y una lista
  corta de 8 a 10 alcanzables.
- **El compromiso de 12 meses no es un detalle contractual, es el mecanismo que reemplaza al cargo
  de instalacion.** Un club que se va al mes 3 deja perdida.
- Si no creemos que se llega a 8 clubes en el primer ano, la alternativa honesta no es cobrar
  instalacion (nos saca del mercado), es no hacer el producto y venderle un sistema a medida a un
  club grande que si pague desarrollo.
- **El riesgo economico real no es el precio, es el soporte.** Un club llama el sabado a las 22 con
  la caja trabada. Diez clubes son diez sabados. La ventana 9-23 hay que dimensionarla antes de
  prometerla, o acotarla a horario comercial con guardia en fin de semana.
- Lo que si se puede cobrar sin perder competitividad son los trabajos unicos que la competencia
  no ofrece: migracion de historico, capacitacion presencial, multi-sede, personalizacion de marca.

## Arquitectura propuesta

Coherente con los principios de arquitectura y desarrollo de IIAPIE (trazabilidad, soberania del
dato, simplicidad, modularidad).

- **Runtime**: Cloudflare Workers (ESM), Hono como router y SSR.
- **UI**: framework IIAPIE-UI (Hono + JSX + TailwindCSS v4 con tokens semanticos). La consola usa
  la categoria app/ ya construida (AppShell, DataTable, KpiTile, Drawer, Modal, FilterBar). El
  sitio publico de reservas usa las secciones de landing.
- **DB**: D1 (SQLite) por club, aislada. Sin base compartida entre clubes: el aislamiento es
  fisico, no un campo `club_id` en un WHERE.
- **KV**: configuracion de tarifas cacheada y rate limit del formulario publico de reservas.
- **R2**: exportaciones (CSV/Excel) y respaldos que el club puede descargar.
- **Auth**: dos niveles. Personal del club por sistema propio de usuarios con roles
  (admin / encargado / cantina / lectura), reutilizando el patron de erp-inmobiliaria. Jugadores
  del sitio publico sin cuenta: reserva por telefono + codigo, sin password que gestionar.
- **Pagos**: Mercado Pago Checkout Pro para senas e inscripciones. Webhook de confirmacion
  idempotente; el turno se confirma solo con pago acreditado, nunca con el retorno del navegador.
- **Notificaciones**: base con enlace `wa.me` de un click y email. WhatsApp automatico via WABA
  solo como adicional pagado, por el costo de puesta en marcha del tramite (ver framework-backlog,
  entrada 2026-07-29 de notificacion saliente).
- **Auditoria**: tabla `auditoria` append-only para toda escritura sensible (anulacion de venta,
  cambio de precio, ajuste de stock, cancelacion o regalo de turno, cierre de caja con diferencia).
  Sin borrado ni actualizacion, con autor, timestamp e IP.
- **Sin Durable Objects, sin Queues, sin LangGraph.** La grilla no necesita coordinacion en tiempo
  real: la colision de dos reservas simultaneas se resuelve con una restriccion unica en la base
  (cancha + fecha + franja) y el segundo intento recibe el error. Es la solucion mas simple que
  funciona.

Entidades principales (borrador, a validar con database-architect):

- `canchas`, `franjas_horarias`, `tarifas` (por cancha, dia de semana y rango horario)
- `jugadores`, `abonos` (turno fijo recurrente)
- `reservas` con estado explicito + `reservas_transiciones`
- `torneos`, `categorias`, `inscripciones`, `zonas`, `partidos`, `ranking_puntos`
- `productos`, `stock_movimientos`, `ventas`, `venta_items`
- `caja_sesiones`, `movimientos_caja` (ingreso/egreso, origen, medio de pago)
- `cuenta_corriente_movimientos`
- `usuarios` (rol, activo), `auditoria`

## Decisiones pendientes (requieren ADR antes de construir)

1. **Modelo de cuentas Cloudflare para un producto de ticket bajo.** El ADR-0006 global fijo "una
   cuenta Cloudflare por cliente en produccion", pensado para clientes con desarrollo a medida. Con
   clubes de padel a $34.000/mes, USD 5 por cuenta por mes es tolerable pero la carga operativa de
   N cuentas no lo es. Opciones: (a) cuenta compartida NORMAI con Worker y D1 aislados por club via
   `--env <club>` (modelo finz), (b) una cuenta por club como manda el ADR-0006, (c) cuenta
   compartida ahora y migracion a Tenant/Partners Platform al cruzar ~8 clubes. Hay que decidirlo y
   registrarlo, porque contradice o matiza un ADR vigente.
2. **Nombre comercial y marca del producto.** Enlatado necesita nombre propio, distinto de NORMAI.
3. **Alcance del piloto**: construir los 3 modulos antes del primer club, o salir con Turnos + Caja
   y vender Torneos como la segunda etapa. La segunda opcion adelanta ingreso pero compite peor
   contra PadelCRM, que ya tiene torneos.
4. **Ventana de soporte** comprometida (ver riesgo economico arriba).

## Riesgos

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Base instalada de la competencia | El club ya tiene sistema y migrar duele | Migracion de historico incluida en el piloto; convivencia 2 semanas |
| Soporte fin de semana | Insostenible con volumen | Definir ventana antes de vender; autoservicio para lo frecuente |
| Churn con ticket bajo | Un club perdido borra meses de margen | Compromiso 12 meses; la caja y la contabilidad generan dependencia real, la grilla sola no |
| Mercado Pago (senas) | Turnos confirmados sin pago acreditado | Webhook idempotente, estado del turno atado al pago, conciliacion diaria |
| ARCA / facturacion | Riesgo fiscal, no tecnico | Fuera del producto base; intermediario hosteado como adicional |
| WhatsApp automatico | Tramite Meta desproporcionado para el ticket | Base con `wa.me`; WABA solo como adicional pagado y a nombre del club |
| Un solo club decide el diseno | El enlatado se contamina con el caso particular | Todo lo especifico del club vive en configuracion, no en codigo |

## Plan de construccion por oleadas

Gate por oleada: typecheck + lint + tests + recorrido visual a 390px (el mostrador opera en
celular). Nada pasa a produccion sin confirmacion humana.

| Oleada | Contenido | Deja utilizable |
|---|---|---|
| 0 | Base del proyecto, auth con roles, auditoria, despliegue por club | Nada al usuario |
| 1 | Canchas, franjas, tarifas, grilla y reserva desde el mostrador | Un club puede operar turnos |
| 2 | Caja: apertura/cierre, arqueo, ingresos por origen, egresos | Reemplaza el cuaderno |
| 3 | Punto de venta, stock, cuenta corriente | Reemplaza la caja de la cantina |
| 4 | Sitio publico de reservas + sena con Mercado Pago | Autogestion del jugador |
| 5 | Torneos: inscripcion, categorias, fixture, resultados, ranking | Plan Club completo |
| 6 | Informes, exportacion completa, respaldo descargable por el club | Argumento de soberania del dato cumplido |
| 7 | Replicacion: alta de un club nuevo como procedimiento, no como proyecto | Escala comercial |

Estimacion: oleadas 0 a 4 son el producto vendible minimo. Las 5 a 7 completan el plan Club y la
capacidad de replicar.
