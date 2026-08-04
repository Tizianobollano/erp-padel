// Access dice QUIEN sos, la tabla `usuarios` de D1 dice SI entra (patron de
// projects/inmobiliaria ADR-0003, sin la jerarquia de roles de ese proyecto: el alcance de este
// modulo -- ver y cancelar reservas -- no distingue permisos entre usuarios del panel).

import type { Usuario } from "../config/types";
import { one } from "../db/client";

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Devuelve null si el email no esta en `usuarios` o esta inactivo: los dos casos son "no entra".
export async function buscarUsuario(db: D1Database, email: string): Promise<Usuario | null> {
  const row = await one<{ email: string; nombre: string; activo: number }>(
    db,
    "SELECT email, nombre, activo FROM usuarios WHERE email = ? AND activo = 1",
    normalizarEmail(email),
  );
  if (!row) return null;
  return { email: row.email, nombre: row.nombre, activo: true };
}
