import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'

export type Crumb = { label: string; href?: string }

/** Migas de pan para catálogo / ficha de producto. */
export const Breadcrumbs: FC<{ items: Crumb[]; class?: string }> = ({ items, class: cls = '' }) => (
  <nav aria-label="Breadcrumb" class={`flex items-center flex-wrap gap-1.5 text-[13px] text-ink-muted/60 ${cls}`}>
    {items.map((c, i) => (
      <>
        {i > 0 && <Icon name="chevron-down" class="-rotate-90 text-[11px] opacity-50" />}
        {c.href && i < items.length - 1 ? (
          <a href={c.href} class="hover:text-accent transition-colors">{c.label}</a>
        ) : (
          <span class="text-ink font-medium">{c.label}</span>
        )}
      </>
    ))}
  </nav>
)
