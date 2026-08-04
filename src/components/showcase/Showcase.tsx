import type { FC, PropsWithChildren } from 'hono/jsx'
import { Container } from '../ui/Container'

/**
 * Herramientas de DOCUMENTACIÓN para la galería de componentes (no son parte
 * de la UI de producto). Arman el layout tipo "design system docs": barra
 * superior, sidebar de categorías y marcos etiquetados alrededor de cada demo.
 */

export type ShowcaseNav = { title: string; items: { label: string; href: string }[] }[]

/** Layout de la galería: top bar + sidebar sticky + contenido. */
export const ShowcaseLayout: FC<PropsWithChildren<{ nav: ShowcaseNav; version?: string }>> = ({
  nav,
  version = '0.1.0',
  children,
}) => (
  <div class="min-h-screen bg-on-dark/40">
    {/* Top bar */}
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-accent/12">
      <Container class="flex items-center justify-between h-16">
        <a href="/" class="flex items-center gap-2.5">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-accent text-on-dark font-bold text-sm">UI</span>
          <span class="font-bold text-ink">IIAPIE-ui</span>
          <span class="text-[11px] font-medium text-accent bg-accent/10 rounded px-1.5 py-0.5">v{version}</span>
        </a>
        <nav class="flex items-center gap-5 text-sm font-medium text-ink-subtle">
          <a href="/" class="hover:text-accent transition-colors">Componentes</a>
          <a href="/demo/landing" class="hover:text-accent transition-colors">Demo landing</a>
          <a href="/demo/shop" class="hover:text-accent transition-colors">Demo shop</a>
          <a href="/demo/console" class="hover:text-accent transition-colors">Demo consola</a>
        </nav>
      </Container>
    </header>

    <Container class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 py-10">
      {/* Sidebar */}
      <aside class="hidden lg:block">
        <nav class="sticky top-24 flex flex-col gap-6 text-sm">
          {nav.map((group) => (
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wider text-ink/40 mb-2.5">{group.title}</p>
              <ul class="flex flex-col gap-1.5 border-l border-accent/15">
                {group.items.map((item) => (
                  <li>
                    <a href={item.href} class="block pl-3 -ml-px border-l-2 border-transparent text-ink-subtle hover:text-accent hover:border-accent transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <main class="min-w-0 flex flex-col gap-16">{children}</main>
    </Container>
  </div>
)

/** Encabezado de categoría (ancla del sidebar). */
export const GroupHeading: FC<{ id: string; title: string; desc?: string }> = ({ id, title, desc }) => (
  <div id={id} class="scroll-mt-24 border-b border-accent/15 pb-3">
    <h2 class="text-2xl font-bold text-ink tracking-[-0.3px]">{title}</h2>
    {desc && <p class="text-sm text-ink-muted/70 mt-1">{desc}</p>}
  </div>
)

/** Marco etiquetado alrededor de un componente. `flush` quita el padding interno
 *  (para secciones full-width); `dark` pone superficie oscura. */
export const Preview: FC<PropsWithChildren<{ id?: string; name: string; desc?: string; flush?: boolean; dark?: boolean }>> = ({
  id,
  name,
  desc,
  flush = false,
  dark = false,
  children,
}) => (
  <section id={id} class="scroll-mt-24">
    <div class="flex items-baseline justify-between gap-4 mb-3">
      <h3 class="text-sm font-bold text-ink font-mono">{name}</h3>
      {desc && <p class="text-xs text-ink-muted/55 text-right max-w-[60%]">{desc}</p>}
    </div>
    <div class={`rounded-lg border border-accent/15 overflow-hidden ${dark ? 'bg-surface-dark-2' : 'bg-white'} ${flush ? '' : 'p-6 md:p-8'}`}>
      {children}
    </div>
  </section>
)

/** Muestra de color/token. */
export const Swatch: FC<{ name: string; token: string; hex: string }> = ({ name, token, hex }) => (
  <div class="rounded-md border border-accent/10 overflow-hidden">
    <div class="h-16" style={`background:${hex}`} />
    <div class="p-3">
      <div class="text-xs font-semibold text-ink">{name}</div>
      <div class="text-[11px] text-ink-muted/55 font-mono">{token}</div>
      <div class="text-[11px] text-ink-muted/55 font-mono uppercase">{hex}</div>
    </div>
  </div>
)
