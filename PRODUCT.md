# PRODUCT.md - Modulo 1: Reserva de cancha (erp-padel)

Redactado por design-lead sin comando interactivo `/impeccable init` (equivalente greenfield),
sourceando wiki/index.md, wiki/propuesta.md y wiki/architecture/modelo-datos-reservas.md de este
proyecto. erp-padel es, en su conjunto, un producto enlatado sin cliente ni marca todavia (ver
wiki/index.md: "Estado: idea con propuesta escrita. Sin cliente."). Este documento describe
especificamente el modulo que se esta construyendo ahora en este worktree, no el producto completo
de 4 modulos de propuesta.md.

## 1. Producto

Modulo 1 - Reserva de cancha, primer pedazo construible del enlatado erp-padel (nombre comercial
de marca sin definir, decision pendiente 2 de wiki/index.md). Categoria: herramienta operativa de
mostrador para un club de padel, no un producto de consumo masivo.

Alcance cerrado por el humano (no negociable en esta iteracion):
- Publico, sin login: un jugador reserva una cancha en un horario disponible, identificado por
  nombre + telefono.
- Privado, con login (Cloudflare Access): panel del club para ver y cancelar reservas.
- Sin pagos, sin sena, sin torneos, sin contabilidad, sin precio por demanda. No disenar "espacio
  para despues" para ninguno de estos: son de propuesta.md (producto completo), no de este modulo.

## 2. Usuarios

Dos perfiles, sin punto de contacto entre ellos dentro de este modulo:

- **Jugador** (publico, sin cuenta): quiere reservar una cancha para jugar. Llega desde el link de
  reservas del club, mayoritariamente desde el celular. No tiene password, no tiene historial, no
  vuelve a ver su reserva despues de confirmarla (sin "mis reservas" en este modulo).
- **Personal del club** (privado, logueado via Cloudflare Access): encargado o recepcion que
  necesita ver la agenda de reservas y cancelar un turno cuando el jugador avisa que no viene o
  cuando hubo un error de carga. Sin distincion de roles dentro del panel (cualquier usuario
  autorizado por Access ve y cancela todo -- ver modelo-datos-reservas.md, "no modele
  usuarios/auth con roles").

## 3. Proposito del producto

Que resuelve: hoy la reserva se hace por telefono o WhatsApp manual, con el riesgo real de
prometer el mismo turno dos veces si dos personas escriben casi al mismo tiempo. Este modulo
reemplaza eso por un formulario que consulta disponibilidad real y por un mecanismo a nivel de
base de datos que hace imposible la doble reserva confirmada (indice UNICO PARCIAL sobre
cancha+fecha+hora_inicio, ver modelo-datos-reservas.md).

Que define exito: un jugador reserva sin llamar a nadie, y el club confia en que lo que ve en el
panel es la grilla real -- si dos jugadores llegan al mismo turno casi en simultaneo, el segundo
recibe una respuesta clara de que se le adelantaron, no un error generico ni una reserva fantasma.

Fuera de alcance explicito de este modulo (recortado a proposito, ver arriba):
- Sin pagos ni sena: la reserva se confirma sin cobrar nada online.
- Sin torneos, sin caja/contabilidad, sin precio por demanda ni tarifas: un turno no tiene precio
  en este modulo.
- Sin cuenta de jugador: no hay login, historial ni notificaciones automaticas mas alla de la
  confirmacion en pantalla al reservar.
- Sin roles dentro del panel privado.

## 4. Personalidad de marca

Sin marca propia todavia (nombre comercial pendiente). Para este modulo, el tono es:

- **Directo y funcional, no vende.** El jugador que llega ya decidio reservar; no hace falta
  convencerlo con copy de marketing.
- **Confianza operativa.** Mostrar disponibilidad real, sin optimismo falso: si no hay lugar, se
  dice de una.
- **Voz de mostrador de club, no de app corporativa.** Espanol rioplatense neutro, vocabulario de
  cancha ("turno", "cancha"), no vocabulario de SaaS ("slot", "unidad", "booking").

## 5. Anti-referencias

- Nada de patrones IA genericos: sin gradiente purpura-azul, sin icon tile arriba de cada titulo,
  sin cards anidadas en cards.
- Nada de vocabulario de SaaS generico ("simplifica tu negocio", "todo en un solo lugar"): es una
  herramienta de mostrador, no un pitch de producto.
- Nada de patron de urgencia/escasez de e-commerce ("quedan 2 turnos!", contador regresivo).
  propuesta.md ya establece esta prohibicion para el Modulo 4 (precio por demanda) con mas razon
  todavia; este modulo, sin precio de por medio, la hereda sin excepcion.
- Evitar el tono de la competencia relevada en propuesta.md (Clubo, CanchaFija, PadelCRM):
  interfaces de grilla semanal densa tipo calendario de Outlook. Esta reserva es de una cancha y
  una fecha por vez, no una vista de calendario completa.
- Sin fotos de stock de padel ni assets genericos de cancha: no hay marca ni fotos propias del
  club todavia: mejor nada que una foto generica del rubro.

## 6. Principios de diseno

- El estado del turno es la unica fuente de verdad visible: si aparece disponible, tiene que poder
  reservarse; si la carrera concurrente la gana otro jugador, la UI lo explica como una carrera
  ("se te adelantaron"), no como un error tecnico generico.
- Un flujo sin wizard numerado: cancha -> fecha -> horario -> datos -> confirmar, en una sola
  pantalla, sin "paso 1 de 4".
- El panel del club prioriza escaneo rapido sobre densidad de datos: el encargado mira la lista,
  encuentra la reserva, cancela. Sin metricas ni analitica en este modulo.
- Cancelar es destructivo y sin deshacer desde la UI (la fila queda en la base como historial,
  pero una vez cancelada no vuelve a confirmarse desde el panel). La confirmacion tiene que
  dejarlo claro antes de ejecutar la accion.
- Mobile primero en ambos flujos: el jugador reserva desde el celular, el encargado opera desde el
  mostrador con tablet o celular (ver wiki/index.md).

## 7. Accesibilidad e inclusion

Estandar base: WCAG 2.1 AA.

- **Teclado**: foco visible en todo elemento interactivo (turnos, inputs, botones, filas de
  accion); orden de tab logico (cancha -> fecha -> horario -> nombre -> telefono -> confirmar en
  el formulario publico); el Modal de cancelacion atrapa el foco mientras esta abierto (Tab/Shift+Tab
  ciclan solo entre sus elementos, nada de la pagina de fondo es alcanzable por teclado), foco entra
  al primer elemento al abrir, Esc y click afuera cierran, foco vuelve al elemento que abrio el
  modal al cerrar. Criterio de aceptacion detallado en design.md, seccion 7 "Modal de cancelacion"
  (revision 2026-08-04: la redaccion anterior, "sin trampas de foco", era ambigua -- en el patron
  ARIA de dialogo modal el foco SI debe quedar atrapado dentro mientras esta abierto, eso es lo
  correcto, no lo prohibido).
- **Contraste real**: minimo 4.5:1 en texto normal, 3:1 en texto grande y controles. Los turnos
  disponibles/ocupados de la grilla horaria no pueden distinguirse solo por color (ver design.md
  seccion 7, TurnosGrid).
- **Semantica**: jerarquia de encabezados unica por pagina, label asociado a cada campo (nunca
  placeholder como unico label), `<button>` para acciones que no navegan (elegir turno, cancelar),
  `<a>` para las que si navegan.
- **Errores de formulario** (telefono vacio, fecha invalida, 409 de turno tomado) identificados en
  texto explicito, nunca solo con borde en rojo.
- **prefers-reduced-motion** respetado en toda transicion (Modal, Toast, cambio de estado del
  formulario): degrada a cambio instantaneo sin animacion.
- **Touch targets >= 44x44px** en mobile, en particular los botones de turno de la grilla horaria,
  que son el control mas repetido de toda la pantalla publica.
