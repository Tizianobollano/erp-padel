import { jsxRenderer } from 'hono/jsx-renderer'
import { IconSprite } from './components/ui/IconSprite'
import { ClientScript } from './components/ClientScript'

export type Meta = {
  title: string
  description?: string
  url?: string
  ogImage?: string
  locale?: string
  siteName?: string
  /** bloques JSON-LD ya serializados (Organization, FAQPage, Product…). */
  jsonLd?: object[]
}

/**
 * Layout HTML compartido por todas las páginas. Incluye <head> con SEO/OpenGraph,
 * el styles.css compilado por Tailwind, el sprite de iconos y el ClientScript progresivo.
 * Pasá `meta` vía c.render(jsx, { meta }).
 * Sin fuente cargada (design.md seccion 3): erp-padel usa la pila de fuentes del sistema,
 * costo de carga cero -- deliberado, no un olvido.
 */
export const renderer = jsxRenderer(({ children, meta }) => {
  const m: Meta = meta ?? { title: 'IIAPIE-ui' }
  return (
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{m.title}</title>
        {m.description && <meta name="description" content={m.description} />}
        {m.url && <link rel="canonical" href={m.url} />}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={m.title} />
        {m.description && <meta property="og:description" content={m.description} />}
        {m.url && <meta property="og:url" content={m.url} />}
        {m.ogImage && <meta property="og:image" content={m.ogImage} />}
        <meta property="og:locale" content={m.locale ?? 'es_AR'} />
        {m.siteName && <meta property="og:site_name" content={m.siteName} />}
        <meta name="twitter:card" content="summary_large_image" />

        {/* JSON-LD opcional (SEO/GEO) */}
        {m.jsonLd?.map((block) => (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
        ))}

        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <IconSprite />
        {children}
        <ClientScript />
      </body>
    </html>
  )
})

// Tipado de c.render(jsx, props)
declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { meta: Meta }): Response
  }
}
