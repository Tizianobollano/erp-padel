import type { FC, PropsWithChildren } from 'hono/jsx'
import { Icon } from '../ui/Icon'

export type NavItem = { label: string; href: string; icon: string; active?: boolean; badge?: number }

type AppShellProps = PropsWithChildren<{
  brand: string
  nav: NavItem[]
  /** contenido de la topbar a la derecha (acciones). */
  topbarRight?: unknown
  title?: string
  class?: string
}>

/**
 * Layout de back-office: sidebar de navegacion + topbar + area de contenido.
 * SSR puro. En viewport angosto el sidebar colapsa a solo iconos.
 */
export const AppShell: FC<AppShellProps> = ({ brand, nav, topbarRight, title, class: cls = '', children }) => (
  <div class={`min-h-screen grid grid-cols-[64px_1fr] lg:grid-cols-[240px_1fr] bg-surface-2/40 ${cls}`}>
    {/* Sidebar */}
    <aside class="bg-surface-1 border-r border-hairline flex flex-col">
      <div class="h-16 flex items-center gap-2.5 px-4 border-b border-hairline">
        <span class="shrink-0 w-8 h-8 rounded-md bg-accent-tint text-ink font-bold text-sm flex items-center justify-center">
          {brand.slice(0, 1).toUpperCase()}
        </span>
        <span class="hidden lg:block font-bold text-ink truncate">{brand}</span>
      </div>
      <nav class="flex-1 py-3 flex flex-col gap-0.5">
        {nav.map((item) => (
          <a
            href={item.href}
            class={`relative flex items-center gap-3 mx-2 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
              item.active ? 'bg-accent/[0.08] text-accent' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <span class="text-lg shrink-0"><Icon name={item.icon} /></span>
            <span class="hidden lg:block flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span class="hidden lg:flex min-w-[18px] h-[18px] px-1 rounded-full bg-accent-tint text-ink text-[11px] font-semibold items-center justify-center">
                {item.badge}
              </span>
            ) : null}
          </a>
        ))}
      </nav>
    </aside>

    {/* Columna principal */}
    <div class="flex flex-col min-w-0">
      <header class="h-16 shrink-0 bg-surface-1 border-b border-hairline flex items-center justify-between gap-4 px-5">
        <h1 class="text-base font-bold text-ink truncate">{title}</h1>
        <div class="flex items-center gap-2">{topbarRight as any}</div>
      </header>
      <main class="flex-1 min-w-0 overflow-auto p-5">{children}</main>
    </div>
  </div>
)
