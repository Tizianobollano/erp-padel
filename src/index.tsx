import { Hono } from "hono";
import type { Env } from "./config/types";
import { renderer } from "./renderer";
import { requireAccess } from "./auth/middleware";
import { publicRoutes } from "./routes/public";
import { panelRoutes } from "./routes/panel";
import { all } from "./db/client";
import { CLUB_NOMBRE } from "./config/club";
import { ReservarPage } from "./pages/reservar";
import { PanelPage, type ReservaRow } from "./pages/panel";

const app = new Hono<{ Bindings: Env }>();

app.use(renderer);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/api", publicRoutes);

const panelApi = new Hono<{ Bindings: Env }>();
panelApi.use("*", requireAccess);
panelApi.route("/", panelRoutes);
app.route("/api/panel", panelApi);

type Cancha = { id: number; nombre: string };

// GET /reservar: pagina publica (design.md seccion 4.A). Solo trae lo que hace falta para el
// SSR inicial (Select de canchas activas + min= del Input date); la grilla de turnos se pide
// por fetch desde ClientScript cuando cancha+fecha estan completos (no hay contrato de API para
// listar canchas -- se consulta D1 directo aca, mismo helper `all` que usan las rutas).
app.get("/reservar", async (c) => {
  const canchas = await all<Cancha>(c.env.DB, "SELECT id, nombre FROM canchas WHERE activa = 1 ORDER BY nombre");
  const fecha_minima = new Date().toISOString().slice(0, 10);
  return c.render(<ReservarPage club_nombre={CLUB_NOMBRE} canchas={canchas} fecha_minima={fecha_minima} />, {
    meta: {
      title: `Reservar cancha — ${CLUB_NOMBRE}`,
      description: "Reserva tu cancha en menos de un minuto.",
      siteName: CLUB_NOMBRE,
    },
  });
});

// GET /panel: pagina privada (design.md seccion 4.B). Detras de requireAccess igual que
// /api/panel/*. Filtra por los mismos parametros que GET /api/panel/reservas (fecha, estado);
// fecha por defecto = hoy (design.md 4.B: "el encargado casi siempre busca las de hoy").
// cancha_nombre no viene de la API (solo cancha_id) -- se resuelve aca con un segundo SELECT
// contra `canchas` (design.md seccion 7, nota para frontend-developer).
app.get("/panel", requireAccess, async (c) => {
  const fecha_filtro = c.req.query("fecha") ?? new Date().toISOString().slice(0, 10);
  const estadoParam = c.req.query("estado");
  const estado_filtro = estadoParam === "confirmada" || estadoParam === "cancelada" ? estadoParam : undefined;

  const meta = { title: `Reservas — ${CLUB_NOMBRE}`, siteName: CLUB_NOMBRE };
  const usuario_email = c.get("user").email;

  try {
    const condiciones = ["fecha = ?"];
    const params: unknown[] = [fecha_filtro];
    if (estado_filtro) {
      condiciones.push("estado = ?");
      params.push(estado_filtro);
    }

    const [reservasRaw, canchas] = await Promise.all([
      all<{
        id: number;
        cancha_id: number;
        fecha: string;
        hora_inicio: string;
        hora_fin: string;
        jugador_nombre: string;
        jugador_telefono: string;
        estado: string;
      }>(
        c.env.DB,
        `SELECT id, cancha_id, fecha, hora_inicio, hora_fin, jugador_nombre, jugador_telefono, estado
         FROM reservas WHERE ${condiciones.join(" AND ")} ORDER BY hora_inicio DESC`,
        ...params,
      ),
      all<Cancha>(c.env.DB, "SELECT id, nombre FROM canchas"),
    ]);

    const nombreCancha = new Map(canchas.map((ca) => [ca.id, ca.nombre]));
    const reservas: ReservaRow[] = reservasRaw.map((r) => ({
      id: r.id,
      fecha: r.fecha,
      hora_inicio: r.hora_inicio,
      hora_fin: r.hora_fin,
      cancha_nombre: nombreCancha.get(r.cancha_id) ?? `Cancha ${r.cancha_id}`,
      jugador_nombre: r.jugador_nombre,
      jugador_telefono: r.jugador_telefono,
      estado: r.estado === "confirmada" ? "confirmada" : "cancelada",
    }));

    return c.render(
      <PanelPage club_nombre={CLUB_NOMBRE} usuario_email={usuario_email} reservas={reservas} fecha_filtro={fecha_filtro} estado_filtro={estado_filtro} />,
      { meta },
    );
  } catch {
    return c.render(
      <PanelPage club_nombre={CLUB_NOMBRE} usuario_email={usuario_email} reservas={[]} fecha_filtro={fecha_filtro} estado_filtro={estado_filtro} error />,
      { meta },
    );
  }
});

export default app;
