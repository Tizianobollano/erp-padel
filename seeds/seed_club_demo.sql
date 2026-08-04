-- Seed de club demo: datos minimos para que el Modulo 1 sea usable.
-- NO es una migracion: las migraciones definen estructura, esto define contenido de ejemplo.
-- Se aplica a mano sobre una base vacia (local o staging), nunca sobre datos reales de un club.
--
-- Creado 2026-08-04 al desplegar a staging por primera vez: el deploy salio bien, las tablas
-- quedaron creadas, y la app era inusable porque no habia ninguna cancha ni horario. Ningun
-- artefacto del proyecto proveia estos datos -- se cargaban a mano en local y no quedaban.
--
-- Local:   wrangler d1 execute erp-padel-reserva-cancha-staging --local  --file=./seeds/seed_club_demo.sql
-- Staging: wrangler d1 execute erp-padel-reserva-cancha-staging --remote --file=./seeds/seed_club_demo.sql

-- Idempotente: se puede correr dos veces sin duplicar (nombre y dia_semana son UNIQUE).

INSERT OR IGNORE INTO canchas (nombre, activa, created_at) VALUES
  ('Cancha 1', 1, '2026-08-04T00:00:00Z'),
  ('Cancha 2', 1, '2026-08-04T00:00:00Z'),
  ('Cancha 3', 0, '2026-08-04T00:00:00Z');  -- inactiva a proposito: cubre el caso de baja logica

-- Turnos de 90 minutos. Lunes a viernes 08:00-23:00; sabado y domingo 09:00-22:00.
-- dia_semana: 0=domingo .. 6=sabado (convencion de la migracion 0001).
INSERT OR IGNORE INTO horarios_atencion (dia_semana, hora_apertura, hora_cierre, duracion_turno_minutos) VALUES
  (0, '09:00', '22:00', 90),
  (1, '08:00', '23:00', 90),
  (2, '08:00', '23:00', 90),
  (3, '08:00', '23:00', 90),
  (4, '08:00', '23:00', 90),
  (5, '08:00', '23:00', 90),
  (6, '09:00', '22:00', 90);
