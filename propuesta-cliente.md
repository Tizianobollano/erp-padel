# Sistema de gestion para clubes de padel

Turnos - Torneos - Caja y contabilidad - Precio por demanda

Documento de propuesta - version 2026-07-29

---

## El problema

Un club de padel factura por hora de cancha, pero se administra con herramientas que no
registran nada: la grilla en un cuaderno o un grupo de WhatsApp, la caja en una planilla, la
cantina aparte, el torneo en otra planilla mas. La informacion existe, pero esta partida en
lugares que no se cruzan.

| Problema | Consecuencia |
|---|---|
| La grilla no es un dato | Sobreventa de horarios, turnos regalados sin registro y ninguna forma de saber que franjas rinden y cuales no |
| El jugador depende de que alguien conteste | Reservas que se pierden fuera del horario de mostrador y turnos que se caen sin sena |
| Caja diaria sin cierre contable | Se sabe cuanto entro hoy; no se sabe cual fue el resultado del mes ni cuanto deja realmente la cantina |
| Sin trazabilidad de anulaciones | Un faltante de caja se discute de memoria, sin poder reconstruir quien anulo que y cuando |
| El torneo vive fuera del sistema | Inscripciones, cuadros y gastos del evento no llegan nunca a los numeros del club |
| El precio no acompana a la demanda | La franja de las 21 se llena siempre y la de las 15 no se llena nunca, y las dos se cobran segun una tabla que se actualiza cada varios meses |

## Que resuelve el sistema

Cuatro areas en una sola base de datos, sin exportar entre planillas.

### Modulo 1 - Turnos

* **Grilla horaria** por cancha y por dia, en tiempo real, operable desde el mostrador (celular o
  tablet) y desde la computadora.
* **Reserva online del jugador**: link propio del club, disponible 24 horas, sin que el jugador
  instale nada.
* **Tarifas por franja**: precio distinto por dia y por rango horario (hora pico nocturna vs.
  matinal), configurable por el club sin depender de nosotros.
* **Turnos fijos y abonados**: reserva recurrente semanal con vencimiento y estado de pago.
* **Sena obligatoria** configurable (porcentaje o monto) para confirmar el turno. Sin sena, el
  turno queda pendiente y se libera automaticamente al vencer el plazo.
* **Estados explicitos**: pendiente -> confirmado -> jugado / cancelado / ausente. Cada transicion
  queda registrada con autor y fecha.
* **Avisos al jugador**: confirmacion y recordatorio. La base incluye enlace de WhatsApp de un
  click desde la ficha del turno y email; el envio automatico masivo es un adicional.

*Instalacion: sin cargo*

### Modulo 2 - Torneos

* **Inscripcion online** con formulario propio del club: pareja, categoria, contacto, pago o sena
  de inscripcion.
* **Categorias y control de nivel** por jugador, para armar cuadros parejos.
* **Fixture automatico**: zonas todos contra todos, clasificacion y llave de eliminacion directa,
  con carga de resultados desde el celular.
* **Programacion sobre la grilla**: los partidos del torneo ocupan canchas y horarios en la misma
  grilla de turnos, sin doble reserva.
* **Ranking del club** por puntos acumulados, publicable en el sitio del club.
* **Resultado economico del torneo**: inscripciones, gastos (pelotas, premios, arbitraje) y neto
  del evento, integrados a la caja.

*Instalacion: sin cargo*

### Modulo 3 - Caja, tienda y contabilidad

Es el modulo donde el sistema se diferencia: la oferta disponible en el mercado resuelve punto de
venta y caja diaria, y se detiene antes del cierre contable.

* **Punto de venta** para cantina, pelotas, alquiler de paletas y grip: venta rapida en tablet,
  con o sin turno asociado.
* **Stock** de pelotas y productos de cantina: existencias, costo de compra, alerta de minimo y
  margen real por producto.
* **Caja por turno de empleado**: apertura con monto inicial, movimientos, cierre con arqueo y
  diferencia declarada. Queda registrado quien abrio y quien cerro.
* **Ingresos clasificados por origen** (turnos / torneos / cantina / tienda / alquiler) y por medio
  de pago (efectivo / transferencia / Mercado Pago / cuenta corriente).
* **Egresos con categoria** (mercaderia, mantenimiento, sueldos, servicios, premios), para llegar
  al resultado del periodo y no solo a la caja del dia.
* **Cuentas corrientes** de jugadores y abonados: saldo a favor, deuda e historial de consumos.
* **Informes**: ocupacion por cancha y franja, ingreso por cancha y hora, ticket promedio de
  cantina, resultado mensual, ranking de morosos. Todo exportable a CSV o Excel.
* **Registro de auditoria inmutable**: anulaciones de venta, turnos regalados, ajustes de stock y
  cambios de precio quedan con autor, fecha y valor anterior.

*Instalacion: sin cargo*

### Modulo 4 - Precio por demanda

Una hora de cancha que no se vendio no se recupera nunca. Este modulo deja de tratar al precio
como una tabla fija y lo hace seguir a la demanda real del club, siempre dentro de los limites que
el club define.

* **Bandas fijadas por el club**: precio piso y precio techo por cancha y franja horaria. El
  sistema nunca cotiza por fuera de esa banda. El club pone los limites; el algoritmo se mueve
  adentro.
* **El algoritmo lee la operacion del propio club**, no un promedio de mercado:
  1. Ocupacion historica de esa franja en las ultimas semanas.
  2. Ocupacion del dia a medida que se acerca: cuantas canchas quedan libres y cuanto falta.
  3. Anticipacion de la reserva: la misma franja no vale lo mismo reservada con 10 dias que a
     3 horas del partido.
  4. Calendario del club: feriados, vacaciones, cierres, eventos y torneos.
  5. Historial de cancelaciones y ausencias de esa franja.
* **Sube en pico y baja en valle**: no es solo recargar la hora cara. La baja de ultimo momento en
  franjas que historicamente quedan vacias es la que agrega facturacion nueva.
* **Simulacion antes de activar**: el sistema corre las reglas sobre el historico ya cargado y
  muestra que habria facturado el club con ese esquema. Recien despues se activa.
* **Modo sugerencia y modo automatico**: arranca sugiriendo cambios que el club acepta o rechaza
  uno por uno. Pasa a automatico cuando el club lo decide, no antes.
* **Las reglas del club estan por encima del algoritmo**: precio fijo para abonados y turnos fijos,
  franjas excluidas (escuelita, torneo), tope de variacion por semana, y precio congelado una vez
  confirmada la reserva. A un turno ya reservado no se le sube el precio nunca.
* **Un solo precio para el jugador**: el sitio de reservas muestra el precio vigente, sin precio
  tachado ni contadores de urgencia.
* **Medicion**: informe de ingreso por cancha y hora contra el periodo anterior. Es la unica cifra
  que decide si el modulo se justifica.

Las reglas son explicitas y auditables: cada cambio de precio queda registrado con el valor
anterior, el nuevo y la regla que lo genero. El club siempre puede explicar por que una hora
costo lo que costo.

*Instalacion: sin cargo*

## Que nos diferencia

| | Sistemas actuales del mercado | Este sistema |
|---|---|---|
| Contabilidad | Caja diaria y punto de venta | Ingresos por origen, egresos, margen de cantina, resultado del periodo |
| Auditoria | Parcial o ausente | Registro inmutable de toda anulacion, ajuste y cambio de precio |
| Datos del club | Dentro del SaaS del proveedor | Base propia del club, exportable completa cuando quiera |
| Precio de la cancha | Tarifa fija por franja, cargada a mano | Precio por demanda con bandas del club, simulable contra su propio historico |
| Comision por turno | No cobran | No cobramos |
| Estructura de precio | Escala por cancha activa | Plan por club, no por cancha |
| Pedidos del club | Cola de un producto masivo | Entran al roadmap de un producto con pocos clubes |

El punto de fondo: no es un SaaS al que el club se sube, es un sistema del club. La base de datos
es del club, el respaldo es del club y la exportacion completa esta siempre disponible. Si algun
dia deja de trabajar con nosotros, se va con sus datos, no con un PDF.

## Planes

Sin costo de instalacion. Sin comision por turno. Sin costo por usuario.

| Plan | Incluye | Precio mensual |
|---|---|---|
| **Turnos** | Modulo 1 + caja simple (ingresos por turno) | $--.--- |
| **Club** | Modulos 1 + 2 + 3 completos | $--.--- |
| Cancha adicional | Sobre cualquier plan | $-.--- |
| Sede adicional | Grilla, caja y stock propios por sede | $--.--- |

* Pago anual con bonificacion respecto del esquema mensual.
* Compromiso minimo de 12 meses en el plan mensual, o preaviso de baja. Es la contrapartida de no
  cobrar puesta en marcha.
* Los precios se ajustan una vez por ano, avisando con 30 dias.

**Adicionales opcionales** (solo si el club los pide):

| Adicional | Precio | Nota |
|---|---|---|
| Modulo 4 - Precio por demanda | $-.---/mes | Sobre plan Club. Necesita al menos 8 semanas de historico de turnos en el sistema; hasta entonces funciona en modo simulacion, sin cargo |
| WhatsApp automatico (recordatorios y deudas) | $-.---/mes | Requiere cuenta de WhatsApp Business API a nombre del club y plantillas aprobadas por Meta; el costo por mensaje de Meta va aparte |
| Facturacion electronica ARCA | $-.---/mes | Via intermediario habilitado; requiere CUIT, punto de venta y delegacion del club |
| Migracion de historico | A presupuestar | Cargar turnos, jugadores y stock desde planillas existentes |
| Capacitacion presencial en el club | A presupuestar | La capacitacion remota esta incluida |

Las comisiones de la pasarela de pago (Mercado Pago) cuando el jugador sena el turno online son
del club y no forman parte de este presupuesto.

**Programa socio fundador** (primeros clubes): bonificacion sobre el plan Club durante los
primeros meses. A cambio: reuniones de feedback cada dos semanas, tolerancia a errores del primer
periodo y autorizacion para usar al club como caso de referencia.

*Valores de cada plan en la propuesta economica que acompana este documento.*

## Puesta en marcha

Sin cargo, y con plazo comprometido: 5 dias.

1. **Dia 1** - Relevamiento: canchas, franjas, tarifas, productos de cantina, empleados y permisos.
2. **Dia 2 y 3** - Configuracion del club en el sistema, carga de tarifas y productos, sitio de
   reservas con la marca del club.
3. **Dia 4** - Capacitacion remota: mostrador (1 hora) y administracion (1 hora). Queda grabada.
4. **Dia 5** - Salida en vivo acompanada, con nosotros disponibles en el horario de mayor
   movimiento.
5. **Primeras 2 semanas** - Ajustes de configuracion sin cargo.

No hace falta comprar hardware. Funciona en el celular del encargado, en cualquier tablet Android
o iPad, y en la computadora del mostrador si ya existe. Para la cantina alcanza una tablet de gama
baja; si el club quiere impresora de tickets, se conecta la que ya tenga.

**Soporte incluido**: WhatsApp directo, en la ventana horaria en que el club factura. Respuesta
comprometida por escrito, con prioridad maxima si la grilla o la caja estan caidas.

## Fuentes

El apartado "Que nos diferencia" y el diseno de planes surgen de un relevamiento de la oferta
disponible para clubes deportivos en Argentina, sobre informacion publica de los proveedores:

* Clubo - https://www.clubo.com.ar/
* CanchaFija - https://canchafija.com.ar/
* PadelCRM - https://padelcrm.com/

Servicios de terceros mencionados en el documento, con sus condiciones propias:

* Mercado Pago (Checkout Pro) - cobro de senas e inscripciones; comisiones de la pasarela a cargo
  del club.
* WhatsApp Business API (Meta) - requisito del adicional de mensajeria automatica; alta y costo
  por mensaje a nombre del club.
* ARCA - facturacion electronica via intermediario habilitado; requiere CUIT, punto de venta y
  delegacion del club.

Nota de alcance: el relevamiento se hizo sobre informacion publicada por cada proveedor y puede
haber cambiado. Las condiciones comerciales de terceros (pasarela, Meta, ARCA) las fija cada
proveedor y no dependen de nosotros.
