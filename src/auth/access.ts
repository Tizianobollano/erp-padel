// Verificacion del JWT de Cloudflare Access con WebCrypto (RS256), sin libs externas.
// Doc: developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
// El header por si solo no alcanza: se confirma firma + iss/aud/exp/nbf para evitar spoofing.
// Copiado del patron de projects/inmobiliaria/src/platform/auth/access.ts (ADR-0003 de ese
// proyecto), citado como referencia en wiki/index.md de erp-padel.

export type AccessResult = { ok: true; email: string } | { ok: false; error: string };

type Jwk = { kid: string; kty: string; n: string; e: string };
type Jwks = { keys: Jwk[] };

// Cache del JWKS por-isolate: por team domain, keys ya importadas, con TTL. Sin KV.
type CacheEntry = { keys: Map<string, CryptoKey>; expires: number };
const jwksCache = new Map<string, CacheEntry>();
const JWKS_TTL_MS = 60 * 60 * 1000; // 1h

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlToJson(s: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));
}

async function importJwks(teamDomain: string): Promise<Map<string, CryptoKey>> {
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error("jwks fetch failed");
  const jwks = (await res.json()) as Jwks;
  const keys = new Map<string, CryptoKey>();
  for (const jwk of jwks.keys) {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    keys.set(jwk.kid, key);
  }
  return keys;
}

async function getKeys(teamDomain: string, forceRefresh = false): Promise<Map<string, CryptoKey>> {
  const now = Date.now();
  const cached = jwksCache.get(teamDomain);
  if (!forceRefresh && cached && cached.expires > now) return cached.keys;
  const keys = await importJwks(teamDomain);
  jwksCache.set(teamDomain, { keys, expires: now + JWKS_TTL_MS });
  return keys;
}

export async function verifyAccessJwt(
  token: string,
  opts: { teamDomain: string; aud: string },
): Promise<AccessResult> {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "malformed token" };
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = b64urlToJson(headerB64);
    payload = b64urlToJson(payloadB64);
  } catch {
    return { ok: false, error: "invalid encoding" };
  }

  if (header.alg !== "RS256") return { ok: false, error: "unexpected alg" };
  const kid = header.kid;
  if (typeof kid !== "string") return { ok: false, error: "missing kid" };

  let keys: Map<string, CryptoKey>;
  try {
    keys = await getKeys(opts.teamDomain);
    if (!keys.has(kid)) keys = await getKeys(opts.teamDomain, true); // posible rotacion de keys
  } catch {
    return { ok: false, error: "jwks unavailable" };
  }
  const key = keys.get(kid);
  if (!key) return { ok: false, error: "unknown kid" };

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(sigB64), data);
  if (!valid) return { ok: false, error: "bad signature" };

  if (payload.iss !== `https://${opts.teamDomain}`) return { ok: false, error: "bad iss" };
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(opts.aud)) return { ok: false, error: "bad aud" };

  const nowSec = Math.floor(Date.now() / 1000);
  // exp obligatorio: un token sin exp nunca caduca. nbf queda opcional (Access no
  // siempre lo emite; exigirlo rechazaria tokens validos).
  if (typeof payload.exp !== "number") return { ok: false, error: "missing exp" };
  if (nowSec >= payload.exp) return { ok: false, error: "expired" };
  if (typeof payload.nbf === "number" && nowSec < payload.nbf) return { ok: false, error: "not yet valid" };

  const email = payload.email;
  if (typeof email !== "string" || !email) return { ok: false, error: "missing email" };
  return { ok: true, email };
}
