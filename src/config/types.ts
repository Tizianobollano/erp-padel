// Bindings y vars del Worker. Espeja wrangler.jsonc: si agregas un binding alla, agregalo aca.

export type Env = {
  DB: D1Database;

  /** "development" habilita el bypass de Access para probar el panel con `wrangler dev` local. */
  ENVIRONMENT?: string;

  /** Aplicacion de Cloudflare Access del panel privado. Ausentes en local (el bypass no los usa). */
  ACCESS_AUD?: string;
  ACCESS_TEAM_DOMAIN?: string;
};

export type Usuario = {
  email: string;
  nombre: string;
  activo: boolean;
};
