import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'

export type AccordionItem = { title: string; content: string }

/**
 * Acordeón genérico con <details> nativo (sin JS). Reutilizable para
 * especificaciones de producto, envíos, devoluciones, etc.
 */
export const Accordion: FC<{ items: AccordionItem[]; class?: string }> = ({ items, class: cls = '' }) => (
  <div class={`flex flex-col gap-2.5 ${cls}`}>
    {items.map((item) => (
      <details class="group border border-accent/15 rounded-md bg-white">
        <summary class="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-sm font-semibold text-ink">
          {item.title}
          <Icon name="chevron-down" class="text-accent transition-transform group-open:rotate-180" />
        </summary>
        <p class="px-5 pb-4 text-sm text-ink-muted/80 leading-[1.65]">{item.content}</p>
      </details>
    ))}
  </div>
)
