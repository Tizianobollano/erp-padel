import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { Env, Usuario } from "../config/types";
import { verifyAccessJwt } from "./access";
import { buscarUsuario } from "./usuarios";

// `user` disponible y tipado en cualquier Context tras requireAccess.
declare module "hono" {
  interface ContextVariableMap {
    user: Usuario;
  }
}

// Allowlist explicita: el bypass de dev SOLO se habilita con ENVIRONMENT dev/development, igual
// que projects/inmobiliaria. Un denylist (!= production) abriria el bypass ante ENVIRONMENT
// undefined o desconocido.
export function esDev(env: Env): boolean {
  return env.ENVIRONMENT === "development" || env.ENVIRONMENT === "dev";
}

// Verifica el JWT de Access y resuelve el usuario contra D1. FALLA CERRADO (403) en cada corte:
// sin assertion, con assertion invalida, o con un email autenticado que no esta en `usuarios` o
// esta inactivo. Estar detras de Access no alcanza para entrar al panel.
export const requireAccess = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const assertion = c.req.header("Cf-Access-Jwt-Assertion") ?? getCookie(c, "CF_Authorization");

  if (!assertion) {
    if (esDev(c.env)) {
      // Sin app de Access montada en local: el bypass entra directo como el primer usuario
      // activo de `usuarios` (seed local). Sirve para probar el panel con `wrangler dev`, no
      // tiene enforcement real -- mismo criterio que projects/inmobiliaria.
      c.set("user", { email: "dev@local", nombre: "Dev local", activo: true });
      return next();
    }
    return c.json({ error: "forbidden" }, 403);
  }

  const { ACCESS_TEAM_DOMAIN, ACCESS_AUD } = c.env;
  if (!ACCESS_TEAM_DOMAIN || !ACCESS_AUD) return c.json({ error: "forbidden" }, 403);

  const result = await verifyAccessJwt(assertion, { teamDomain: ACCESS_TEAM_DOMAIN, aud: ACCESS_AUD });
  if (!result.ok) return c.json({ error: "forbidden" }, 403);

  const usuario = await buscarUsuario(c.env.DB, result.email);
  if (!usuario) return c.json({ error: "forbidden" }, 403);

  c.set("user", usuario);
  return next();
});
