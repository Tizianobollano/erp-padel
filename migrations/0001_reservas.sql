-- Migracion 0001: canchas, grilla horaria y reservas (Modulo 1 - Reserva de cancha).
-- Aditiva. Dialecto SQLite/D1. migrations_dir asumido "migrations" en la raiz del proyecto
-- (default de `wrangler d1 migrations`): no existe wrangler.jsonc todavia en este worktree,
-- api-developer/devops confirman o realinean la ruta cuando lo creen.
--
-- Convenciones (consistentes con inmobiliaria ADR-0007, el patron de auth ya citado en
-- wiki/index.md de este proyecto):
--   PK INTEGER PRIMARY KEY AUTOINCREMENT
--   fechas de calendario TEXT 'YYYY-MM-DD'; horas TEXT 'HH:MM' 24h; timestamps TEXT ISO-8601 UTC,
--   todos provistos por la app (sin DEFAULT de SQL: la app es la unica fuente de "ahora")
--   booleanos INTEGER 0/1 con CHECK
--
-- Detalle del modelo, relaciones y el mecanismo anti-doble-reserva:
-- wiki/architecture/modelo-datos-reservas.md

-- Cancha fisica del club. `activa` es baja logica (mantenimiento) sin perder el historial de
-- reservas de esa cancha.
CREATE TABLE canchas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL UNIQUE,
  activa     INTEGER NOT NULL DEFAULT 1 CHECK (activa IN (0, 1)),
  created_at TEXT NOT NULL
);

-- Grilla horaria del club: un renglon por dia de la semana (0=domingo..6=sabado, igual que
-- strftime('%w', ...) de SQLite) fija entre que horas se puede reservar y cada cuantos minutos
-- arranca un turno. Club-wide, no por cancha: el alcance cerrado de este modulo no describe
-- horarios distintos por cancha. Si aparece ese caso, agregar cancha_id INTEGER NULL aca
-- (NULL = default del club, valor = override de esa cancha especifica).
CREATE TABLE horarios_atencion (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  dia_semana             INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_apertura          TEXT NOT NULL,
  hora_cierre            TEXT NOT NULL,
  duracion_turno_minutos INTEGER NOT NULL CHECK (duracion_turno_minutos > 0),
  UNIQUE (dia_semana),
  CHECK (hora_apertura < hora_cierre)
);

-- Reserva de un turno puntual. No hay una tabla de "turnos" con filas pre-generadas para cada
-- fecha futura: la grilla disponible se calcula en la app a partir de horarios_atencion, y una
-- fila de reservas ES la ocupacion de un turno (cancha + fecha + hora_inicio) concreto.
--
-- Mecanismo anti-doble-reserva: el indice UNICO PARCIAL de mas abajo (idx_reservas_turno_unico)
-- es lo que hace imposible, a nivel de motor SQLite y no de logica de aplicacion, que dos INSERT
-- concurrentes para la misma cancha+fecha+hora_inicio terminen ambos con estado='confirmada'.
-- Detalle y por que funciona: wiki/architecture/modelo-datos-reservas.md.
CREATE TABLE reservas (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  cancha_id           INTEGER NOT NULL REFERENCES canchas(id),
  fecha               TEXT NOT NULL,
  hora_inicio         TEXT NOT NULL,
  hora_fin            TEXT NOT NULL,
  jugador_nombre      TEXT NOT NULL,
  jugador_telefono    TEXT NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada')),
  creada_at           TEXT NOT NULL,
  cancelada_at        TEXT,
  cancelada_por_email TEXT,  -- informativo (usuario del panel que cancelo), no FK: ver nota en wiki
  CHECK (hora_fin > hora_inicio),
  CHECK (
    (estado = 'confirmada' AND cancelada_at IS NULL AND cancelada_por_email IS NULL)
    OR
    (estado = 'cancelada' AND cancelada_at IS NOT NULL)
  )
);

-- Unico por cancha+fecha+hora_inicio, pero SOLO entre reservas confirmadas (indice parcial).
-- Cancelar una reserva no borra ni reutiliza la fila: pasa a estado='cancelada' y sale del
-- alcance del indice, liberando el turno para una fila NUEVA. Ante dos INSERT concurrentes para
-- el mismo turno, SQLite acepta el primero que llega y devuelve SQLITE_CONSTRAINT en el segundo;
-- la app solo necesita capturar ese error puntual, sin lock ni SELECT-then-INSERT.
CREATE UNIQUE INDEX idx_reservas_turno_unico
  ON reservas (cancha_id, fecha, hora_inicio)
  WHERE estado = 'confirmada';

CREATE INDEX idx_reservas_cancha_fecha ON reservas (cancha_id, fecha);
CREATE INDEX idx_reservas_fecha_estado ON reservas (fecha, estado);
