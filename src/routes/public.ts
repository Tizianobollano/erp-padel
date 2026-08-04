// Rutas publicas, sin login: consultar disponibilidad y reservar un turno. El jugador se
// identifica por telefono, sin cuenta (alcance cerrado del Modulo 1).

import { Hono } from "hono";
import type { Env } from "../config/types";
import { all, one, run } from "../db/client";
import { diaSemana, fechaValida, horaAMinutos, horaValida, minutosAHora } from "../time";

export const publicRoutes = new Hono<{ Bindings: Env }>();

type Cancha = { id: number; nombre: string; activa: number };
type HorarioAtencion = {
  hora_apertura: string;
  hora_cierre: string;
  duracion_turno_minutos: number;
};

function turnosDelDia(horario: HorarioAtencion): string[] {
  const inicio = horaAMinutos(horario.hora_apertura);
  const fin = horaAMinutos(horario.hora_cierre);
  const turnos: string[] = [];
  for (let m = inicio; m + horario.duracion_turno_minutos <= fin; m += horario.duracion_turno_minutos) {
    turnos.push(minutosAHora(m));
  }
  return turnos;
}

// GET /api/disponibilidad?cancha_id=1&fecha=2026-08-10
// Grilla de turnos del dia derivada de horarios_atencion, marcando los ya ocupados por una
// reserva confirmada (mismo criterio que documenta wiki/architecture/modelo-datos-reservas.md).
publicRoutes.get("/disponibilidad", async (c) => {
  const canchaId = Number(c.req.query("cancha_id"));
  const fecha = c.req.query("fecha") ?? "";

  if (!Number.isInteger(canchaId) || canchaId <= 0) {
    return c.json({ error: "cancha_id invalido" }, 400);
  }
  if (!fechaValida(fecha)) {
    return c.json({ error: "fecha invalida, formato YYYY-MM-DD" }, 400);
  }

  const cancha = await one<Cancha>(c.env.DB, "SELECT id, nombre, activa FROM canchas WHERE id = ?", canchaId);
  if (!cancha || cancha.activa !== 1) {
    return c.json({ error: "cancha no encontrada" }, 404);
  }

  const horario = await one<HorarioAtencion>(
    c.env.DB,
    "SELECT hora_apertura, hora_cierre, duracion_turno_minutos FROM horarios_atencion WHERE dia_semana = ?",
    diaSemana(fecha),
  );
  if (!horario) {
    return c.json({ cancha_id: canchaId, fecha, turnos: [] });
  }

  const ocupados = await all<{ hora_inicio: string }>(
    c.env.DB,
    "SELECT hora_inicio FROM reservas WHERE cancha_id = ? AND fecha = ? AND estado = 'confirmada'",
    canchaId,
    fecha,
  );
  const ocupadosSet = new Set(ocupados.map((r) => r.hora_inicio));

  const turnos = turnosDelDia(horario).map((hora_inicio) => ({
    hora_inicio,
    disponible: !ocupadosSet.has(hora_inicio),
  }));

  return c.json({ cancha_id: canchaId, fecha, turnos });
});

// POST /api/reservas { cancha_id, fecha, hora_inicio, jugador_nombre, jugador_telefono }
publicRoutes.post("/reservas", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") return c.json({ error: "body invalido" }, 400);

  const { cancha_id, fecha, hora_inicio, jugador_nombre, jugador_telefono } = body as Record<string, unknown>;

  if (!Number.isInteger(cancha_id) || (cancha_id as number) <= 0) {
    return c.json({ error: "cancha_id invalido" }, 400);
  }
  if (typeof fecha !== "string" || !fechaValida(fecha)) {
    return c.json({ error: "fecha invalida, formato YYYY-MM-DD" }, 400);
  }
  if (typeof hora_inicio !== "string" || !horaValida(hora_inicio)) {
    return c.json({ error: "hora_inicio invalida, formato HH:MM" }, 400);
  }
  if (typeof jugador_nombre !== "string" || jugador_nombre.trim() === "") {
    return c.json({ error: "jugador_nombre requerido" }, 400);
  }
  if (typeof jugador_telefono !== "string" || jugador_telefono.trim() === "") {
    return c.json({ error: "jugador_telefono requerido" }, 400);
  }

  const cancha = await one<Cancha>(c.env.DB, "SELECT id, nombre, activa FROM canchas WHERE id = ?", cancha_id);
  if (!cancha || cancha.activa !== 1) {
    return c.json({ error: "cancha no encontrada" }, 404);
  }

  const horario = await one<HorarioAtencion>(
    c.env.DB,
    "SELECT hora_apertura, hora_cierre, duracion_turno_minutos FROM horarios_atencion WHERE dia_semana = ?",
    diaSemana(fecha),
  );
  if (!horario) {
    return c.json({ error: "el club no atiende ese dia" }, 400);
  }

  if (!turnosDelDia(horario).includes(hora_inicio)) {
    return c.json({ error: "hora_inicio no coincide con la grilla de turnos" }, 400);
  }

  const horaFin = minutosAHora(horaAMinutos(hora_inicio) + horario.duracion_turno_minutos);
  const creadaAt = new Date().toISOString();

  try {
    const res = await run(
      c.env.DB,
      `INSERT INTO reservas (cancha_id, fecha, hora_inicio, hora_fin, jugador_nombre, jugador_telefono, estado, creada_at)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmada', ?)`,
      cancha_id,
      fecha,
      hora_inicio,
      horaFin,
      jugador_nombre.trim(),
      jugador_telefono.trim(),
      creadaAt,
    );
    return c.json(
      {
        id: res.meta.last_row_id,
        cancha_id,
        fecha,
        hora_inicio,
        hora_fin: horaFin,
        estado: "confirmada",
      },
      201,
    );
  } catch (err) {
    // El indice UNICO PARCIAL idx_reservas_turno_unico (0001_reservas.sql) es lo que arbitra la
    // carrera entre dos INSERT concurrentes para el mismo turno: no hay SELECT-then-INSERT antes
    // de esto. D1 devuelve el rechazo como Error cuyo mensaje incluye "UNIQUE constraint failed"
    // sobre ese indice; cualquier otro error se re-lanza (no es un caso esperado de este endpoint).
    if (err instanceof Error && /UNIQUE constraint failed/i.test(err.message)) {
      return c.json({ error: "turno ya no disponible" }, 409);
    }
    throw err;
  }
});
