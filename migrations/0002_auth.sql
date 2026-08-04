-- Migracion 0002: usuarios del panel privado del club.
-- Aditiva. Dialecto SQLite/D1, mismas convenciones que 0001_reservas.sql.
--
-- Patron: Cloudflare Access autentica (verifica el JWT y quien es la persona), esta tabla
-- autoriza (si esa persona puede entrar al panel). Igual que
-- projects/inmobiliaria/migrations/0001_init.sql (ADR-0003 de ese proyecto), citado como
-- referencia de auth en wiki/index.md de erp-padel. El email es la clave: viene del JWT de
-- Access, normalizado a lowercase por src/auth/usuarios.ts antes de cualquier query.
--
-- Sin columna de rol: a diferencia de inmobiliaria (admin/gestor/lectura), el alcance de este
-- modulo (ver y cancelar reservas) no distingue permisos entre usuarios del panel. Si aparece esa
-- necesidad, agregar `rol` es un cambio aditivo.
CREATE TABLE usuarios (
  email      TEXT PRIMARY KEY,
  nombre     TEXT NOT NULL,
  activo     INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  created_at TEXT NOT NULL
);
