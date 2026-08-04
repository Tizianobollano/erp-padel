# Modelo de datos - Modulo 1 (Reserva de cancha)

Migracion: `migrations/0001_reservas.sql`. D1 (SQLite), una base por club (ver ADR-0001 del
proyecto). Alcance cerrado por el humano: reserva publica sin login (jugador identificado por
telefono), panel privado con login para el club, cancelacion incluida. Sin pagos/sena, sin
torneos, sin contabilidad, sin precio por demanda.

## Entidades

**canchas** -- cancha fisica del club. `activa` es baja logica (mantenimiento) que preserva el
historial de reservas de esa cancha.

**horarios_atencion** -- grilla horaria del club: un renglon por dia de la semana
(`dia_semana` 0=domingo..6=sabado, mismo criterio que `strftime('%w', ...)` de SQLite) con hora de
apertura, hora de cierre y duracion de turno en minutos. Club-wide, no por cancha (ver "Decisiones
no triviales" mas abajo). De esta tabla la app deriva, en memoria, la grilla de horarios
reservables para una fecha dada -- no hay una tabla de turnos vacios pre-generada.

**reservas** -- la ocupacion de un turno puntual: cancha + fecha + hora_inicio + datos del
jugador. Cada fila es una reserva real, no un slot abstracto. `estado` es `confirmada` o
`cancelada`; cancelar es un UPDATE de estado (mas `cancelada_at`/`cancelada_por_email`), nunca un
DELETE -- la fila queda como historial.

## Relaciones

- `horarios_atencion` no tiene FK hacia `canchas`: es config del club, no de una cancha
  particular (ver decision mas abajo).
- `reservas.cancha_id` -> `canchas.id` (N:1). Una cancha tiene muchas reservas; una reserva es de
  una sola cancha.
- No hay tabla `jugadores`: el jugador no tiene cuenta en este modulo (scope cerrado), asi que su
  nombre y telefono se guardan directo en la fila de `reservas` (denormalizado a proposito, ver
  mas abajo).

## El mecanismo anti-doble-reserva

El requisito: dos jugadores no pueden terminar con una reserva **confirmada** para la misma
cancha+horario, y la garantia tiene que estar en el schema, no depender de que la app haga un
SELECT antes del INSERT (esa secuencia tiene una ventana de carrera: dos requests pueden pasar el
SELECT antes de que cualquiera de los dos haga el INSERT).

La solucion es un **indice UNICO PARCIAL**:

```sql
CREATE UNIQUE INDEX idx_reservas_turno_unico
  ON reservas (cancha_id, fecha, hora_inicio)
  WHERE estado = 'confirmada';
```

Por que funciona:

1. El turno se representa como la tupla natural `(cancha_id, fecha, hora_inicio)` directamente en
   la fila de la reserva -- no hace falta una tabla de slots intermedia para tener algo sobre lo
   que poner un UNIQUE.
2. El indice es **parcial** (`WHERE estado = 'confirmada'`): la restriccion de unicidad solo
   aplica entre filas confirmadas. Una reserva cancelada sale del alcance del indice
   automaticamente, liberando ese cancha+fecha+hora_inicio para una fila nueva sin tener que
   borrar ni reciclar la fila cancelada (que se conserva como historial/auditoria).
3. La verificacion de unicidad la hace el motor SQLite **dentro** de la operacion de INSERT, de
   forma atomica. Con dos INSERT concurrentes para el mismo turno, D1 serializa las dos
   escrituras (una base D1 tiene un unico writer logico) y el motor acepta la primera que llega;
   la segunda dispara `SQLITE_CONSTRAINT` porque violaria el indice unico. No hay ventana entre
   "leer si esta libre" y "escribir": la unica operacion que importa es el INSERT mismo, y esa
   operacion es la que arbitra quien gana.
4. Consecuencia para api-developer: la logica de reserva es "intentar el INSERT con
   estado='confirmada' directamente; si el motor devuelve constraint violation, informar al
   jugador que el turno ya no esta disponible". No hace falta lock explicito, transaccion de
   lectura previa, ni Durable Object para arbitrar esto -- el propio schema hace la carrera
   imposible de ganar por las dos partes.

Limite conocido (no resuelto a nivel de schema, documentado a proposito): el indice previene
colisiones exactas de `(cancha_id, fecha, hora_inicio)`. Si `horarios_atencion` cambiara de
`duracion_turno_minutos` para un dia y ya existieran reservas confirmadas creadas bajo la grilla
vieja, en teoria dos turnos de distinta "epoca" de configuracion podrian solaparse en el tiempo
sin compartir `hora_inicio` exacto. SQLite no tiene constraints de exclusion por rango (a
diferencia de `EXCLUDE USING gist` en Postgres), y resolverlo a nivel DB requeriria logica
adicional no justificada por el caso de uso descrito (cambiar la duracion de turno es una accion
administrativa infrecuente). Si esto importa en la practica, validarlo en la app al cambiar
`horarios_atencion`, no en el schema.

## Decisiones no triviales que el humano deberia conocer

- **`horarios_atencion` es club-wide, no por cancha.** `propuesta.md` describe la funcionalidad
  completa como "grilla horaria por cancha y por dia", pero el alcance cerrado de este ejercicio
  ("un jugador reserva una cancha en un horario disponible") no menciona horarios distintos entre
  canchas del mismo club. Modele la version mas simple que cubre el caso descrito. Si en la
  practica un club necesita, por ejemplo, una cancha techada con horario extendido, el cambio es
  aditivo: agregar `cancha_id INTEGER NULL REFERENCES canchas(id)` a `horarios_atencion` (NULL =
  default del club, valor = override de esa cancha).
- **No modele `usuarios`/auth del panel privado.** El deliverable pedido es especificamente
  canchas + horarios + reservas. El panel del club necesita login (`wiki/index.md` ya fija el
  patron: "usuarios propios con roles, patron de erp-inmobiliaria" -- Access autentica, una tabla
  autoriza por email, ver `projects/inmobiliaria/migrations/0001_init.sql`). Por eso
  `reservas.cancelada_por_email` es un campo informativo (TEXT, sin FK), igual que
  `created_by_email` en `gestoria_en_movimiento/bienes`: identidad que viene del JWT de Access, no
  ata la fila a que el usuario siga existiendo. Falta modelar la tabla de autorizacion real antes
  de que api-developer construya el login del panel -- no es parte de este entregable pero es un
  prerequisito de la siguiente pieza.
- **Estados simplificados a `confirmada`/`cancelada`.** El Modulo 1 completo de `propuesta.md`
  describe `pendiente -> confirmado -> jugado / cancelado / ausente`, pero ese flujo existe porque
  hay una sena que confirma el turno. Este ejercicio excluye pagos explicitamente, asi que no hay
  estado "pendiente" (la reserva se confirma al crearse) ni necesidad descrita de marcar
  jugado/ausente. Si esos estados vuelven cuando se integre Mercado Pago, son aditivos.
- **`hora_fin` se guarda en la reserva, no se recalcula.** Se deriva de
  `horarios_atencion.duracion_turno_minutos` en el momento del INSERT y queda fijo. Si el club
  cambia despues la duracion de turno para ese dia, las reservas ya confirmadas conservan su
  horario real en vez de recalcularse con la config nueva.
- **Sin tabla `jugadores`.** El jugador no tiene cuenta ni historial visible en este modulo
  (scope cerrado); nombre y telefono viven directo en `reservas`. Si Modulo 2 (torneos) o una
  funcionalidad de "mis reservas" por telefono aparecen mas adelante, ahi se justifica extraer
  `jugadores` -- no antes.

## Gaps / preguntas abiertas para el humano o para software-architect

- No hay `wrangler.jsonc` todavia en este worktree: asumi `migrations/` en la raiz del proyecto
  (default de `wrangler d1 migrations`, y como lo usa `inmobiliaria`). Confirmar
  `migrations_dir` cuando devops/api-developer creen el config.
- Tabla de autorizacion del panel (`usuarios` o equivalente) no existe todavia -- bloqueante para
  que api-developer implemente el login del panel privado, no para el formulario publico ni para
  el mecanismo de reserva en si.
- Sin definir: que pasa con una reserva cuya `fecha` ya paso y sigue `confirmada` (no hay estado
  "jugada"). Si el club quiere distinguir "paso y se jugo" de "paso sin marcar", es un estado
  nuevo aditivo, no cubierto por este scope.
