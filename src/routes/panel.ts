// Rutas privadas del panel del club: listar reservas y cancelar. Montadas detras de
// requireAccess en src/index.ts.

import { Hono } from "hono";
import type { Env } from "../config/types";
import { all, one, run } from "../db/client";

export const panelRoutes = new Hono<{ Bindings: Env }>();

type Reserva = {
  id: number;
  cancha_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  jugador_nombre: string;
  jugador_telefono: string;
  estado: string;
  creada_at: string;
  cancelada_at: string | null;
  cancelada_por_email: string | null;
};

// GET /api/panel/reservas?fecha=2026-08-10&estado=confirmada (ambos filtros opcionales)
panelRoutes.get("/reservas", async (c) => {
  const fecha = c.req.query("fecha");
  const estado = c.req.query("estado");
  if (estado && estado !== "confirmada" && estado !== "cancelada") {
    return c.json({ error: "estado invalido" }, 400);
  }

  const condiciones: string[] = [];
  const params: unknown[] = [];
  if (fecha) {
    condiciones.push("fecha = ?");
    params.push(fecha);
  }
  if (estado) {
    condiciones.push("estado = ?");
    params.push(estado);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  const reservas = await all<Reserva>(
    c.env.DB,
    `SELECT id, cancha_id, fecha, hora_inicio, hora_fin, jugador_nombre, jugador_telefono,
            estado, creada_at, cancelada_at, cancelada_por_email
     FROM reservas ${where}
     ORDER BY fecha DESC, hora_inicio DESC`,
    ...params,
  );
  return c.json({ reservas });
});

// POST /api/panel/reservas/:id/cancelar
panelRoutes.post("/reservas/:id/cancelar", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: "id invalido" }, 400);

  const existente = await one<{ estado: string }>(c.env.DB, "SELECT estado FROM reservas WHERE id = ?", id);
  if (!existente) return c.json({ error: "reserva no encontrada" }, 404);

  const canceladaAt = new Date().toISOString();
  const res = await run(
    c.env.DB,
    `UPDATE reservas SET estado = 'cancelada', cancelada_at = ?, cancelada_por_email = ?
     WHERE id = ? AND estado = 'confirmada'`,
    canceladaAt,
    c.get("user").email,
    id,
  );
  if (res.meta.changes === 0) {
    return c.json({ error: "la reserva ya estaba cancelada" }, 409);
  }
  return c.json({ id, estado: "cancelada", cancelada_at: canceladaAt });
});
